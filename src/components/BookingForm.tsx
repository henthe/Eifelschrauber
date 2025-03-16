'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'

interface BookingFormProps {
  startTime: Date
  endTime: Date
  onCancel: () => void
  onBookingComplete: () => void
}

interface FormData {
  name: string
  email: string
  phone: string
}

export default function BookingForm({ startTime, endTime, onCancel, onBookingComplete }: BookingFormProps) {
  const { register, handleSubmit, watch, formState: { errors, isValid } } = useForm<FormData>({ mode: 'onChange' })
  const [formData, setFormData] = useState<FormData | null>(null)
  const [paypalLoading, setPaypalLoading] = useState(true)
  
  const hours = Math.ceil((endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60))
  const totalPrice = hours * 18 // 18€ pro Stunde

  // Beobachte die Formularfelder
  const watchedFields = watch(['name', 'email', 'phone'])

  const handlePayPalSuccess = async (data: FormData) => {
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          name: data.name,
          email: data.email,
          phone: data.phone,
          price: totalPrice
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Fehler beim Speichern der Buchung')
      }

      onBookingComplete()
    } catch (error) {
      console.error('Fehler beim Speichern der Buchung:', error)
      alert('Fehler beim Speichern der Buchung. Bitte versuchen Sie es später erneut.')
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="card-title">Buchung bestätigen</h3>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-500 transition-colors"
        >
          <span className="sr-only">Schließen</span>
          ✕
        </button>
      </div>
      
      <div className="space-y-3 mb-6">
        <p><strong className="font-medium">Start:</strong> {startTime.toLocaleString('de-DE')}</p>
        <p><strong className="font-medium">Ende:</strong> {endTime.toLocaleString('de-DE')}</p>
        <p className="text-lg font-semibold text-blue-600 mt-4">Gesamtpreis: {totalPrice}€</p>
      </div>

      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        <div className="form-group">
          <label className="form-label">Name</label>
          <input
            type="text"
            {...register('name', { required: 'Name ist erforderlich' })}
            className="form-input"
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
        </div>

        <div className="form-group">
          <label className="form-label">E-Mail</label>
          <input
            type="email"
            {...register('email', { 
              required: 'E-Mail ist erforderlich',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Ungültige E-Mail-Adresse'
              }
            })}
            className="form-input"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
        </div>

        <div className="form-group">
          <label className="form-label">Handynummer</label>
          <input
            type="tel"
            {...register('phone', { required: 'Telefonnummer ist erforderlich' })}
            className="form-input"
          />
          {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
        </div>

        {isValid && (
          <div className="mt-8">
            <p className="text-sm text-gray-600 mb-4">Bitte fahren Sie mit der PayPal-Zahlung fort:</p>
            <PayPalScriptProvider options={{ 
              clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '',
              currency: "EUR",
              intent: "capture",
              "disable-funding": "paylater,card,credit,sepa,sofort",
              "enable-funding": "paypal"
            }}>
              {paypalLoading && (
                <div className="text-center py-4">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                  <p className="mt-2 text-gray-600">PayPal wird geladen...</p>
                </div>
              )}
              <PayPalButtons
                style={{
                  layout: "vertical",
                  shape: "rect",
                  color: "blue",
                  label: "paypal"
                }}
                onInit={() => setPaypalLoading(false)}
                forceReRender={[totalPrice, ...watchedFields]}
                createOrder={(data, actions) => {
                  if (!isValid) {
                    return Promise.reject('Formular ist nicht vollständig ausgefüllt')
                  }
                  const formValues = {
                    name: (document.querySelector('input[name="name"]') as HTMLInputElement).value,
                    email: (document.querySelector('input[name="email"]') as HTMLInputElement).value,
                    phone: (document.querySelector('input[name="phone"]') as HTMLInputElement).value,
                  }
                  return actions.order.create({
                    intent: "CAPTURE",
                    purchase_units: [{
                      amount: {
                        currency_code: "EUR",
                        value: totalPrice.toString(),
                        breakdown: {
                          item_total: {
                            currency_code: "EUR",
                            value: totalPrice.toString()
                          }
                        }
                      },
                      description: `Hebebühne Vermietung - ${startTime.toLocaleString('de-DE')} bis ${endTime.toLocaleString('de-DE')}`,
                      custom_id: JSON.stringify(formValues),
                      items: [{
                        name: "Hebebühne Vermietung",
                        description: `${startTime.toLocaleString('de-DE')} bis ${endTime.toLocaleString('de-DE')}`,
                        unit_amount: {
                          currency_code: "EUR",
                          value: "18.00"
                        },
                        quantity: hours.toString()
                      }]
                    }]
                  })
                }}
                onApprove={async (data, actions) => {
                  if (actions.order) {
                    const formValues = {
                      name: (document.querySelector('input[name="name"]') as HTMLInputElement).value,
                      email: (document.querySelector('input[name="email"]') as HTMLInputElement).value,
                      phone: (document.querySelector('input[name="phone"]') as HTMLInputElement).value,
                    }
                    await actions.order.capture()
                    await handlePayPalSuccess(formValues)
                  }
                }}
              />
            </PayPalScriptProvider>
          </div>
        )}

        <div className="flex justify-end gap-4 mt-8">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-outline"
          >
            Abbrechen
          </button>
        </div>
      </form>
    </div>
  )
} 