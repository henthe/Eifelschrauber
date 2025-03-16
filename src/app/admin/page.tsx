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
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [showTimeSlotModal, setShowTimeSlotModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  })
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{
    start: Date;
    end: Date;
  } | null>(null)

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
    setSelectedTimeSlot({
      start: selectInfo.start,
      end: selectInfo.end
    })
    setShowBookingForm(true)
  }

  const handleManualTimeSlot = () => {
    setShowTimeSlotModal(true)
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTimeSlot) return

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startTime: selectedTimeSlot.start.toISOString(),
          endTime: selectedTimeSlot.end.toISOString(),
          name: formData.name || 'ADMIN-BLOCK',
          email: formData.email || 'admin@example.com',
          phone: formData.phone || '0000',
          price: 0
        }),
      })

      if (!response.ok) {
        throw new Error('Fehler beim Speichern der Buchung')
      }

      setShowBookingForm(false)
      setFormData({ name: '', email: '', phone: '' })
      setSelectedTimeSlot(null)
      fetchBookings()
    } catch (error) {
      console.error('Fehler:', error)
      alert('Fehler beim Speichern der Buchung')
    }
  }

  const handleQuickBlock = async () => {
    if (!selectedTimeSlot) return

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startTime: selectedTimeSlot.start.toISOString(),
          endTime: selectedTimeSlot.end.toISOString(),
          name: 'ADMIN-BLOCK',
          email: 'admin@example.com',
          phone: '0000',
          price: 0
        }),
      })

      if (!response.ok) {
        throw new Error('Fehler beim Speichern der Buchung')
      }

      setShowBookingForm(false)
      setSelectedTimeSlot(null)
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
        <div className="flex gap-4">
          <button
            onClick={handleManualTimeSlot}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Zeitslot manuell wählen
          </button>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="calendar-container relative z-0">
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

      {showBookingForm && selectedTimeSlot && (
        <div className="modal-overlay">
          <div className="modal-content p-6">
            <h2 className="text-xl font-bold mb-4">Zeitslot buchen</h2>
            <p className="mb-4">
              Zeit: {selectedTimeSlot.start.toLocaleString()} - {selectedTimeSlot.end.toLocaleString()}
            </p>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">E-Mail</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Telefon</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Mit Daten speichern
                </button>
                <button
                  type="button"
                  onClick={handleQuickBlock}
                  className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                >
                  Ohne Daten blockieren
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowBookingForm(false)
                    setSelectedTimeSlot(null)
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  Abbrechen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTimeSlotModal && (
        <div className="modal-overlay">
          <div className="modal-content p-6">
            <h2 className="text-xl font-bold mb-4">Zeitslot manuell wählen</h2>
            <p className="text-gray-600 mb-4">
              Diese Funktion wird noch implementiert.
            </p>
            <button
              onClick={() => setShowTimeSlotModal(false)}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Schließen
            </button>
          </div>
        </div>
      )}

      {showDeleteConfirm && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ zIndex: 100000 }}>
          <div 
            className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl" 
            style={{ position: 'relative', zIndex: 100001 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Buchung löschen</h3>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                ✕
              </button>
            </div>
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
      )}
    </div>
  )
} 