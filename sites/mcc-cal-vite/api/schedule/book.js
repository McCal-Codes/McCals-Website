/**
 * Google Calendar Booking API
 * Creates calendar events for bookings
 */

import { Resend } from 'resend';
import { applyRateLimit } from '../_lib/rate-limit-redis.js';
import { bookingSchema, safeParseBody } from '../_lib/validation.js';
import { applyCors } from '../_lib/cors.js';
import { getServiceClient, isSupabaseConfigured } from '../_lib/supabase-server.js';
import { captureApiException } from '../_lib/sentry.js';
import { BOOKING_CONFIGS, resolveLocation } from '../_lib/booking-config.js';
import { buildBookingEmails } from '../_lib/booking-emails.js';
import { OWNER_TIMEZONE, ownerWallTimeToUtc } from '../_lib/timezone.js';
import { buildManageUrl, createManageToken } from '../_lib/booking-token.js';
import { sendEmailOrThrow } from '../_lib/email.js';

// Lazy-initialize Resend client to handle missing API key gracefully
let resendClient = null;
async function getResendClient() {
  if (!resendClient && process.env.RESEND_API_KEY) {
    try {
      resendClient = new Resend(process.env.RESEND_API_KEY);
    } catch (err) {
      console.error('Failed to initialize Resend client: - book.js:19', err.message);
      await captureApiException(err, { route: 'schedule/book', operation: 'init_resend' });
    }
  }
  return resendClient;
}
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || 'primary';
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY && process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');
const TO_EMAIL = process.env.CONTACT_TO_EMAIL || 'contact@mcc-cal.com';
const FROM_EMAIL = process.env.CONTACT_FROM_EMAIL || 'noreply@mcc-cal.com';
const BOOKING_RATE_LIMIT = {
  route: 'booking',
  limit: 5,
  windowMs: 60 * 60 * 1000, // 1 hour
};

// Track mock bookings to prevent double-booking when Google credentials are missing
const mockBookings = new Set();

async function getAccessToken() {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claim = {
    iss: SERVICE_ACCOUNT_EMAIL,
    scope: 'https://www.googleapis.com/auth/calendar',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };

  const base64UrlEncode = (obj) =>
    Buffer.from(JSON.stringify(obj)).toString('base64url');

  const headerB64 = base64UrlEncode(header);
  const claimB64 = base64UrlEncode(claim);
  const signatureInput = `${headerB64}.${claimB64}`;

  const crypto = await import('crypto');
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(signatureInput);
  const signature = signer.sign(PRIVATE_KEY, 'base64url');

  const jwt = `${signatureInput}.${signature}`;

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Google auth failed: ${error}`);
  }

  const data = await response.json();
  return data.access_token;
}

async function createCalendarEvent(accessToken, bookingData) {
  const { eventTypeId, date, time, durationMinutes, requester, locationMode, locationDetail } =
    bookingData;
  const config = BOOKING_CONFIGS[eventTypeId];
  // The calendar event must carry the same address the emails do, or an
  // in-person booking shows "Google Meet" on the day.
  const location = resolveLocation(config, locationMode, locationDetail);

  const startDateTime = ownerWallTimeToUtc(date, time);
  const endDateTime = new Date(startDateTime);
  endDateTime.setMinutes(startDateTime.getMinutes() + durationMinutes);

  const event = {
    summary: `${config.name} - ${requester.name}`,
    description: `Booking with ${requester.name}\n\nEmail: ${requester.email}\n\nNotes: ${requester.notes || 'No notes provided'}`,
    start: {
      dateTime: startDateTime.toISOString(),
      timeZone: requester.timezone || 'America/New_York',
    },
    end: {
      dateTime: endDateTime.toISOString(),
      timeZone: requester.timezone || 'America/New_York',
    },
    location: location.label,
    attendees: [{ email: requester.email }],
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 }, // 1 day before
        { method: 'popup', minutes: 30 }, // 30 min before
      ],
    },
  };

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create event: ${error}`);
  }

  return response.json();
}

