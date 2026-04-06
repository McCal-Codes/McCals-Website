import type { TimeSlot } from '../types/booking';

interface TimeSlotGridProps {
  slots: TimeSlot[];
  selectedTime: string | null;
  onSelectTime: (time: string) => void;
  dateDisplay: string;
}

export function TimeSlotGrid({ slots, selectedTime, onSelectTime, dateDisplay }: TimeSlotGridProps) {
  const availableSlots = slots.filter((slot) => slot.available);

  if (availableSlots.length === 0) {
    return (
      <div className="scheduling-time-slots">
        <h2 className="scheduling-step-title">Select a time</h2>
        <p className="scheduling-step-description">{dateDisplay}</p>
        <div className="scheduling-no-slots">
          <svg viewBox="0 0 24 24" width="48" height="48" aria-hidden="true">
            <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
          </svg>
          <p>No available times for this date.</p>
          <p className="scheduling-no-slots-hint">Please select another date.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="scheduling-time-slots">
      <h2 className="scheduling-step-title">Select a time</h2>
      <p className="scheduling-step-description">{dateDisplay}</p>

      <div className="scheduling-slots-grid" role="radiogroup" aria-label="Available time slots">
        {availableSlots.map((slot) => (
          <button
            key={slot.time}
            className={`scheduling-time-slot ${selectedTime === slot.time ? 'selected' : ''}`}
            onClick={() => onSelectTime(slot.time)}
            role="radio"
            aria-checked={selectedTime === slot.time}
          >
            <span className="scheduling-time-slot-display">{slot.displayTime}</span>
            {selectedTime === slot.time && (
              <svg className="scheduling-time-slot-check" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            )}
          </button>
        ))}
      </div>

      <p className="scheduling-timezone-note">
        Times shown in your local timezone
      </p>
    </div>
  );
}
