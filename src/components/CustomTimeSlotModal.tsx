import React, { useState } from 'react';

interface CustomTimeSlotModalProps {
  onClose: () => void;
  onSelect: (start: Date, end: Date) => void;
}

export default function CustomTimeSlotModal({ onClose, onSelect }: CustomTimeSlotModalProps) {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('09:00');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const start = new Date(`${selectedDate}T${startTime}:00`);
    const end = new Date(`${selectedDate}T${endTime}:00`);
    
    if (start >= end) {
      alert('Die Endzeit muss nach der Startzeit liegen.');
      return;
    }

    if (start.getHours() < 8 || end.getHours() > 19) {
      alert('Buchungen sind nur zwischen 8:00 und 19:00 Uhr möglich.');
      return;
    }

    onSelect(start, end);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content p-6 max-w-md">
        <h3 className="text-xl font-bold mb-4">Zeitslot auswählen</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Datum
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Startzeit
              </label>
              <select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                {Array.from({ length: 12 }, (_, i) => i + 8).map((hour) => (
                  <option key={hour} value={`${hour.toString().padStart(2, '0')}:00`}>
                    {hour}:00
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Endzeit
              </label>
              <select
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                {Array.from({ length: 12 }, (_, i) => i + 9).map((hour) => (
                  <option key={hour} value={`${hour.toString().padStart(2, '0')}:00`}>
                    {hour}:00
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
            >
              Auswählen
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 