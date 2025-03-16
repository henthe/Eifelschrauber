'use client'

import React, { useState, useEffect, useRef } from 'react'
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
  const [showDatePicker, setShowDatePicker] = useState(false)
  const calendarRef = useRef<any>(null)
  const [initialView, setInitialView] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768 ? 'timeGridDay' : 'timeGridWeek'
    }
    return 'timeGridWeek'
  })

  useEffect(() => {
    fetchBookings()
    
    const handleResize = () => {
      const newView = window.innerWidth < 768 ? 'timeGridDay' : 'timeGridWeek'
      setInitialView(newView)
      if (calendarRef.current) {
        const api = calendarRef.current.getApi()
        if (api.view.type !== newView) {
          api.changeView(newView)
        }
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings')
      const data = await response.json()
      console.log('Buchungen geladen:', data)
      setBookings(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Fehler beim Laden der Buchungen:', error)
      setBookings([])
    }
  }

  const handleDateSelect = (selectInfo: any) => {
    const startTime = new Date(selectInfo.start)
    const endTime = new Date(selectInfo.end)
    
    // Nur Buchungen zwischen 6:00 und 22:00 erlauben
    if (startTime.getHours() < 6 || endTime.getHours() > 22) {
      alert('Buchungen sind nur zwischen 06:00 und 22:00 Uhr möglich.')
      return
    }

    // Überprüfen ob es ein Sonntag ist
    if (startTime.getDay() === 0 || endTime.getDay() === 0) {
      alert('Buchungen sind nur von Montag bis Samstag möglich.')
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

  const handleWeekSelect = (date: Date) => {
    calendarRef.current?.getApi().gotoDate(date);
    setShowDatePicker(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <section className="card mb-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-gray-900">Hebebühne Vermietung</h2>
            <p className="text-xl font-medium text-gray-700">Preis: 18€ pro Stunde</p>
            <p className="text-gray-600">Verfügbar von 06:00 bis 22:00 Uhr (Montag bis Samstag)</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <button
                onClick={() => setShowCustomTimeModal(true)}
                className="btn btn-primary w-full sm:w-auto"
              >
                Zeitslot manuell auswählen
              </button>
              <button
                onClick={() => setShowDatePicker(true)}
                className="btn btn-outline w-full sm:w-auto flex items-center justify-center gap-2"
              >
                <span>Andere Woche anzeigen</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </section>

        <div className="calendar-container">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView={initialView}
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
            selectOverlap={false}
            select={handleDateSelect}
            dateClick={(info) => {
              const clickedDate = new Date(info.date);
              const endDate = new Date(clickedDate);
              endDate.setHours(clickedDate.getHours() + 1);
              handleDateSelect({
                start: clickedDate,
                end: endDate
              });
            }}
            events={bookings.map(booking => ({
              title: '',
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
            buttonText={{
              today: 'Heute',
              week: 'Wochen',
              day: 'Tage'
            }}
            locale="de"
            stickyHeaderDates={true}
            expandRows={true}
            contentHeight="auto"
            handleWindowResize={true}
            eventDisplay="block"
            slotLabelFormat={{
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }}
            longPressDelay={50}
            selectLongPressDelay={50}
            eventLongPressDelay={50}
            selectMinDistance={5}
            unselectAuto={false}
            businessHours={{
              startTime: '06:00',
              endTime: '22:00',
              daysOfWeek: [1, 2, 3, 4, 5, 6]
            }}
            editable={false}
            droppable={false}
            slotEventOverlap={false}
            views={{
              timeGridWeek: {
                titleFormat: { year: 'numeric', month: 'short', day: 'numeric' },
                dayHeaderFormat: { weekday: 'short', day: 'numeric' },
                slotDuration: '01:00:00',
                slotLabelInterval: '01:00',
              },
              timeGridDay: {
                titleFormat: { year: 'numeric', month: 'long', day: 'numeric' },
                slotDuration: '01:00:00',
                slotLabelInterval: '01:00',
              }
            }}
          />
        </div>

        {selectedSlot && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2 className="card-title mb-4">Zeitslot buchen</h2>
              <p className="text-gray-600 mb-6">
                Zeit: {selectedSlot.start.toLocaleString()} - {selectedSlot.end.toLocaleString()}
              </p>
              <BookingForm
                startTime={selectedSlot.start}
                endTime={selectedSlot.end}
                onCancel={() => setSelectedSlot(null)}
                onBookingComplete={() => {
                  setSelectedSlot(null);
                  fetchBookings();
                }}
              />
            </div>
          </div>
        )}

        {showCustomTimeModal && (
          <div className="modal-overlay" onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCustomTimeModal(false);
            }
          }}>
            <CustomTimeSlotModal
              onClose={() => setShowCustomTimeModal(false)}
              onSelect={(start, end) => {
                setShowCustomTimeModal(false);
                handleCustomTimeSelect(start, end);
              }}
            />
          </div>
        )}

        {showDatePicker && (
          <div className="modal-overlay" onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDatePicker(false);
            }
          }}>
            <div className="modal-content p-4" style={{ maxWidth: '300px' }}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Woche auswählen</h3>
                <button
                  onClick={() => setShowDatePicker(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="relative">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      const today = new Date();
                      handleWeekSelect(today);
                    }}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Heute
                  </button>
                  <button
                    onClick={() => {
                      const nextWeek = new Date();
                      nextWeek.setDate(nextWeek.getDate() + 7);
                      handleWeekSelect(nextWeek);
                    }}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Nächste Woche
                  </button>
                  <button
                    onClick={() => {
                      const nextTwoWeeks = new Date();
                      nextTwoWeeks.setDate(nextTwoWeeks.getDate() + 14);
                      handleWeekSelect(nextTwoWeeks);
                    }}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    In 2 Wochen
                  </button>
                  <button
                    onClick={() => {
                      const nextMonth = new Date();
                      nextMonth.setDate(nextMonth.getDate() + 30);
                      handleWeekSelect(nextMonth);
                    }}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    In 1 Monat
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 