/**
 * Enhanced Availability API with Redis Caching
 * Returns available time slots with caching for better performance
 */
import { applyCors } from '../_lib/cors.js';
import { getCache, setCache } from '../_lib/redis.js';

const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || 'primary';
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY && process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');

const CACHE_TTL = 300; // 5 minutes cache

const BOOKING_CONFIGS = {
  'grab-coffee': {
    durationMinutes: 30,
    maxDurationMinutes: 60,
    maxPerDay: 4,
    bufferMinutes: 15,
    workingHours: { start: 9, end: 17 },
  },
  'book-podcast': {
    durationMinutes: 90,
    maxDurationMinutes: 120,
    maxPerDay: 2,
    bufferMinutes: 30,
    workingHours: { start: 9, end: 20 },
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
    const error = await response.text();
    throw new Error(`Token exchange failed: ${error}`);
  }

  const data = await response.json();
  return data.access_token;
}

async function getBusyTimes(accessToken, timeMin, timeMax) {
  const cacheKey = `calendar:busy:${timeMin}:${timeMax}`;
  
  // Try cache first
  const cached = await getCache(cacheKey);
  if (cached) {
    return cached;
  }

  const url = new URL('https://www.googleapis.com/calendar/v3/freeBusy');
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      timeMin,
      timeMax,
      items: [{ id: CALENDAR_ID }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Calendar API error: ${response.status}`);
  }

  const data = await response.json();
  const busyTimes = data.calendars[CALENDAR_ID]?.busy || [];
  
  // Cache the result
  await setCache(cacheKey, busyTimes, CACHE_TTL);
  
  return busyTimes;
}

function generateTimeSlots(dateStr, busyTimes, config) {
  const slots = [];
  const date = new Date(dateStr);
  const dayOfWeek = date.getUTCDay();

  // Skip weekends
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return slots;
  }

  const { workingHours, durationMinutes, bufferMinutes } = config;
  const slotDuration = durationMinutes + bufferMinutes;

  // Generate slots in working hours
  for (let hour = workingHours.start; hour < workingHours.end; hour++) {
    for (let minute = 0; minute < 60; minute += slotDuration) {
      const slotTime = new Date(date);
      slotTime.setUTCHours(hour, minute, 0, 0);

      const slotEnd = new Date(slotTime.getTime() + durationMinutes * 60000);

      // Check if slot conflicts with busy times
      const isAvailable = !busyTimes.some(busy => {
        const busyStart = new Date(busy.start);
        const busyEnd = new Date(busy.end);
        
        // Add buffer to busy time
        const bufferedBusyStart = new Date(busyStart.getTime() - bufferMinutes * 60000);
        const bufferedBusyEnd = new Date(busyEnd.getTime() + bufferMinutes * 60000);
        
        return slotTime < bufferedBusyEnd && slotEnd > bufferedBusyStart;
      });

      if (isAvailable) {
        slots.push({
          time: slotTime.toISOString(),
          duration: durationMinutes,
        });
      }
    }
  }

  return slots;
}

export default async function handler(req, res) {
  // Apply CORS
  const corsResult = applyCors(req, res);
  if (corsResult) return corsResult;

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { eventType, start, end } = req.query;

  if (!eventType || !start || !end) {
    return res.status(400).json({
      error: 'Missing required parameters: eventType, start, end',
    });
  }

  const config = BOOKING_CONFIGS[eventType];
  if (!config) {
    return res.status(400).json({
      error: `Unknown event type: ${eventType}`,
      availableTypes: Object.keys(BOOKING_CONFIGS),
    });
  }

  // Check cache for full availability response
  const cacheKey = `availability:${eventType}:${start}:${end}`;
  const cachedAvailability = await getCache(cacheKey);
  
  if (cachedAvailability) {
    res.setHeader('X-Cache', 'HIT');
    return res.status(200).json({
      days: cachedAvailability,
      cached: true,
      cachedAt: new Date().toISOString(),
    });
  }

  try {
    const accessToken = await getAccessToken();

    // Parse date range
    const startDate = new Date(start);
    const endDate = new Date(end);

    // Get busy times from calendar (with caching)
    const timeMin = startDate.toISOString();
    const timeMax = endDate.toISOString();
    const busyTimes = await getBusyTimes(accessToken, timeMin, timeMax);

    // Generate availability for each day
    const days = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const slots = generateTimeSlots(dateStr, busyTimes, config);

      days.push({
        date: dateStr,
        slots: slots.map(s => ({
          time: s.time,
          duration: s.duration,
        })),
      });

      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }

    // Cache the full response
    await setCache(cacheKey, days, CACHE_TTL);
    res.setHeader('X-Cache', 'MISS');

    return res.status(200).json({
      days,
      cached: false,
    });
  } catch (error) {
    console.error('Availability API error:', error);
    
    // Try to serve stale cache if available
    const staleCacheKey = `availability:${eventType}:${start}:${end}:stale`;
    const staleData = await getCache(staleCacheKey);
    
    if (staleData) {
      return res.status(200).json({
        days: staleData,
        cached: true,
        stale: true,
        warning: 'Serving stale data due to upstream error',
      });
    }

    return res.status(500).json({
      error: 'Failed to fetch availability',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}
