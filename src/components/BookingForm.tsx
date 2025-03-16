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
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Buchung bestätigen</h3>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
      
      <div className="mb-4">
        <p>Start: {startTime.toLocaleString('de-DE')}</p>
        <p>Ende: {endTime.toLocaleString('de-DE')}</p>
        <p className="font-bold mt-2">Gesamtpreis: {totalPrice}€</p>
      </div>

      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            {...register('name', { required: 'Name ist erforderlich' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">E-Mail</label>
          <input
            type="email"
            {...register('email', { 
              required: 'E-Mail ist erforderlich',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Ungültige E-Mail-Adresse'
              }
            })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Handynummer</label>
          <input
            type="tel"
            {...register('phone', { required: 'Telefonnummer ist erforderlich' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
        </div>

        {isValid && (
          <div className="mt-6">
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
                  <p>PayPal wird geladen...</p>
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

        <div className="flex justify-end space-x-4 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Abbrechen
          </button>
        </div>
      </form>
    </div>
  )
} 