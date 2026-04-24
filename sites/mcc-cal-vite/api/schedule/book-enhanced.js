/**
 * Enhanced Booking API with Redis Locking
 * Prevents double-booking race conditions with distributed locks
 */
import { Resend } from 'resend';
import { applyRateLimit } from '../_lib/rate-limit-redis.js';
import { bookingSchema, safeParseBody } from '../_lib/validation.js';
import { applyCors } from '../_lib/cors.js';
import { acquireBookingLock, deleteCache } from '../_lib/redis.js';

const resend = new Resend(process.env.RESEND_API_KEY);
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || 'primary';
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY && process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');
const FROM_EMAIL = process.env.CONTACT_FROM_EMAIL || 'noreply@mcc-cal.com';
const BOOKING_RATE_LIMIT = {
  route: 'booking',
  limit: 5,
  windowMs: 60 * 60 * 1000, // 1 hour
};

const BOOKING_CONFIGS = {
  'grab-coffee': {
    name: 'Grab a Coffee',
    durationMinutes: 30,
    maxDurationMinutes: 60,
    location: 'Virtual (Google Meet)',
    confirmationTitle: 'Coffee chat booked!',
    confirmationMessage: "Looking forward to our conversation. I've sent a confirmation to your email with the meeting details.",
  },
  'book-podcast': {
    name: 'Book a Podcast Recording',
    durationMinutes: 90,
    maxDurationMinutes: 120,
    location: 'Virtual (Zoom or Google Meet)',
    confirmationTitle: 'Podcast session booked!',
    confirmationMessage: "We're all set to record. I've sent you a confirmation with details and a few tips to prepare for our conversation.",
  },
};

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
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(signatureInput);
  const signature = sign.sign(PRIVATE_KEY, 'base64url');

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
    throw new Error('Failed to get access token');
  }

  const data = await response.json();
  return data.access_token;
}

async function checkSlotStillAvailable(accessToken, startTime, endTime) {
  // Double-check the slot is still available before booking
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events?timeMin=${startTime}&timeMax=${endTime}&maxResults=1`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to check slot availability');
  }

  const data = await response.json();
  return data.items.length === 0;
}

async function createCalendarEvent(accessToken, booking) {
  const { startTime, endTime, summary, description, location, attendeeEmail, attendeeName } = booking;

  const event = {
    summary,
    description,
    location,
    start: { dateTime: startTime, timeZone: 'America/New_York' },
    end: { dateTime: endTime, timeZone: 'America/New_York' },
    attendees: [{ email: attendeeEmail, displayName: attendeeName }],
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 }, // 24 hours before
        { method: 'popup', minutes: 30 }, // 30 minutes before
      ],
    },
  };

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events?sendUpdates=all`,
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
    throw new Error(`Calendar API error: ${error}`);
  }

  return await response.json();
}

async function sendConfirmationEmail(booking, eventData) {
  const config = BOOKING_CONFIGS[booking.eventType];
  
  await resend.emails.send({
    from: FROM_EMAIL,
    to: booking.attendeeEmail,
    subject: `${config.confirmationTitle} - ${booking.date} at ${booking.time}`,
    html: `
      <h1>${config.confirmationTitle}</h1>
      <p>Hi ${booking.attendeeName},</p>
      <p>${config.confirmationMessage}</p>
      <p><strong>When:</strong> ${booking.date} at ${booking.time}</p>
      <p><strong>Where:</strong> ${config.location}</p>
      <p><strong>Calendar:</strong> <a href="${eventData.htmlLink}">View in Google Calendar</a></p>
      <p>Need to reschedule? Reply to this email or <a href="${eventData.htmlLink}">modify in Google Calendar</a>.</p>
    `,
  });
}

export default async function handler(req, res) {
  // Apply CORS
  const corsResult = applyCors(req, res);
  if (corsResult) return corsResult;

  // Apply rate limiting (Redis-backed)
  const rateLimit = await applyRateLimit(req, res, BOOKING_RATE_LIMIT);
  if (!rateLimit.allowed) {
    return res.status(429).json({
      error: 'Too many booking attempts',
      retryAfter: rateLimit.retryAfterSeconds,
    });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Parse and validate request body
  const parseResult = safeParseBody(req, bookingSchema);
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error });
  }

  const { eventTypeId, date, time, durationMinutes, requester } = parseResult.data;
  const config = BOOKING_CONFIGS[eventTypeId];

  if (!config) {
    return res.status(400).json({ error: `Unknown event type: ${eventTypeId}` });
  }

  // Calculate times using provided duration or config default
  const [hours, minutes] = time.split(':').map(Number);
  const startDateTime = new Date(date);
  startDateTime.setHours(hours, minutes, 0, 0);
  
  const actualDuration = durationMinutes || config.durationMinutes;
  const endDateTime = new Date(startDateTime.getTime() + actualDuration * 60000);
  
  const startTimeISO = startDateTime.toISOString();
  const endTimeISO = endDateTime.toISOString();

  // Acquire distributed lock to prevent double-booking
  const lockResult = await acquireBookingLock(date, time, 60);
  
  if (!lockResult.success) {
    if (lockResult.reason === 'slot_locked') {
      return res.status(409).json({
        error: 'This time slot is being booked by someone else. Please try a different time.',
        code: 'SLOT_LOCKED',
      });
    }
    // Redis unavailable - continue with optimistic booking (will fail at calendar level if conflict)
  }

  try {
    const accessToken = await getAccessToken();

    // Double-check availability
    const isAvailable = await checkSlotStillAvailable(accessToken, startTimeISO, endTimeISO);
    
    if (!isAvailable) {
      if (lockResult.success && lockResult.release) {
        await lockResult.release();
      }
      return res.status(409).json({
        error: 'This time slot is no longer available. Please select a different time.',
        code: 'SLOT_TAKEN',
      });
    }

    // Create calendar event
    const eventData = await createCalendarEvent(accessToken, {
      startTime: startTimeISO,
      endTime: endTimeISO,
      summary: `${config.name} - ${requester.name}`,
      description: `Booked via website\n\nNotes: ${requester.notes || 'None'}`,
      location: config.location,
      attendeeEmail: requester.email,
      attendeeName: requester.name,
    });

    // Clear availability cache since we just booked a slot
    await deleteCache(`availability:${eventTypeId}:*`);
    await deleteCache(`calendar:busy:*`);

    // Send confirmation email (async, don't wait)
    sendConfirmationEmail({
      eventType: eventTypeId,
      date,
      time,
      attendeeName: requester.name,
      attendeeEmail: requester.email,
    }, eventData).catch(err => {
      console.error('Failed to send confirmation email:', err);
    });

    // Release the lock
    if (lockResult.success && lockResult.release) {
      await lockResult.release();
    }

    return res.status(201).json({
      success: true,
      eventId: eventData.id,
      calendarLink: eventData.htmlLink,
      meetLink: eventData.hangoutLink || null,
      confirmationTitle: config.confirmationTitle,
      confirmationMessage: config.confirmationMessage,
    });
  } catch (error) {
    // Release the lock on error
    if (lockResult.success && lockResult.release) {
      await lockResult.release().catch(() => {});
    }

    console.error('Booking error:', error);
    return res.status(500).json({
      error: 'Failed to create booking',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}
