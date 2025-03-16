import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await sql`DELETE FROM bookings WHERE id = ${params.id}`
    return NextResponse.json({ message: 'Buchung erfolgreich gelöscht' })
  } catch (error) {
    console.error('Fehler beim Löschen der Buchung:', error)
    return NextResponse.json(
      { error: 'Fehler beim Löschen der Buchung' },
      { status: 500 }
    )
  }
} 