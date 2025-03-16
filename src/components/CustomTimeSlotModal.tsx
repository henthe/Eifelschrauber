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

    if (start.getHours() < 6 || end.getHours() > 22) {
      alert('Buchungen sind nur zwischen 06:00 und 22:00 Uhr möglich.');
      return;
    }

    if (start.getDay() === 0 || end.getDay() === 0) {
      alert('Buchungen sind nur von Montag bis Samstag möglich.');
      return;
    }

    onSelect(start, end);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="flex justify-between items-center mb-6">
          <h3 className="card-title">Zeitslot auswählen</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <span className="sr-only">Schließen</span>
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="form-group">
            <label className="form-label">
              Datum
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="form-input"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="form-group">
              <label className="form-label">
                Startzeit
              </label>
              <select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="form-input"
                required
              >
                {Array.from({ length: 16 }, (_, i) => i + 6).map((hour) => (
                  <option key={hour} value={`${hour.toString().padStart(2, '0')}:00`}>
                    {hour}:00
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">
                Endzeit
              </label>
              <select
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="form-input"
                required
              >
                {Array.from({ length: 16 }, (_, i) => i + 7).map((hour) => (
                  <option key={hour} value={`${hour.toString().padStart(2, '0')}:00`}>
                    {hour}:00
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              Auswählen
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 