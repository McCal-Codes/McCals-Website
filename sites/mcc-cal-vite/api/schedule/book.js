import { kv } from '@vercel/kv';
import { getEventTypeById } from '../../src/components/scheduling/config/eventTypes';
import { AVAILABILITY_RULES } from '../../src/components/scheduling/config/availability';
import { isMaxBookingsReached } from '../../src/components/scheduling/utils/availability';
import { isDateAvailable, isWithinRange } from '../../src/components/scheduling/utils/availability';
import { applyRateLimit } from '../_lib/rate-limit.js';

/**
 * POST /api/schedule/book
 * Creates a new booking using Vercel KV for persistent storage
 * 
 * Body:
 * - eventTypeId: string (required)
 * - date: string YYYY-MM-DD (required)
 * - time: string HH:mm (required)
 * - durationMinutes: number (required)
 * - requester: { name, email, notes? } (required)
 * - requesterTimezone: string (optional)
 */

// KV key for bookings storage
const KV_BOOKINGS_KEY = 'schedule:bookings';

// Rate limiting config
const BOOKING_RATE_LIMIT = {
  route: 'schedule-book',
  limit: 3,
  windowMs: 60 * 60 * 1000, // 1 hour
};

// Helper to get bookings from KV
async function getBookingsFromKV() {
  try {
    const bookings = await kv.get(KV_BOOKINGS_KEY);
    return Array.isArray(bookings) ? bookings : [];
  } catch (err) {
    console.error('[schedule/book] KV read error:', err);
    return [];
  }
}

// Helper to save booking to KV
async function saveBookingToKV(booking) {
  try {
    const existingBookings = await getBookingsFromKV();
    const updatedBookings = [...existingBookings, booking];
    await kv.set(KV_BOOKINGS_KEY, updatedBookings);
    return true;
  } catch (err) {
    console.error('[schedule/book] KV write error:', err);
    return false;
  }
}

function generateBookingId() {
  return `book_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Rate limiting
  const rateLimit = applyRateLimit(req, res, BOOKING_RATE_LIMIT);
  if (!rateLimit.allowed) {
    res.status(429).json({ error: 'Too many booking attempts. Please try again later.' });
    return;
  }

  const {
    eventTypeId,
    date,
    time,
    durationMinutes,
    requester,
    requesterTimezone,
  } = req.body || {};

  // Validation
  if (!eventTypeId || !date || !time || !durationMinutes || !requester) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  // Honeypot check
  if (req.body.website || req.body.url) {
    res.status(200).json({ ok: true }); // silently discard bots
    return;
  }

  // Validate event type
  const eventType = getEventTypeById(eventTypeId);
  if (!eventType) {
    res.status(400).json({ error: 'Invalid event type' });
    return;
  }

  // Validate date format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    return;
  }

  // Validate time format
  const timeRegex = /^\d{2}:\d{2}$/;
  if (!timeRegex.test(time)) {
    res.status(400).json({ error: 'Invalid time format. Use HH:mm' });
    return;
  }

  // Validate requester info
  if (!requester.name || !requester.email) {
    res.status(400).json({ error: 'Name and email are required' });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(requester.email)) {
    res.status(400).json({ error: 'Invalid email address' });
    return;
  }

  if (requester.name.trim().length < 2) {
    res.status(400).json({ error: 'Name must be at least 2 characters' });
    return;
  }

  // Validate booking window
  if (!isWithinRange(date, AVAILABILITY_RULES.maxDaysAhead)) {
    res.status(400).json({ error: 'Date is outside the booking window' });
    return;
  }

  // Check if date is available
  if (!isDateAvailable(date, AVAILABILITY_RULES)) {
    res.status(400).json({ error: 'Selected date is not available for booking' });
    return;
  }

  // Get bookings from KV (persistent storage)
  const bookingsStore = await getBookingsFromKV();
  
  // Check max bookings per day
  if (eventType.maxPerDay) {
    const maxReached = isMaxBookingsReached(date, eventTypeId, eventType.maxPerDay, bookingsStore);
    if (maxReached) {
      res.status(409).json({ error: 'Maximum bookings reached for this date' });
      return;
    }
  }

  // Check for conflicts
  const hasConflict = bookingsStore.some((booking) => {
    if (booking.date !== date || booking.status !== 'confirmed') return false;
    
    const [existingHour, existingMinute] = booking.time.split(':').map(Number);
    const [newHour, newMinute] = time.split(':').map(Number);
    
    const existingStart = existingHour * 60 + existingMinute;
    const newStart = newHour * 60 + newMinute;
    const existingEnd = existingStart + booking.durationMinutes;
    const newEnd = newStart + durationMinutes;
    
    // Include buffers
    const bufferBefore = AVAILABILITY_RULES.bufferMinutesBefore;
    const bufferAfter = AVAILABILITY_RULES.bufferMinutesAfter;
    
    return (
      newStart - bufferBefore < existingEnd + bufferAfter &&
      newEnd + bufferAfter > existingStart - bufferBefore
    );
  });

  if (hasConflict) {
    res.status(409).json({ error: 'This time slot is no longer available' });
    return;
  }

  try {
    // Create booking
    const booking = {
      id: generateBookingId(),
      eventTypeId,
      date,
      time,
      durationMinutes,
      requester: {
        name: requester.name.trim(),
        email: requester.email.trim().toLowerCase(),
        notes: requester.notes?.trim() || undefined,
      },
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      requesterTimezone: requesterTimezone || 'UTC',
      ownerTimezone: AVAILABILITY_RULES.timezone,
    };

    // Store booking in KV (persistent storage)
    const saved = await saveBookingToKV(booking);
    if (!saved) {
      res.status(500).json({ error: 'Failed to save booking' });
      return;
    }

    // Log for debugging
    console.log(`[schedule/book] New booking created: ${booking.id} for ${booking.requester.email}`);

    // TODO: Send confirmation email (Phase 2)
    // Would integrate with Resend here like the contact form does

    res.status(201).json({
      ok: true,
      booking: {
        id: booking.id,
        eventTypeId: booking.eventTypeId,
        date: booking.date,
        time: booking.time,
        durationMinutes: booking.durationMinutes,
        requester: {
          name: booking.requester.name,
          email: booking.requester.email,
          notes: booking.requester.notes,
        },
        status: booking.status,
        createdAt: booking.createdAt,
        requesterTimezone: booking.requesterTimezone,
      },
    });
  } catch (err) {
    console.error('[schedule/book] Error:', err);
    res.status(500).json({ error: 'Failed to create booking' });
  }
}
