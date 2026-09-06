import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { usePageMeta } from '@/hooks/usePageMeta';
import { formatDateWithTimezone, getRequesterTimezone } from '@/components/scheduling/utils/timezone';
import type { DayAvailability } from '@/components/scheduling/types/booking';
import '@/styles/scheduling.css';

const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://mcc-cal.com').replace(/\/$/, '');

interface ManagedBooking {
  eventTypeId: string | null;
  date: string;
  time: string;
  durationMinutes: number;
  serviceType: string;
  location: string | null;
  status: string;
  ownerTimezone: string;
  requesterName: string;
}

type Mode = 'view' | 'rescheduling' | 'cancelled' | 'rescheduled';

/**
 * Self-service reschedule and cancel, reached from the link in a confirmation
 * email. The token in the query string is the only credential, so it is never
 * rendered, logged, or put anywhere it could be shoulder-read.
 */
export default function ManageBookingPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [booking, setBooking] = useState<ManagedBooking | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [mode, setMode] = useState<Mode>('view');
  const [availability, setAvailability] = useState<DayAvailability[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const requesterTimezone = useMemo(() => getRequesterTimezone(), []);

  usePageMeta({
    title: 'Manage your booking | Caleb McCartney',
    description: 'Reschedule or cancel your booking.',
    // Canonical without the token: the query string is a credential and must
    // not end up in a canonical tag, a referrer, or anyone's analytics.
    canonical: `${SITE_URL}/manage-booking`,
    robots: 'noindex, nofollow',
  });

  useEffect(() => {
    if (!token) {
      setLoadError('This link is missing its booking reference.');
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const response = await fetch(`/api/schedule/manage?token=${encodeURIComponent(token)}`, {
          headers: { Accept: 'application/json' },
        });
        const data = await response.json();

        if (cancelled) return;

        if (!response.ok) {
          setLoadError(data.error ?? 'This booking link is no longer valid.');
        } else {
          setBooking(data.booking);
          if (data.booking.status === 'cancelled') setMode('cancelled');
        }
      } catch {
        if (!cancelled) setLoadError('Could not reach the server. Please try again.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  // Read out as a plain value so the callback's dependency is the string
  // itself; depending on `booking?.eventTypeId` makes the React Compiler infer
  // the whole `booking` object and skip optimizing the component.
  const eventTypeId = booking?.eventTypeId ?? null;

  const startReschedule = useCallback(async () => {
    if (!eventTypeId) return;

    setMode('rescheduling');
    setActionError(null);

    const today = new Date();
    const end = new Date(today);
    end.setDate(end.getDate() + 60);
    const iso = (value: Date) => value.toISOString().split('T')[0];

    try {
      const response = await fetch(
        `/api/schedule/availability?eventType=${eventTypeId}&start=${iso(today)}&end=${iso(end)}`,
        { headers: { Accept: 'application/json' } }
      );
      if (!response.ok) throw new Error('Could not load available times.');
      const data = await response.json();
      setAvailability(data.days ?? []);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not load available times.');
    }
  }, [eventTypeId]);

  const submitAction = useCallback(
    async (body: Record<string, unknown>, nextMode: Mode) => {
      setIsSubmitting(true);
      setActionError(null);

      try {
        const response = await fetch('/api/schedule/manage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ token, ...body }),
        });
        const data = await response.json();

        if (!response.ok) {
          setActionError(data.error ?? 'Something went wrong. Please try again.');
          return;
        }

        setBooking(data.booking);
        setMode(nextMode);
      } catch {
        setActionError('Could not reach the server. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [token]
  );

  if (isLoading) {
    return (
      <div className="scheduling-page">
        <p className="scheduling-step-description">Loading your booking…</p>
      </div>
    );
  }

  if (loadError || !booking) {
    return (
      <div className="scheduling-page">
        <h1 className="scheduling-title">Booking link not valid</h1>
        <p className="scheduling-step-description">
          {loadError ?? 'This booking link is no longer valid.'}
        </p>
        <p className="scheduling-step-description">
          If you still need to change a booking, <Link to="/contact-us">get in touch</Link> and
          I&apos;ll sort it out.
        </p>
      </div>
    );
  }

  const dateDisplay = formatDateWithTimezone(booking.date, requesterTimezone, 'full');
  const selectedDay = availability.find((day) => day.date === selectedDate);

  return (
    <div className="scheduling-page">
      <h1 className="scheduling-title">
        {mode === 'cancelled' ? 'Booking cancelled' : 'Your booking'}
      </h1>

      <div className="scheduling-event-display">
        <p className="scheduling-confirmation-detail">
          <strong>{booking.serviceType}</strong>
        </p>
        <p className="scheduling-confirmation-detail">
          {dateDisplay} at {booking.time}
        </p>
        <p className="scheduling-confirmation-detail">{booking.durationMinutes} minutes</p>
        {booking.location && <p className="scheduling-confirmation-detail">{booking.location}</p>}
      </div>

      {mode === 'cancelled' && (
        <p className="scheduling-step-description" role="status">
          This booking is cancelled. Nothing further is needed — if you&apos;d like to rebook,{' '}
          <Link to="/grab-a-coffee">pick a new time</Link>.
        </p>
      )}

      {mode === 'rescheduled' && (
        <p className="scheduling-step-description" role="status">
          Moved. A fresh confirmation is on its way to your inbox.
        </p>
      )}

      {mode === 'view' && (
        <div className="scheduling-actions">
          <button
            type="button"
            className="scheduling-button scheduling-button--primary"
            onClick={startReschedule}
            disabled={!booking.eventTypeId}
          >
            Reschedule
          </button>
          <button
            type="button"
            className="scheduling-button"
            onClick={() => submitAction({ action: 'cancel' }, 'cancelled')}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Cancelling…' : 'Cancel booking'}
          </button>
        </div>
      )}

      {mode === 'rescheduling' && (
        <section className="scheduling-reschedule">
          <h2 className="scheduling-step-title">Pick a new time</h2>

          {availability.length === 0 && !actionError && (
            <p className="scheduling-step-description">Loading available times…</p>
          )}

          <div className="scheduling-calendar-grid" role="group" aria-label="Available dates">
            {availability.map((day) => (
              <button
                key={day.date}
                type="button"
                className={`scheduling-calendar-day available${
                  selectedDate === day.date ? ' selected' : ''
                }`}
                aria-pressed={selectedDate === day.date}
                onClick={() => setSelectedDate(day.date)}
              >
                {day.date}
              </button>
            ))}
          </div>

          {selectedDay && (
            <div className="scheduling-slots-grid" role="group" aria-label="Available times">
              {selectedDay.slots.map((slot) => (
                <button
                  key={slot.time}
                  type="button"
                  className="scheduling-time-slot"
                  disabled={isSubmitting}
                  onClick={() =>
                    submitAction(
                      { action: 'reschedule', date: selectedDay.date, time: slot.time },
                      'rescheduled'
                    )
                  }
                >
                  {slot.displayTime}
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            className="scheduling-button"
            onClick={() => setMode('view')}
            disabled={isSubmitting}
          >
            Never mind
          </button>
        </section>
      )}

      {actionError && (
        <p className="scheduling-error" role="alert">
          {actionError}
        </p>
      )}
    </div>
  );
}
