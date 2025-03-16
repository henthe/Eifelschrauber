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
  const [manualDate, setManualDate] = useState('')
  const [manualStartTime, setManualStartTime] = useState('')
  const [manualEndTime, setManualEndTime] = useState('')

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
    // Standardwerte setzen
    const now = new Date()
    setManualDate(now.toISOString().split('T')[0])
    setManualStartTime('09:00')
    setManualEndTime('10:00')
  }

  const handleManualSubmit = () => {
    if (!manualDate || !manualStartTime || !manualEndTime) {
      alert('Bitte füllen Sie alle Felder aus.')
      return
    }

    const startDateTime = new Date(`${manualDate}T${manualStartTime}:00`)
    const endDateTime = new Date(`${manualDate}T${manualEndTime}:00`)

    // Validierungen
    if (startDateTime >= endDateTime) {
      alert('Die Startzeit muss vor der Endzeit liegen.')
      return
    }

    if (startDateTime.getHours() < 6 || endDateTime.getHours() > 22) {
      alert('Buchungen sind nur zwischen 06:00 und 22:00 Uhr möglich.')
      return
    }

    if (startDateTime.getDay() === 0 || endDateTime.getDay() === 0) {
      alert('Buchungen sind nur von Montag bis Samstag möglich.')
      return
    }

    const isOverlapping = bookings.some(booking => {
      const bookingStart = new Date(booking.startTime)
      const bookingEnd = new Date(booking.endTime)
      return (
        (startDateTime >= bookingStart && startDateTime < bookingEnd) ||
        (endDateTime > bookingStart && endDateTime <= bookingEnd) ||
        (startDateTime <= bookingStart && endDateTime >= bookingEnd)
      )
    })

    if (isOverlapping) {
      alert('Dieser Zeitraum ist bereits gebucht.')
      return
    }

    setSelectedTimeSlot({
      start: startDateTime,
      end: endDateTime
    })
    setShowTimeSlotModal(false)
    setShowBookingForm(true)
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="card max-w-md w-full space-y-8">
          <div>
            <h2 className="text-center text-3xl font-bold text-gray-900">
              Admin Login
            </h2>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <input type="hidden" name="remember" value="true" />
            <div>
              <label htmlFor="password" className="sr-only">Passwort</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="form-input"
                placeholder="Admin Passwort"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <button
                type="submit"
                className="btn btn-primary w-full"
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="card-header mb-8">
          <h1 className="card-title">Admin Dashboard</h1>
          <div className="flex gap-4">
            <button
              onClick={handleManualTimeSlot}
              className="btn btn-primary"
            >
              Zeitslot manuell wählen
            </button>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="btn btn-outline"
            >
              Logout
            </button>
          </div>
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
              left: 'prev,next today',
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
            <div className="modal-content">
              <h2 className="card-title mb-4">Zeitslot buchen</h2>
              <p className="text-gray-600 mb-6">
                Zeit: {selectedTimeSlot.start.toLocaleString()} - {selectedTimeSlot.end.toLocaleString()}
              </p>
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">E-Mail</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Telefon</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="flex gap-4 mt-8">
                  <button
                    type="submit"
                    className="btn btn-primary flex-1"
                  >
                    Mit Daten speichern
                  </button>
                  <button
                    type="button"
                    onClick={handleQuickBlock}
                    className="btn btn-secondary flex-1"
                  >
                    Ohne Daten blockieren
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowBookingForm(false)
                      setSelectedTimeSlot(null)
                    }}
                    className="btn btn-outline"
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
            <div className="modal-content">
              <h2 className="card-title mb-4">Zeitslot manuell wählen</h2>
              <div className="space-y-6">
                <div className="form-group">
                  <label className="form-label">Datum</label>
                  <input
                    type="date"
                    value={manualDate}
                    onChange={(e) => setManualDate(e.target.value)}
                    className="form-input"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Startzeit</label>
                  <input
                    type="time"
                    value={manualStartTime}
                    onChange={(e) => setManualStartTime(e.target.value)}
                    className="form-input"
                    min="06:00"
                    max="21:00"
                    step="3600"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Endzeit</label>
                  <input
                    type="time"
                    value={manualEndTime}
                    onChange={(e) => setManualEndTime(e.target.value)}
                    className="form-input"
                    min="07:00"
                    max="22:00"
                    step="3600"
                  />
                </div>
                <div className="flex gap-4 mt-8">
                  <button
                    onClick={handleManualSubmit}
                    className="btn btn-primary flex-1"
                  >
                    Weiter
                  </button>
                  <button
                    onClick={() => setShowTimeSlotModal(false)}
                    className="btn btn-outline"
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showDeleteConfirm && selectedBooking && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="flex justify-between items-center mb-6">
                <h3 className="card-title">Buchung löschen</h3>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="text-gray-400 hover:text-gray-500 transition-colors"
                >
                  <span className="sr-only">Schließen</span>
                  ✕
                </button>
              </div>
              <div className="space-y-3 mb-6">
                <p><strong className="font-medium">Name:</strong> {selectedBooking.name}</p>
                <p><strong className="font-medium">Telefon:</strong> {selectedBooking.phone}</p>
                <p><strong className="font-medium">E-Mail:</strong> {selectedBooking.email}</p>
                <p><strong className="font-medium">Von:</strong> {new Date(selectedBooking.startTime).toLocaleString('de-DE')}</p>
                <p><strong className="font-medium">Bis:</strong> {new Date(selectedBooking.endTime).toLocaleString('de-DE')}</p>
              </div>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="btn btn-outline"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleDeleteBooking}
                  className="btn btn-danger"
                >
                  Löschen
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 