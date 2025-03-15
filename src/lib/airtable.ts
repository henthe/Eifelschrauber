import Airtable from 'airtable';

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID || '');
const table = base(process.env.AIRTABLE_TABLE_NAME || 'Bookings');

// Debug-Logging
console.log('Airtable Konfiguration:', {
  baseId: process.env.AIRTABLE_BASE_ID,
  tableName: process.env.AIRTABLE_TABLE_NAME,
  hasApiKey: !!process.env.AIRTABLE_API_KEY
});

export interface Booking {
  id: string;
  startTime: string;
  endTime: string;
  name: string;
  email: string;
  phone: string;
  price: number;
}

export async function createBooking(booking: Omit<Booking, 'id'>) {
  try {
    const record = await table.create([
      {
        fields: {
          startTime: booking.startTime,
          endTime: booking.endTime,
          name: booking.name,
          email: booking.email,
          phone: booking.phone,
          price: booking.price
        },
      },
    ]);

    return record[0];
  } catch (error) {
    console.error('Fehler beim Erstellen der Buchung:', error);
    throw error;
  }
}

export async function getBookings() {
  try {
    const records = await table
      .select({
        filterByFormula: 'AND(startTime >= TODAY())',
        sort: [{ field: 'startTime', direction: 'asc' }],
      })
      .all();

    return records.map((record) => ({
      id: record.id,
      startTime: record.get('startTime') as string,
      endTime: record.get('endTime') as string,
      name: record.get('name') as string,
      email: record.get('email') as string,
      phone: record.get('phone') as string,
      price: record.get('price') as number
    }));
  } catch (error) {
    console.error('Fehler beim Abrufen der Buchungen:', error);
    throw error;
  }
}

export async function checkOverlap(startTime: string, endTime: string) {
  try {
    const records = await table
      .select({
        filterByFormula: `OR(
          AND(
            IS_BEFORE({startTime}, "${endTime}"),
            IS_AFTER({endTime}, "${startTime}")
          )
        )`,
      })
      .all();

    return records.length > 0;
  } catch (error) {
    console.error('Fehler beim Prüfen der Überschneidungen:', error);
    throw error;
  }
} 