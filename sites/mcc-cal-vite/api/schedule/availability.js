/**
 * Google Calendar Availability API
 * Returns available time slots for booking
 */

const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || 'primary';
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

// Booking type configurations with duration ranges
const BOOKING_CONFIGS = {
  'grab-coffee': {
    durationMinutes: 30,
    maxDurationMinutes: 60,
    maxPerDay: 4,
    bufferMinutes: 15,
    workingHours: { start: 9, end: 17 }, // 9 AM - 5 PM
  },
  'book-podcast': {
    durationMinutes: 90,
    maxDurationMinutes: 120,
    maxPerDay: 2,
    bufferMinutes: 30,
    workingHours: { start: 9, end: 20 }, // 9 AM - 8 PM
  },
};

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

function generateTimeSlots(date, config, busyTimes) {
  const slots = [];
  const { durationMinutes, workingHours, bufferMinutes } = config;

  const startHour = workingHours.start;
  const endHour = workingHours.end;

  // Generate slots every 30 minutes
  for (let hour = startHour; hour < endHour; hour++) {
    for (const minute of [0, 30]) {
      const slotStart = new Date(date);
      slotStart.setHours(hour, minute, 0, 0);

      const slotEnd = new Date(slotStart);
      slotEnd.setMinutes(slotStart.getMinutes() + durationMinutes);

      // Don't generate slots that go past working hours
      if (slotEnd.getHours() > endHour || (slotEnd.getHours() === endHour && slotEnd.getMinutes() > 0)) {
        continue;
      }

      // Check for conflicts against all busy times with proper buffer handling
const conflicts = busyTimes.some((busy) => {
  const busyStart = new Date(busy.start);
  const busyEnd = new Date(busy.end);
  // Use the longer of the two booking type buffers to ensure no conflicts
  // Coffee: 15 min, Podcast: 30 min
  const effectiveBuffer = Math.max(bufferMinutes, 30); // Ensure podcast buffer respected
  busyStart.setMinutes(busyStart.getMinutes() - effectiveBuffer);
  busyEnd.setMinutes(busyEnd.getMinutes() + effectiveBuffer);
  return slotStart < busyEnd && slotEnd > busyStart;
});

      if (!conflicts) {
        slots.push({
          time: slotStart.toISOString(),
          display: slotStart.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          }),
        });
      }
    }
  }

  return slots;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
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

  // Development mode: return mock availability
  const isDev = !process.env.VERCEL && (!process.env.NODE_ENV || process.env.NODE_ENV === 'development');
  if (isDev) {
    const config = BOOKING_CONFIGS[eventType];
    const days = [];
    const current = new Date(start);
    const endDate = new Date(end);

    while (current <= endDate) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0) { // Skip Sundays only, allow Saturdays
        const dateStr = current.toISOString().split('T')[0];
        const slots = [];
        
        // Generate mock slots every 30 minutes
        for (let hour = config.workingHours.start; hour < config.workingHours.end; hour++) {
          for (const minute of [0, 30]) {
            const slotTime = new Date(current);
            slotTime.setHours(hour, minute, 0, 0);
            
            // Check if slot would end past working hours
            const slotEnd = new Date(slotTime);
            slotEnd.setMinutes(slotTime.getMinutes() + config.durationMinutes);
            if (slotEnd.getHours() > config.workingHours.end || 
                (slotEnd.getHours() === config.workingHours.end && slotEnd.getMinutes() > 0)) {
              continue;
            }
            
            slots.push({
              time: slotTime.toISOString(),
              display: slotTime.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              }),
            });
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

  // Production mode: use Google Calendar API
  try {
    const accessToken = await getAccessToken();
    const busyTimes = await getBusyTimes(accessToken, start, end);

    const config = BOOKING_CONFIGS[eventType];
    const days = [];
    const current = new Date(start);
    const endDate = new Date(end);

    while (current <= endDate) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0) { // Skip Sundays only, allow Saturdays
        const dateStr = current.toISOString().split('T')[0];
        const slots = generateTimeSlots(dateStr, config, busyTimes);

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
    console.error('[schedule/availability] Error: - availability.js:260', err);
    res.status(500).json({ error: 'Failed to load availability. Please try again.' });
  }
}
