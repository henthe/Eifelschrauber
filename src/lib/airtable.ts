import Airtable from 'airtable';

// Konfiguriere Airtable mit expliziten Optionen
const airtableConfig = {
  apiKey: process.env.AIRTABLE_API_KEY,
  baseId: process.env.AIRTABLE_BASE_ID,
  tableName: process.env.AIRTABLE_TABLE_NAME,
  apiVersion: 'v0'
};

// Debug-Logging
console.log('Airtable Konfiguration:', {
  baseId: airtableConfig.baseId,
  tableName: airtableConfig.tableName,
  hasApiKey: !!airtableConfig.apiKey,
  apiVersion: airtableConfig.apiVersion
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

const base = new Airtable({ apiKey: airtableConfig.apiKey }).base(airtableConfig.baseId || '');
const table = base(airtableConfig.tableName || 'Bookings');

async function fetchFromAirtable(endpoint: string, options: RequestInit = {}) {
  const baseUrl = `https://api.airtable.com/v0/${airtableConfig.baseId}/${airtableConfig.tableName}`;
  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${airtableConfig.apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Airtable API Fehler');
  }

  return response.json();
}

export async function getBookings() {
  try {
    const formula = encodeURIComponent('AND(startTime >= TODAY())');
    const response = await fetchFromAirtable(`?filterByFormula=${formula}&sort%5B0%5D%5Bfield%5D=startTime&sort%5B0%5D%5Bdirection%5D=asc`);
    
    return response.records.map((record: any) => ({
      id: record.id,
      startTime: record.fields.startTime,
      endTime: record.fields.endTime,
      name: record.fields.name,
      email: record.fields.email,
      phone: record.fields.phone,
      price: record.fields.price
    }));
  } catch (error) {
    console.error('Fehler beim Abrufen der Buchungen:', error);
    throw error;
  }
}

export async function createBooking(booking: Omit<Booking, 'id'>) {
  try {
    const response = await fetchFromAirtable('', {
      method: 'POST',
      body: JSON.stringify({
        records: [{
          fields: {
            startTime: booking.startTime,
            endTime: booking.endTime,
            name: booking.name,
            email: booking.email,
            phone: booking.phone,
            price: booking.price
          }
        }]
      })
    });

    return response.records[0];
  } catch (error) {
    console.error('Fehler beim Erstellen der Buchung:', error);
    throw error;
  }
}

export async function checkOverlap(startTime: string, endTime: string) {
  try {
    const formula = encodeURIComponent(`OR(AND(IS_BEFORE({startTime}, "${endTime}"),IS_AFTER({endTime}, "${startTime}")))`);
    const response = await fetchFromAirtable(`?filterByFormula=${formula}`);
    return response.records.length > 0;
  } catch (error) {
    console.error('Fehler beim Prüfen der Überschneidungen:', error);
    throw error;
  }
}

export async function deleteBooking(id: string) {
  try {
    const response = await fetchFromAirtable(`/${id}`, {
      method: 'DELETE',
    });
    return response;
  } catch (error) {
    console.error('Fehler beim Löschen der Buchung:', error);
    throw error;
  }
} 