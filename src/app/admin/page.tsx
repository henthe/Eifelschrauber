'use client'

import React, { useState, useEffect } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

interface Booking {
  id: string
  startTime: string
  endTime: string
  name: string
  email: string
  phone: string
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      fetchBookings()
    }
  }, [isAuthenticated])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()
      console.log('Login Response:', data)

      if (data.success) {
        setIsAuthenticated(true)
      } else {
        alert(`Falsches Passwort. ${data.debug || ''}`)
      }
    } catch (error) {
      console.error('Login-Fehler:', error)
      alert('Ein Fehler ist aufgetreten')
    }
  }

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings')
      const data = await response.json()
      setBookings(data)
    } catch (error) {
      console.error('Fehler beim Laden der Buchungen:', error)
    }
  }

  const handleDateSelect = async (selectInfo: any) => {
    const startTime = new Date(selectInfo.start)
    const endTime = new Date(selectInfo.end)
    
    if (startTime.getHours() < 6 || endTime.getHours() > 22) {
      alert('Buchungen sind nur zwischen 06:00 und 22:00 Uhr möglich.')
      return
    }

    if (startTime.getDay() === 0 || endTime.getDay() === 0) {
      alert('Buchungen sind nur von Montag bis Samstag möglich.')
      return
    }

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

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          name: 'ADMIN-BLOCK',
          email: 'admin@example.com',
          phone: '0000',
          price: 0
        }),
      })

      if (!response.ok) {
        throw new Error('Fehler beim Speichern der Buchung')
      }

      fetchBookings()
    } catch (error) {
      console.error('Fehler:', error)
      alert('Fehler beim Speichern der Buchung')
    }
  }

  const handleEventClick = (clickInfo: any) => {
    const eventStart = new Date(clickInfo.event.start).getTime()
    const eventEnd = new Date(clickInfo.event.end).getTime()
    
    const booking = bookings.find(b => {
      const bookingStart = new Date(b.startTime).getTime()
      const bookingEnd = new Date(b.endTime).getTime()
      // Toleranz von 1 Sekunde für Zeitvergleiche
      return Math.abs(bookingStart - eventStart) < 1000 && Math.abs(bookingEnd - eventEnd) < 1000
    })
    
    if (booking) {
      setSelectedBooking(booking)
      setShowDeleteConfirm(true)
    }
  }

  const handleDeleteBooking = async () => {
    if (!selectedBooking) return

    try {
      const response = await fetch(`/api/bookings/${selectedBooking.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Fehler beim Löschen der Buchung')
      }

      setShowDeleteConfirm(false)
      setSelectedBooking(null)
      fetchBookings()
    } catch (error) {
      console.error('Fehler:', error)
      alert('Fehler beim Löschen der Buchung')
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Admin Login
            </h2>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <input type="hidden" name="remember" value="true" />
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="password" className="sr-only">Passwort</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Admin Passwort"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Login
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <button
          onClick={() => setIsAuthenticated(false)}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
        >
          Logout
        </button>
      </div>

      <div className="calendar-container">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          hiddenDays={[0]}
          slotMinTime="06:00:00"
          slotMaxTime="22:00:00"
          allDaySlot={false}
          slotDuration="01:00:00"
          snapDuration="01:00:00"
          height="auto"
          selectConstraint={{
            startTime: '06:00:00',
            endTime: '22:00:00',
            dows: [1, 2, 3, 4, 5, 6]
          }}
          select={handleDateSelect}
          eventClick={handleEventClick}
          events={bookings.map(booking => ({
            title: booking.name === 'ADMIN-BLOCK' ? 'BLOCKIERT' : `${booking.name} - ${booking.phone}`,
            start: booking.startTime,
            end: booking.endTime,
            backgroundColor: booking.name === 'ADMIN-BLOCK' ? '#4B5563' : '#ef4444',
            borderColor: booking.name === 'ADMIN-BLOCK' ? '#374151' : '#dc2626',
            display: 'block',
            overlap: false
          }))}
          headerToolbar={{
            left: 'prev,next heute',
            center: 'title',
            right: 'timeGridWeek,timeGridDay'
          }}
          buttonText={{
            today: 'Heute',
            week: 'Woche',
            day: 'Tag'
          }}
          locale="de"
        />
      </div>

      {showDeleteConfirm && selectedBooking && (
        <div className="admin-delete-dialog">
          <div className="admin-delete-dialog-overlay">
            <div className="admin-delete-dialog-content p-6">
              <h3 className="text-lg font-bold mb-4">Buchung löschen</h3>
              <div className="mb-4">
                <p><strong>Name:</strong> {selectedBooking.name}</p>
                <p><strong>Telefon:</strong> {selectedBooking.phone}</p>
                <p><strong>E-Mail:</strong> {selectedBooking.email}</p>
                <p><strong>Von:</strong> {new Date(selectedBooking.startTime).toLocaleString('de-DE')}</p>
                <p><strong>Bis:</strong> {new Date(selectedBooking.endTime).toLocaleString('de-DE')}</p>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleDeleteBooking}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Löschen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 