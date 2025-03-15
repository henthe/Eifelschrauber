import { NextResponse } from 'next/server'
import { createBooking, getBookings, checkOverlap } from '../../../lib/airtable'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { startTime, endTime, name, email, phone, price } = body

    // Überprüfen, ob der Zeitslot bereits gebucht ist
    const isOverlapping = await checkOverlap(startTime, endTime)

    if (isOverlapping) {
      return NextResponse.json(
        { error: 'Dieser Zeitslot ist bereits gebucht.' },
        { status: 409 }
      )
    }

    // Neue Buchung erstellen
    const booking = await createBooking({
      startTime,
      endTime,
      name,
      email,
      phone,
      price
    })

    return NextResponse.json(booking)
  } catch (error) {
    console.error('Fehler beim Erstellen der Buchung:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const bookings = await getBookings()
    return NextResponse.json(bookings)
  } catch (error: any) {
    console.error('Fehler beim Abrufen der Buchungen:', error)
    // Wenn die Tabelle nicht existiert, geben wir ein leeres Array zurück
    if (error.error === 'NOT_FOUND') {
      return NextResponse.json([])
    }
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
} 