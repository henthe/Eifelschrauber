import { NextResponse } from 'next/server'
import { deleteBooking } from '../../../../lib/airtable'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await deleteBooking(params.id)
    return NextResponse.json({ message: 'Buchung erfolgreich gelöscht' })
  } catch (error) {
    console.error('Fehler beim Löschen der Buchung:', error)
    return NextResponse.json(
      { error: 'Fehler beim Löschen der Buchung' },
      { status: 500 }
    )
  }
} 