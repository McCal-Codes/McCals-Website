/**
 * Self-service booking management.
 *
 * Backs the link in confirmation emails: look up a booking by its manage
 * token, then cancel it or move it to a different slot. The token is the only
 * credential (see api/_lib/booking-token.js), so every response is written to
 * avoid confirming anything to someone holding a wrong token, an unknown,
 * expired and already-cancelled token all produce the same generic failure.
 */

import { applyCors } from '../_lib/cors.js';
import { applyRateLimit } from '../_lib/rate-limit-redis.js';
import { getServiceClient, isSupabaseConfigured } from '../_lib/supabase-server.js';
import { captureApiException } from '../_lib/sentry.js';
import { hashManageToken } from '../_lib/booking-token.js';
import { BOOKING_CONFIGS } from '../_lib/booking-config.js';
import { OWNER_TIMEZONE, ownerWallTimeToUtc } from '../_lib/timezone.js';

const MANAGE_RATE_LIMIT = {
  route: 'booking-manage',
  limit: 20,
  windowMs: 15 * 60 * 1000,
};

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^\d{2}:\d{2}(:\d{2})?$/;

/** Deliberately identical for unknown, expired and malformed tokens. */
function respondInvalidToken(res) {
  res.status(404).json({ error: 'This booking link is no longer valid.' });
}

/** Bookings store the display name, so map back to the config key. */
function eventTypeIdFor(serviceType) {
  const entry = Object.entries(BOOKING_CONFIGS).find(([, config]) => config.name === serviceType);
  return entry ? entry[0] : null;
}

function presentBooking(row) {
  const eventTypeId = eventTypeIdFor(row.service_type);
  return {
    // The page needs this to ask the availability endpoint for open slots.
    eventTypeId,
    date: row.booking_date,
    time: String(row.booking_time ?? '').slice(0, 5),
    durationMinutes: row.duration_minutes,
    serviceType: row.service_type,
    location: eventTypeId ? BOOKING_CONFIGS[eventTypeId].location : null,
    status: row.status,
    ownerTimezone: OWNER_TIMEZONE,
    requesterName: row.client_name,
  };
}

async function findBookingByToken(supabase, token) {
  const { data, error } = await supabase
    .from('bookings')
    .select(
      'id, client_name, client_email, service_type, booking_date, booking_time, duration_minutes, status, manage_token_expires_at'
    )
    .eq('manage_token_hash', hashManageToken(token))
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  // Expiry is enforced here rather than in the query so a stale link is
  // indistinguishable from an unknown one.
  if (data.manage_token_expires_at && new Date(data.manage_token_expires_at) < new Date()) {
    return null;
  }

  return data;
}

/** Overlap check against every other live booking on the target date. */
async function hasConflict(supabase, { bookingId, date, time, durationMinutes }) {
  const { data, error } = await supabase
    .from('bookings')
    .select('id, booking_time, duration_minutes')
    .eq('booking_date', date)
    .neq('status', 'cancelled');

  if (error) throw error;

  const start = ownerWallTimeToUtc(date, time);
  const end = new Date(start.getTime() + durationMinutes * 60_000);

  return (data ?? [])
    .filter((row) => row.id !== bookingId)
    .some((row) => {
      const bookedStart = ownerWallTimeToUtc(date, row.booking_time || '00:00:00');
      const bookedEnd = new Date(bookedStart.getTime() + (row.duration_minutes || 60) * 60_000);
      return start < bookedEnd && end > bookedStart;
    });
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  if (applyCors(req, res, { methods: 'GET, POST, OPTIONS' })) return;

  if (!isSupabaseConfigured()) {
    res.status(503).json({ error: 'Booking management is unavailable right now.' });
    return;
  }

  const rateLimit = await applyRateLimit(req, res, MANAGE_RATE_LIMIT);
  if (!rateLimit.allowed) {
    res.status(429).json({ error: 'Too many attempts. Please try again later.' });
    return;
  }

  const token = req.method === 'GET' ? req.query?.token : req.body?.token;
  if (!token || typeof token !== 'string') {
    respondInvalidToken(res);
    return;
  }

  const supabase = getServiceClient();

  try {
    const booking = await findBookingByToken(supabase, token);
    if (!booking) {
      respondInvalidToken(res);
      return;
    }

    if (req.method === 'GET') {
      res.status(200).json({ booking: presentBooking(booking) });
      return;
    }

    if (req.method !== 'POST') {
      res.setHeader('Allow', 'GET, POST, OPTIONS');
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    const { action } = req.body ?? {};

    if (action === 'cancel') {
      // Idempotent: cancelling an already-cancelled booking is a success, so a
      // double-click or a re-opened email does not surface an error.
      if (booking.status !== 'cancelled') {
        const { error } = await supabase
          .from('bookings')
          .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
          .eq('id', booking.id);

        if (error) throw error;
      }

      res.status(200).json({ booking: { ...presentBooking(booking), status: 'cancelled' } });
      return;
    }

    if (action === 'reschedule') {
      const { date, time } = req.body ?? {};

      if (typeof date !== 'string' || !DATE_PATTERN.test(date)) {
        res.status(400).json({ error: 'Pick a valid date.' });
        return;
      }
      if (typeof time !== 'string' || !TIME_PATTERN.test(time)) {
        res.status(400).json({ error: 'Pick a valid time.' });
        return;
      }
      if (booking.status === 'cancelled') {
        res.status(409).json({ error: 'This booking was cancelled and cannot be moved.' });
        return;
      }

      const start = ownerWallTimeToUtc(date, time);
      if (Number.isNaN(start.getTime())) {
        res.status(400).json({ error: 'Pick a valid date and time.' });
        return;
      }
      if (start.getTime() <= Date.now()) {
        res.status(400).json({ error: 'Pick a time in the future.' });
        return;
      }

      const durationMinutes = booking.duration_minutes || 60;

      if (await hasConflict(supabase, { bookingId: booking.id, date, time, durationMinutes })) {
        res.status(409).json({ error: 'That time was just taken. Please choose another.' });
        return;
      }

      const { error } = await supabase
        .from('bookings')
        .update({
          booking_date: date,
          booking_time: time,
          rescheduled_at: new Date().toISOString(),
        })
        .eq('id', booking.id);

      if (error) throw error;

      res.status(200).json({
        booking: presentBooking({
          ...booking,
          booking_date: date,
          booking_time: time,
        }),
      });
      return;
    }

    res.status(400).json({ error: 'Unknown action.' });
  } catch (err) {
    console.error('[schedule/manage] Failed:', err instanceof Error ? err.message : err);
    await captureApiException(err, { route: 'schedule/manage', operation: 'manage_booking' });
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
