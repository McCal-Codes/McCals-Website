import { kv } from '@vercel/kv';
import { getEventTypeById } from '../../../src/components/scheduling/config/eventTypes';
import { AVAILABILITY_RULES } from '../../../src/components/scheduling/config/availability';
import { 
  getAvailabilityForRange,
  isMaxBookingsReached,
} from '../../../src/components/scheduling/utils/availability';
import { parseDateString, formatDateForInput } from '../../../src/components/scheduling/utils/dateHelpers';

/**
 * GET /api/schedule/availability
 * Returns available dates and time slots for a date range
 * Uses Vercel KV for persistent booking storage
 * 
 * Query params:
 * - eventType: string (required) - the event type ID
 * - start: string (required) - start date YYYY-MM-DD
 * - end: string (required) - end date YYYY-MM-DD
 */

// Helper to get bookings from KV
async function getBookingsFromKV() {
  try {
    const bookings = await kv.get('schedule:bookings');
    return Array.isArray(bookings) ? bookings : [];
  } catch (err) {
    console.error('[schedule/availability] KV read error:', err);
    // Fallback to empty array if KV fails
    return [];
  }
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { eventType: eventTypeId, start, end } = req.query;

  // Validation
  if (!eventTypeId || !start || !end) {
    res.status(400).json({ error: 'Missing required parameters: eventType, start, end' });
    return;
  }

  // Validate event type exists
  const eventType = getEventTypeById(eventTypeId);
  if (!eventType) {
    res.status(400).json({ error: 'Invalid event type' });
    return;
  }

  // Validate dates
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(start) || !dateRegex.test(end)) {
    res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    return;
  }

  // Check range limits (max 90 days)
  const startDate = parseDateString(start);
  const endDate = parseDateString(end);
  const dayDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  
  if (dayDiff > 90 || dayDiff < 0) {
    res.status(400).json({ error: 'Date range must be between 0 and 90 days' });
    return;
  }

  try {
    // Get bookings from KV (persistent storage)
    const bookingsStore = await getBookingsFromKV();
    
    // Get availability for the range
    const days = getAvailabilityForRange(
      start,
      end,
      eventType.durationMinutes,
      bookingsStore,
      AVAILABILITY_RULES
    );

    // Filter out days that hit max bookings per day
    const filteredDays = days.map((day) => {
      const maxReached = eventType.maxPerDay 
        ? isMaxBookingsReached(day.date, eventTypeId, eventType.maxPerDay, bookingsStore)
        : false;
      
      if (maxReached) {
        return { ...day, available: false, slots: [] };
      }
      
      // Filter slots based on current time (respect minHoursNotice)
      const now = new Date();
      const isToday = formatDateForInput(now) === day.date;
      
      if (isToday) {
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentTimeMinutes = currentHour * 60 + currentMinute;
        const minNoticeMinutes = AVAILABILITY_RULES.minHoursNotice * 60;
        
        const filteredSlots = day.slots.map((slot) => {
          const [slotHour, slotMinute] = slot.time.split(':').map(Number);
          const slotTimeMinutes = slotHour * 60 + slotMinute;
          const isTooSoon = (slotTimeMinutes - currentTimeMinutes) < minNoticeMinutes;
          
          return {
            ...slot,
            available: slot.available && !isTooSoon,
          };
        });
        
        return {
          ...day,
          slots: filteredSlots,
          available: filteredSlots.some((s) => s.available),
        };
      }
      
      return day;
    });

    res.status(200).json({
      eventType: {
        id: eventType.id,
        name: eventType.name,
        durationMinutes: eventType.durationMinutes,
        maxPerDay: eventType.maxPerDay,
      },
      timezone: AVAILABILITY_RULES.timezone,
      days: filteredDays,
    });
  } catch (err) {
    console.error('[schedule/availability] Error:', err);
    res.status(500).json({ error: 'Failed to load availability' });
  }
}
