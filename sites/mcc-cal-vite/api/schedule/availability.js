/**
 * Google Calendar Availability API
 * Returns available time slots for booking
 */
import { applyCors } from '../_lib/cors.js';
import { getServiceClient, isSupabaseConfigured } from '../_lib/supabase-server.js';
import { BOOKING_CONFIGS, buildTimeSlot } from '../_lib/booking-config.js';
import { OWNER_TIMEZONE, ownerWallTimeToUtc } from '../_lib/timezone.js';
import {
  loadAvailabilityRules,
  isBlackedOut,
  meetsNoticePeriod,
} from '../_lib/availability-rules.js';

/** Minutes from midnight as an owner-timezone wall clock string, e.g. 570 -> "09:30". */
function minuteOfDayToHhmm(minuteOfDay) {
  const hour = Math.floor(minuteOfDay / 60);
  const minute = minuteOfDay % 60;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || 'primary';
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY && process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');

async function getAccessToken() {
  if (!SERVICE_ACCOUNT_EMAIL || !PRIVATE_KEY) {
    throw new Error('Google service account credentials not configured');
  }

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claim = {
    iss: SERVICE_ACCOUNT_EMAIL,
    scope: 'https://www.googleapis.com/auth/calendar.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };

  const base64UrlEncode = (obj) =>
    Buffer.from(JSON.stringify(obj)).toString('base64url');

  const headerB64 = base64UrlEncode(header);
  const claimB64 = base64UrlEncode(claim);
  const signatureInput = `${headerB64}.${claimB64}`;

  // Sign with private key
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

async function getBusyTimes(accessToken, startDate, endDate) {
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events?timeMin=${startDate}T00:00:00Z&timeMax=${endDate}T23:59:59Z&singleEvents=true`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Calendar fetch failed: ${error}`);
  }

  const data = await response.json();
  return (data.items || []).map((event) => ({
    start: event.start?.dateTime || `${event.start?.date}T00:00:00`,
    end: event.end?.dateTime || `${event.end?.date}T23:59:59`,
  }));
}

async function getSupabaseBookedSlots(startDate, endDate) {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = getServiceClient();
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('booking_date, booking_time, duration_minutes')
    .gte('booking_date', startDate)
    .lte('booking_date', endDate)
    .neq('status', 'cancelled');

  if (error) {
    console.error('[availability] Error fetching Supabase bookings: - availability.js:112', error);
    return [];
  }

  return (bookings || []).map(booking => {
    // booking_time is stored as owner-timezone wall clock (schedule/book.js
    // writes the slot's `time` straight through), so it must be converted the
    // same way rather than read as UTC — otherwise conflict detection is off
    // by the zone offset and double-bookings slip through.
    const start = ownerWallTimeToUtc(booking.booking_date, booking.booking_time || '00:00:00');
    const end = new Date(start.getTime() + (booking.duration_minutes || 60) * 60_000);
    return {
      start: start.toISOString(),
      end: end.toISOString(),
    };
  });
}

/**
 * @param {Array<{minuteOfDay: number, minNoticeHours: number}>} candidates
 *   Slot starts for this day, already flattened across every configured window
 *   and filtered to those that fit the booking duration.
 */
function generateTimeSlots(date, config, busyTimes, candidates) {
  const slots = [];
  const { durationMinutes, bufferMinutes } = config;

  for (const { minuteOfDay, minNoticeHours } of candidates) {
    {
      const slotStart = ownerWallTimeToUtc(date, minuteOfDayToHhmm(minuteOfDay));
      const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60_000);

      // Day-job hours are offered only far enough ahead to swap a shift.
      if (!meetsNoticePeriod(slotStart, minNoticeHours)) {
        continue;
      }

      // Check for conflicts against all busy times with proper buffer handling
      const conflicts = busyTimes.some((busy) => {
        const busyStart = new Date(busy.start);
        const busyEnd = new Date(busy.end);
        // Use the longer of the two booking type buffers to ensure no conflicts
        // Coffee: 15 min, Podcast: 30 min. When checking availability, we enforce
        // the stricter 30min buffer for all bookings to prevent back-to-back
        // scheduling issues and allow adequate prep time between sessions.
        const effectiveBuffer = Math.max(bufferMinutes, 30);
        busyStart.setMinutes(busyStart.getMinutes() - effectiveBuffer);
        busyEnd.setMinutes(busyEnd.getMinutes() + effectiveBuffer);
        return slotStart < busyEnd && slotEnd > busyStart;
      });

      if (!conflicts) {
        // Slot times are wall-clock in the owner's zone, not the runtime's.
        slots.push(
          buildTimeSlot(
            Math.floor(minuteOfDay / 60),
            minuteOfDay % 60,
            slotStart.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
              timeZone: OWNER_TIMEZONE,
            })
          )
        );
      }
    }
  }

  return slots;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  if (applyCors(req, res, { methods: 'GET, OPTIONS' })) {
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { eventType, start, end } = req.query;

  if (!eventType || !start || !end) {
    res.status(400).json({ error: 'Missing required parameters: eventType, start, end' });
    return;
  }

  const config = BOOKING_CONFIGS[eventType];
  if (!config) {
    res.status(400).json({ error: `Unknown event type: ${eventType}` });
    return;
  }

  // Validate date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(start) || !dateRegex.test(end)) {
    res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    return;
  }

  // Editable weekly windows and blackout dates. Falls back to the previously
  // hardcoded schedule if Supabase is unset or the query fails, so the booking
  // calendar never goes blank because of a database problem.
  const rules = await loadAvailabilityRules(eventType, start, end);

  /**
   * Candidate slot starts for a calendar day, flattened across every window
   * configured for that weekday, each carrying the notice period of the window
   * it came from.
   *
   * Returns an empty array when the day is closed — no rule covers that
   * weekday, or a blackout range hits it. Windows may overlap (free time
   * either side of a shift often abuts it), so starts are de-duplicated, and
   * where two windows offer the same start the shorter notice wins.
   */
  const slotCandidatesFor = (dateStr, weekday, durationMinutes) => {
    if (isBlackedOut(dateStr, rules.blackouts)) return [];

    const byMinute = new Map();
    for (const window of rules.byWeekday.get(weekday) ?? []) {
      for (
        let minuteOfDay = window.startMinute;
        minuteOfDay + durationMinutes <= window.endMinute;
        minuteOfDay += 30
      ) {
        const existing = byMinute.get(minuteOfDay);
        if (!existing || window.minNoticeHours < existing.minNoticeHours) {
          byMinute.set(minuteOfDay, {
            minuteOfDay,
            minNoticeHours: window.minNoticeHours,
          });
        }
      }
    }

    return [...byMinute.values()].sort((a, b) => a.minuteOfDay - b.minuteOfDay);
  };

  // Development mode: return mock availability
  const isDev = !process.env.VERCEL && (!process.env.NODE_ENV || process.env.NODE_ENV === 'development');
  if (isDev) {
    const config = BOOKING_CONFIGS[eventType];
    const days = [];
    const current = new Date(start);
    const endDate = new Date(end);

    while (current <= endDate) {
      const dateStr = current.toISOString().split('T')[0];
      const candidates = slotCandidatesFor(dateStr, current.getDay(), config.durationMinutes);
      if (candidates.length) {
        const slots = [];

        for (const { minuteOfDay, minNoticeHours } of candidates) {
          {
            // The loop counter is owner-timezone wall time, so build the
            // instant through the same converter the booking endpoint uses.
            const hhmm = minuteOfDayToHhmm(minuteOfDay);
            const slotTime = ownerWallTimeToUtc(dateStr, hhmm);

            // Day-job hours are offered only far enough ahead to swap a shift.
            if (!meetsNoticePeriod(slotTime, minNoticeHours)) {
              continue;
            }

            slots.push(
              buildTimeSlot(
                Math.floor(minuteOfDay / 60),
                minuteOfDay % 60,
                slotTime.toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                  timeZone: OWNER_TIMEZONE,
                })
              )
            );
          }
        }
        
        if (slots.length > 0) {
          days.push({
            date: dateStr,
            available: true,
            slots: slots.slice(0, config.maxPerDay * 2),
          });
        }
      }
      current.setDate(current.getDate() + 1);
    }

    res.status(200).json({ days });
    return;
  }

  // Check if Google Calendar credentials are configured
  if (!SERVICE_ACCOUNT_EMAIL || !PRIVATE_KEY) {
    console.warn('[schedule/availability] Google Calendar credentials not configured, returning mock availability');
    // Return mock availability (same as dev mode)
    const days = [];
    const supabaseBookedSlots = await getSupabaseBookedSlots(start, end);
    
    // Parse dates in UTC to avoid timezone issues
    const parseDateUTC = (dateStr) => {
      const [year, month, day] = dateStr.split('-').map(Number);
      return new Date(Date.UTC(year, month - 1, day));
    };
    
    const current = parseDateUTC(start);
    const endDate = parseDateUTC(end);

    while (current <= endDate) {
      const dateStr = current.toISOString().split('T')[0];
      const candidates = slotCandidatesFor(dateStr, current.getUTCDay(), config.durationMinutes);
      if (candidates.length) {
        const slots = [];

        for (const { minuteOfDay, minNoticeHours } of candidates) {
          {
            const hhmm = minuteOfDayToHhmm(minuteOfDay);
            const slotTime = ownerWallTimeToUtc(dateStr, hhmm);

            const slotEnd = new Date(slotTime.getTime() + config.durationMinutes * 60_000);
            if (!meetsNoticePeriod(slotTime, minNoticeHours)) {
              continue;
            }

            const conflicts = supabaseBookedSlots.some((busy) => {
              const busyStart = new Date(busy.start);
              const busyEnd = new Date(busy.end);
              return slotTime < busyEnd && slotEnd > busyStart;
            });

            if (conflicts) {
              continue;
            }
            
            slots.push(
              buildTimeSlot(
                Math.floor(minuteOfDay / 60),
                minuteOfDay % 60,
                slotTime.toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                  timeZone: 'UTC',
                })
              )
            );
          }
        }
        
        if (slots.length > 0) {
          days.push({
            date: dateStr,
            available: true,
            slots: slots.slice(0, config.maxPerDay * 2),
          });
        }
      }
      current.setUTCDate(current.getUTCDate() + 1);
    }

    res.status(200).json({ days, mock: true });
    return;
  }

  // Production mode: use Google Calendar API + Supabase bookings
  try {
    const accessToken = await getAccessToken();
    const calendarBusyTimes = await getBusyTimes(accessToken, start, end);
    const supabaseBookedSlots = await getSupabaseBookedSlots(start, end);
    
    // Merge both sources of busy times
    const busyTimes = [...calendarBusyTimes, ...supabaseBookedSlots];

    const config = BOOKING_CONFIGS[eventType];
    const days = [];
    const current = new Date(start);
    const endDate = new Date(end);

    while (current <= endDate) {
      const dateStr = current.toISOString().split('T')[0];
      const candidates = slotCandidatesFor(dateStr, current.getDay(), config.durationMinutes);
      if (candidates.length) {
        const slots = generateTimeSlots(dateStr, config, busyTimes, candidates);

        if (slots.length > 0) {
          days.push({
            date: dateStr,
            available: true,
            slots: slots.slice(0, config.maxPerDay),
          });
        }
      }
      current.setDate(current.getDate() + 1);
    }

    res.status(200).json({ days });
  } catch (err) {
    console.error('[schedule/availability] Error loading availability:', err);
    res.status(500).json({ error: 'Failed to load availability. Please try again.' });
  }
}