async function checkForConflicts(accessToken, date, time, durationMinutes) {
  const startDateTime = ownerWallTimeToUtc(date, time);
  const endDateTime = new Date(startDateTime);
  endDateTime.setMinutes(startDateTime.getMinutes() + durationMinutes);
  
  // Add 30 min buffer (max buffer between booking types)
  const checkStart = new Date(startDateTime);
  checkStart.setMinutes(checkStart.getMinutes() - 30);
  const checkEnd = new Date(endDateTime);
  checkEnd.setMinutes(checkEnd.getMinutes() + 30);

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events?timeMin=${checkStart.toISOString()}&timeMax=${checkEnd.toISOString()}&singleEvents=true`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Calendar check failed: ${error}`);
  }

  const data = await response.json();
  const events = data.items || [];
  
  // Check if any event overlaps with our slot
  return events.some((event) => {
    const eventStart = new Date(event.start?.dateTime || `${event.start?.date}T00:00:00`);
    const eventEnd = new Date(event.end?.dateTime || `${event.end?.date}T23:59:59`);
    return startDateTime < eventEnd && endDateTime > eventStart;
  });
}

async function checkSupabaseBookingConflict(date, time, durationMinutes) {
  if (!isSupabaseConfigured()) {
    return false;
  }

  const supabase = getServiceClient();
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('booking_time, duration_minutes')
    .eq('booking_date', date)
    .neq('status', 'cancelled');

  if (error) {
    console.error('[schedule/book] Supabase conflict check failed: - book.js:184', error);
    return false;
  }

  const requestStart = ownerWallTimeToUtc(date, time);
  const requestEnd = new Date(requestStart);
  requestEnd.setMinutes(requestStart.getMinutes() + durationMinutes);

  return (bookings || []).some((booking) => {
    const bookedStart = ownerWallTimeToUtc(date, booking.booking_time || '00:00:00');
    const bookedEnd = new Date(bookedStart);
    bookedEnd.setMinutes(bookedStart.getMinutes() + (booking.duration_minutes || 60));
    return requestStart < bookedEnd && requestEnd > bookedStart;
  });
}

