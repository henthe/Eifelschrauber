'use client'

import React, { useState, useEffect } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import BookingForm from '../components/BookingForm'
import CustomTimeSlotModal from '../components/CustomTimeSlotModal'

interface Booking {
  id: string
  startTime: string
  endTime: string
}

// Trigger redeploy
export default function Home() {
  const [selectedSlot, setSelectedSlot] = useState<{start: Date, end: Date} | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [showCustomTimeModal, setShowCustomTimeModal] = useState(false)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings')
      const data = await response.json()
      setBookings(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Fehler beim Laden der Buchungen:', error)
      setBookings([])
    }
  }

  const handleDateSelect = (selectInfo: any) => {
    const startTime = new Date(selectInfo.start)
    const endTime = new Date(selectInfo.end)
    
    // Nur Buchungen zwischen 8:00 und 19:00 erlauben
    if (startTime.getHours() < 8 || endTime.getHours() > 20) {
      alert('Buchungen sind nur zwischen 8:00 und 19:00 Uhr möglich.')
      return
    }

    // Überprüfen, ob die ausgewählte Zeit in der Vergangenheit liegt
    if (startTime < new Date()) {
      alert('Buchungen in der Vergangenheit sind nicht möglich.')
      return
    }

    // Überprüfen, ob die Buchung mit bestehenden Buchungen überlappt
    const isOverlapping = bookings.some(booking => {
      const bookingStart = new Date(booking.startTime)
      const bookingEnd = new Date(booking.endTime)
      return (
        (startTime >= bookingStart && startTime < bookingEnd) ||
        (endTime > bookingStart && endTime <= bookingEnd) ||
        (startTime <= bookingStart && endTime >= bookingEnd)
      )
    })

    if (isOverlapping) {
      alert('Dieser Zeitraum ist bereits gebucht.')
      return
    }

    setSelectedSlot({
      start: startTime,
      end: endTime
    })
  }

  const handleCustomTimeSelect = (start: Date, end: Date) => {
    // Überprüfen, ob die Buchung mit bestehenden Buchungen überlappt
    const isOverlapping = bookings.some(booking => {
      const bookingStart = new Date(booking.startTime)
      const bookingEnd = new Date(booking.endTime)
      return (
        (start >= bookingStart && start < bookingEnd) ||
        (end > bookingStart && end <= bookingEnd) ||
        (start <= bookingStart && end >= bookingEnd)
      )
    })

    if (isOverlapping) {
      alert('Dieser Zeitraum ist bereits gebucht.')
      return
    }

    setSelectedSlot({
      start,
      end
    })
  }

  return (
    <div className="max-w-6xl mx-auto">
      <section className="mb-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Hebebühne Vermietung</h2>
        <p className="text-lg mb-2">Preis: 50€ pro Stunde</p>
        <p className="text-gray-600">Verfügbar von 08:00 bis 20:00 Uhr</p>
        <button
          onClick={() => setShowCustomTimeModal(true)}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Zeitslot manuell auswählen
        </button>
      </section>

      <div className="relative">
        <div className="calendar-container">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            weekends={true}
            slotMinTime="08:00:00"
            slotMaxTime="20:00:00"
            allDaySlot={false}
            slotDuration="01:00:00"
            snapDuration="01:00:00"
            height="auto"
            selectConstraint={{
              startTime: '08:00:00',
              endTime: '20:00:00',
              dows: [0, 1, 2, 3, 4, 5, 6]
            }}
            selectOverlap={false}
            select={handleDateSelect}
            events={bookings.map(booking => ({
              title: 'Gebucht',
              start: booking.startTime,
              end: booking.endTime,
              backgroundColor: '#ef4444',
              borderColor: '#dc2626',
              display: 'block',
              overlap: false
            }))}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'timeGridWeek,timeGridDay'
            }}
            locale="de"
          />
        </div>

        {selectedSlot && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="p-6">
                <BookingForm
                  startTime={selectedSlot.start}
                  endTime={selectedSlot.end}
                  onCancel={() => setSelectedSlot(null)}
                  onBookingComplete={() => {
                    setSelectedSlot(null)
                    fetchBookings()
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {showCustomTimeModal && (
          <CustomTimeSlotModal
            onClose={() => setShowCustomTimeModal(false)}
            onSelect={(start, end) => {
              setShowCustomTimeModal(false)
              handleCustomTimeSelect(start, end)
            }}
          />
        )}
      </div>
    </div>
  )
} 