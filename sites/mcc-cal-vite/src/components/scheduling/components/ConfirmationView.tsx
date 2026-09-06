import type { Booking } from '../types/booking';
import type { ExtendedEventType } from '../config/bookingTypes';
import {
  formatDateWithTimezone,
  formatTimeInTimezone,
  getTimezoneDisplayName,
} from '../utils/timezone';

interface ConfirmationViewProps {
  booking: Booking;
  bookingType: ExtendedEventType;
  requesterTimezone: string;
  onBookAnother: () => void;
}

export function ConfirmationView({
  booking,
  bookingType,
  requesterTimezone,
  onBookAnother,
}: ConfirmationViewProps) {
  const formattedDate = formatDateWithTimezone(booking.date, requesterTimezone, 'full');
  // The block is labelled "Date & Time" but only ever rendered the date, so a
  // requester never saw the hour they had just booked.
  const formattedTime = formatTimeInTimezone(
    booking.date,
    booking.time,
    booking.ownerTimezone,
    requesterTimezone
  );
  const timezoneDisplay = getTimezoneDisplayName(requesterTimezone);

  return (
    <div className="scheduling-confirmation">
      <div className="scheduling-confirmation-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="64" height="64">
          <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.1" />
          <path
            fill="currentColor"
            d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
          />
        </svg>
      </div>

      <h2 className="scheduling-confirmation-title">{bookingType.confirmationTitle}</h2>
      <p className="scheduling-confirmation-message">
        {bookingType.confirmationMessage}
      </p>

      <div className="scheduling-confirmation-details">
        <div className="scheduling-confirmation-detail">
          <span className="scheduling-confirmation-label">Event</span>
          <span className="scheduling-confirmation-value">{bookingType.name}</span>
        </div>

        <div className="scheduling-confirmation-detail">
          <span className="scheduling-confirmation-label">Date & Time</span>
          <span className="scheduling-confirmation-value">
            {formattedDate} at {formattedTime}
            <br />
            <span className="scheduling-confirmation-timezone">{timezoneDisplay}</span>
          </span>
        </div>

        <div className="scheduling-confirmation-detail">
          <span className="scheduling-confirmation-label">Duration</span>
          <span className="scheduling-confirmation-value">
            {bookingType.durationMinutes} minutes
          </span>
        </div>

        <div className="scheduling-confirmation-detail">
          <span className="scheduling-confirmation-label">Location</span>
          <span className="scheduling-confirmation-value">{booking.location || bookingType.location}</span>
        </div>

        {booking.requester.notes && (
          <div className="scheduling-confirmation-detail scheduling-confirmation-notes">
            <span className="scheduling-confirmation-label">Notes</span>
            <span className="scheduling-confirmation-value">
              {booking.requester.notes}
            </span>
          </div>
        )}
      </div>

      <div className="scheduling-confirmation-actions">
        <button className="scheduling-btn-primary" onClick={onBookAnother}>
          Book Another Meeting
        </button>
      </div>

      <p className="scheduling-confirmation-footer">
        Need to make changes? Contact us at{' '}
        <a href="mailto:contact@mcc-cal.com">contact@mcc-cal.com</a>
      </p>
    </div>
  );
}