async function sendConfirmationEmail(
  booking,
  config,
  requesterTimezone = OWNER_TIMEZONE,
  manageUrl = null
) {
  const resend = await getResendClient();
  if (!resend) {
    console.warn('[sendConfirmationEmail] Resend not configured, skipping email');
    return;
  }

  // Message construction lives in _lib/booking-emails.js so it can be asserted
  // and previewed without a Resend key or a real inbox.
  const emails = buildBookingEmails({
    booking,
    config,
    requesterTimezone,
    manageUrl,
    ownerEmail: TO_EMAIL,
    location,
  });

  try {
    await sendEmailOrThrow(resend, {
      from: FROM_EMAIL,
      to: booking.requester.email,
      replyTo: TO_EMAIL,
      subject: emails.requester.subject,
      attachments: emails.attachments,
      html: emails.requester.html,
      text: emails.requester.text,
    });

    await sendEmailOrThrow(resend, {
      from: FROM_EMAIL,
      to: TO_EMAIL,
      // Replying to the notification reaches the person who booked.
      replyTo: emails.owner.replyTo,
      subject: emails.owner.subject,
      attachments: emails.attachments,
      html: emails.owner.html,
      text: emails.owner.text,
    });
  } catch (err) {
    console.error('[sendConfirmationEmail] Failed to send email:', err instanceof Error ? err.message : err);
    await captureApiException(err, { route: 'schedule/book', operation: 'send_confirmation_email' });
  }
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  if (applyCors(req, res, { methods: 'POST, OPTIONS' })) {
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Honeypot check - must run before validation to silently discard spam bots
  const rawBody = req.body || {};
  if (rawBody.hp_field) {
    res.status(200).json({ ok: true }); // silently discard
    return;
  }

  const parsed = safeParseBody(bookingSchema, req.body);
  if (!parsed.ok) {
    res.status(400).json({ error: parsed.error.message, issues: parsed.error.issues });
    return;
  }

  const { eventTypeId, date, time, durationMinutes, requester, requesterTimezone, locationMode, locationDetail } = parsed.data;

  // Validation
  if (!eventTypeId || !date || !time || !durationMinutes || !requester?.name || !requester?.email) {
    res.status(400).json({ error: 'Missing required booking fields' });
    return;
  }

  if (!BOOKING_CONFIGS[eventTypeId]) {
    res.status(400).json({ error: `Unknown event type: ${eventTypeId}` });
    return;
  }

  // Validate duration is within allowed range
  const config = BOOKING_CONFIGS[eventTypeId];
  if (durationMinutes < config.durationMinutes || durationMinutes > config.maxDurationMinutes) {
    res.status(400).json({ 
      error: `Duration must be between ${config.durationMinutes} and ${config.maxDurationMinutes} minutes` 
    });
    return;
  }

  // Credential for the self-service reschedule/cancel link in the confirmation
  // email. Generated once per request so both the stored hash and the emailed
  // link refer to the same token; the raw value is never persisted.
  const manageToken = createManageToken();
  const manageUrl = buildManageUrl(manageToken.token);

  // Virtual unless the requester asked to meet in person and said where.
  const location = resolveLocation(config, locationMode, locationDetail);

  // Development mode: return mock booking without external services
  const isDev = !process.env.VERCEL && (!process.env.NODE_ENV || process.env.NODE_ENV === 'development');
  if (isDev) {
    if (process.env.DEBUG_BOOKING === '1') {
      console.log('[schedule/book] DEV MODE: Mock booking created - book.js:309', { eventTypeId, date, time, requester: requester.name });
    }
    
    const startDateTime = ownerWallTimeToUtc(date, time);
    const endDateTime = new Date(startDateTime);
    endDateTime.setMinutes(startDateTime.getMinutes() + durationMinutes);
    
    res.status(200).json({
      booking: {
        id: `dev-mock-${Date.now()}`,
        start: { dateTime: startDateTime.toISOString() },
        end: { dateTime: endDateTime.toISOString() },
        eventLink: 'https://calendar.google.com/calendar/event?eid=dev',
      },
    });
    return;
  }

  // Production mode with rate limiting
  const rateLimit = await applyRateLimit(req, res, BOOKING_RATE_LIMIT);
  if (!rateLimit.allowed) {
    res.status(429).json({ error: 'Too many booking attempts. Please try again later.' });
    return;
  }

  if (!process.env.RESEND_API_KEY) {
    console.error('[schedule/book] RESEND_API_KEY not set - book.js:334');
    res.status(503).json({ error: 'Email service not configured' });
    return;
  }

  const hasSupabaseConflict = await checkSupabaseBookingConflict(date, time, durationMinutes);
  if (hasSupabaseConflict) {
    res.status(409).json({ error: 'This time slot is no longer available. Please select another time.' });
    return;
  }

  // If Google credentials missing, create mock booking
  if (!SERVICE_ACCOUNT_EMAIL || !PRIVATE_KEY) {
    console.warn('[schedule/book] Google credentials not set, creating mock booking - book.js:341');
    
    const slotKey = `${date}:${time}`;
    
    if (mockBookings.has(slotKey)) {
      res.status(409).json({ error: 'This time slot is no longer available. Please select another time.' });
      return;
    }
    
    const startDateTime = ownerWallTimeToUtc(date, time);
    const endDateTime = new Date(startDateTime);
    endDateTime.setMinutes(startDateTime.getMinutes() + durationMinutes);
    
    // Mark slot as booked
    mockBookings.add(slotKey);
    
    // Save to Supabase even for mock bookings (for testing)
    let bookingId = null;
    if (isSupabaseConfigured()) {
      const supabase = getServiceClient();
      const { data: bookingRecord, error: dbError } = await supabase
        .from('bookings')
        .insert({
          client_name: requester.name,
          client_email: requester.email,
          service_type: config.name,
          booking_date: date,
          booking_time: time,
          duration_minutes: durationMinutes,
          notes: requester.notes || null,
          location: location.label,
          status: 'confirmed',
          deposit_paid: false,
          total_amount: null,
          manage_token_hash: manageToken.hash,
          manage_token_expires_at: manageToken.expiresAt,
        })
        .select('id')
        .single();
      
      if (dbError) {
        console.error('[schedule/book] Mock booking DB error: - book.js:379', dbError);
        await captureApiException(dbError, { route: 'schedule/book', operation: 'insert_mock_booking' });
      } else {
        bookingId = bookingRecord?.id;
      }
    }
    
    // Send email notification even for mock bookings
    const mockBooking = {
      id: `mock-${Date.now()}`,
      start: { dateTime: startDateTime.toISOString() },
      end: { dateTime: endDateTime.toISOString() },
      requester: {
        name: requester.name,
        email: requester.email,
        notes: requester.notes,
      },
      eventLink: '#mock-booking',
    };
    
    // Send email notification (don't await, let it run async)
    sendConfirmationEmail(mockBooking, config, requesterTimezone, manageUrl).catch(async (err) => {
      console.error('[schedule/book] Failed to send confirmation email: - book.js:400', err);
      await captureApiException(err, { route: 'schedule/book', operation: 'send_mock_confirmation_email' });
    });
    
    res.status(200).json({
      booking: {
        id: bookingId || mockBooking.id,
        start: mockBooking.start,
        end: mockBooking.end,
        eventLink: mockBooking.eventLink,
      },
      mock: true,
    });
    return;
  }

  try {
    const accessToken = await getAccessToken();
    
    // Check for conflicts before booking
    const hasConflict = await checkForConflicts(accessToken, date, time, durationMinutes);
    if (hasConflict) {
      res.status(409).json({ error: 'This time slot is no longer available. Please select another time.' });
      return;
    }
    
    const calendarEvent = await createCalendarEvent(accessToken, req.body);

    const config = BOOKING_CONFIGS[eventTypeId];
    const booking = {
      id: calendarEvent.id,
      start: { dateTime: calendarEvent.start.dateTime },
      end: { dateTime: calendarEvent.end.dateTime },
      requester: {
        name: requester.name,
        email: requester.email,
        notes: requester.notes,
      },
      eventLink: calendarEvent.htmlLink,
    };

    // Save to Supabase
    let bookingId = null;
    if (isSupabaseConfigured()) {
      const supabase = getServiceClient();
      
      // Insert booking record
      const { data: bookingRecord, error: dbError } = await supabase
        .from('bookings')
        .insert({
          client_name: requester.name,
          client_email: requester.email,
          service_type: config.name,
          booking_date: date,
          booking_time: time,
          duration_minutes: durationMinutes,
          notes: requester.notes || null,
          location: location.label,
          status: 'confirmed',
          deposit_paid: false,
          total_amount: null,
          manage_token_hash: manageToken.hash,
          manage_token_expires_at: manageToken.expiresAt,
        })
        .select('id')
        .single();
      
      if (dbError) {
        console.error('[schedule/book] Database error saving booking: - book.js:464', dbError);
        await captureApiException(dbError, { route: 'schedule/book', operation: 'insert_booking' });
      } else {
        bookingId = bookingRecord?.id;

        // Mark slot as unavailable in availability_slots with error handling
        const { error: slotError } = await supabase
          .from('availability_slots')
          .update({
            is_available: false,
            booking_id: bookingId,
          })
          .eq('slot_date', date)
          .eq('slot_time', time);

        if (slotError) {
          console.error('[schedule/book] Failed to mark slot unavailable: - book.js:479', slotError);
          await captureApiException(slotError, { route: 'schedule/book', operation: 'mark_slot_unavailable' });
          // Log for monitoring but don't fail the booking - calendar event is already created
          // Consider: add to monitoring/alerting system for manual cleanup
        }
      }
    }

    await sendConfirmationEmail(booking, config, requesterTimezone, manageUrl);

    res.status(200).json({
      booking: {
        id: bookingId || booking.id,
        calendarId: booking.id,
        start: booking.start,
        end: booking.end,
        eventLink: booking.eventLink,
      },
    });
  } catch (err) {
    console.error('[schedule/book] Booking creation failed: - book.js:498', err);
    await captureApiException(err, { route: 'schedule/book', operation: 'create_booking' });
    res.status(500).json({ error: 'Failed to create booking. Please try again.' });
  }
}
