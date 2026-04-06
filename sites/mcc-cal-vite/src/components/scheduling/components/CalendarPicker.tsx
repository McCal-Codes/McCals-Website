import { useState, useMemo } from 'react';
import { getCalendarDays, formatDateForInput, getMonthName, getDayName, isToday } from '../utils/dateHelpers';
import type { DayAvailability } from '../types/booking';

interface CalendarPickerProps {
  availability: DayAvailability[];
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
}

export function CalendarPicker({ availability, selectedDate, onSelectDate }: CalendarPickerProps) {
  const [viewDate, setViewDate] = useState(new Date());

  const calendarDays = useMemo(() => getCalendarDays(viewDate), [viewDate]);
  const availabilityMap = useMemo(() => {
    const map = new Map<string, boolean>();
    availability.forEach((day) => {
      map.set(day.date, day.available);
    });
    return map;
  }, [availability]);

  const monthLabel = useMemo(() => {
    return `${getMonthName(viewDate, 'long')} ${viewDate.getFullYear()}`;
  }, [viewDate]);

  const goToPreviousMonth = () => {
    setViewDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const goToNextMonth = () => {
    setViewDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleDateClick = (date: Date) => {
    const dateStr = formatDateForInput(date);
    const isAvailable = availabilityMap.get(dateStr);
    if (isAvailable) {
      onSelectDate(dateStr);
    }
  };

  return (
    <div className="scheduling-calendar-picker">
      <h2 className="scheduling-step-title">Select a date</h2>
      <p className="scheduling-step-description">
        Available dates are highlighted. Click to see time slots.
      </p>

      <div className="scheduling-calendar">
        <div className="scheduling-calendar-header">
          <button
            className="scheduling-calendar-nav"
            onClick={goToPreviousMonth}
            aria-label="Previous month"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
            </svg>
          </button>
          <span className="scheduling-calendar-month" aria-live="polite">
            {monthLabel}
          </span>
          <button
            className="scheduling-calendar-nav"
            onClick={goToNextMonth}
            aria-label="Next month"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
            </svg>
          </button>
        </div>

        <div className="scheduling-calendar-weekdays" role="row">
          {weekDays.map((day) => (
            <div key={day} className="scheduling-calendar-weekday" role="columnheader">
              {day}
            </div>
          ))}
        </div>

        <div className="scheduling-calendar-grid" role="grid">
          {calendarDays.map((date, index) => {
            const dateStr = formatDateForInput(date);
            const isAvailable = availabilityMap.get(dateStr) ?? false;
            const isSelected = selectedDate === dateStr;
            const isCurrentMonth = date.getMonth() === viewDate.getMonth();
            const isTodayDate = isToday(date);

            return (
              <button
                key={index}
                className={`scheduling-calendar-day ${
                  !isCurrentMonth ? 'other-month' : ''
                } ${isTodayDate ? 'today' : ''} ${isAvailable ? 'available' : ''} ${
                  isSelected ? 'selected' : ''
                }`}
                onClick={() => handleDateClick(date)}
                disabled={!isAvailable}
                aria-label={`${getDayName(date, 'long')}, ${date.toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                })}${isAvailable ? ', available' : ', unavailable'}`}
                aria-pressed={isSelected}
              >
                <span className="scheduling-calendar-day-number">{date.getDate()}</span>
                {isAvailable && <span className="scheduling-calendar-day-indicator" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
