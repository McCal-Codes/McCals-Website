/**
 * Loads editable booking availability from Supabase.
 *
 * Working hours used to be hardcoded in schedule/availability.js, so changing
 * them meant a deploy. They now live in `availability_rules` /
 * `availability_blackouts` (see supabase/migrations/20260906120000).
 *
 * A weekday can have several windows: a day-job shift in the middle leaves a
 * morning and an evening. Each window carries its own notice period, so
 * hours that need a shift swapped can still be offered further out instead of
 * being closed entirely.
 *
 * Availability is on the critical path of the booking page, so every failure
 * here degrades to the previous hardcoded behaviour rather than showing a
 * visitor an empty calendar: an unconfigured Supabase, a query error, or a
 * booking type with no rows all fall back to DEFAULT_WEEKLY_HOURS.
 */

import { getServiceClient, isSupabaseConfigured } from './supabase-server.js';

/** The schedule that was hardcoded before this table existed. Monday-Saturday. */
const DEFAULT_WEEKLY_HOURS = {
  'grab-coffee': { startMinute: 9 * 60, endMinute: 17 * 60 },
  'book-podcast': { startMinute: 9 * 60, endMinute: 20 * 60 },
};

const DEFAULT_WEEKDAYS = [1, 2, 3, 4, 5, 6]; // Sunday (0) excluded, as before.
const DEFAULT_NOTICE_HOURS = 24;

function buildDefaults(bookingType) {
  const hours = DEFAULT_WEEKLY_HOURS[bookingType] ?? DEFAULT_WEEKLY_HOURS['grab-coffee'];
  const byWeekday = new Map();
  for (const weekday of DEFAULT_WEEKDAYS) {
    byWeekday.set(weekday, [
      {
        startMinute: hours.startMinute,
        endMinute: hours.endMinute,
        minNoticeHours: DEFAULT_NOTICE_HOURS,
      },
    ]);
  }
  return { byWeekday, blackouts: [], source: 'defaults' };
}

/**
 * @param {string} bookingType Key of BOOKING_CONFIGS, e.g. 'book-podcast'.
 * @param {string} start ISO date (YYYY-MM-DD), inclusive.
 * @param {string} end   ISO date (YYYY-MM-DD), inclusive.
 * @returns {Promise<{
 *   byWeekday: Map<number, Array<{startMinute:number,endMinute:number,minNoticeHours:number}>>,
 *   blackouts: Array<{startsOn: string, endsOn: string}>,
 *   source: 'supabase' | 'defaults'
 * }>}
 */
export async function loadAvailabilityRules(bookingType, start, end) {
  if (!isSupabaseConfigured()) return buildDefaults(bookingType);

  try {
    const supabase = getServiceClient();

    const [rulesResult, blackoutsResult] = await Promise.all([
      supabase
        .from('availability_rules')
        .select('weekday, start_minute, end_minute, min_notice_hours')
        .eq('booking_type', bookingType)
        .eq('is_active', true)
        .order('weekday')
        .order('start_minute'),
      supabase
        .from('availability_blackouts')
        .select('starts_on, ends_on, booking_type')
        .lte('starts_on', end)
        .gte('ends_on', start),
    ]);

    if (rulesResult.error) throw rulesResult.error;

    // No rows configured for this type is not an error. It means "never
    // set up", so use the schedule that shipped before the table existed.
    if (!rulesResult.data?.length) return buildDefaults(bookingType);

    const byWeekday = new Map();
    for (const row of rulesResult.data) {
      const windows = byWeekday.get(row.weekday) ?? [];
      windows.push({
        startMinute: row.start_minute,
        endMinute: row.end_minute,
        minNoticeHours: row.min_notice_hours ?? DEFAULT_NOTICE_HOURS,
      });
      byWeekday.set(row.weekday, windows);
    }

    // A blackout query failure must not silently open up blocked dates, so
    // fall back wholesale rather than proceeding with an empty list.
    if (blackoutsResult.error) throw blackoutsResult.error;

    const blackouts = (blackoutsResult.data ?? [])
      .filter((row) => !row.booking_type || row.booking_type === bookingType)
      .map((row) => ({ startsOn: row.starts_on, endsOn: row.ends_on }));

    return { byWeekday, blackouts, source: 'supabase' };
  } catch (err) {
    console.warn(
      '[availability-rules] Falling back to default hours:',
      err instanceof Error ? err.message : err
    );
    return buildDefaults(bookingType);
  }
}

/**
 * Flattens every window configured for a weekday into candidate slot starts.
 *
 * Windows may abut or overlap, since free time either side of a day-job shift
 * often touches it. Starts are de-duplicated, and where two windows offer the
 * same start the shorter notice wins. A start is only a candidate if the whole
 * booking fits inside its window.
 *
 * Pure, and exported for testing: this is the logic that decides what a visitor
 * is offered, and it is worth asserting directly rather than only through the
 * handler.
 *
 * @param {Array<{startMinute:number,endMinute:number,minNoticeHours:number}>|undefined} windows
 *   Undefined for a weekday with no rules, which is simply a closed day.
 * @param {number} durationMinutes
 * @param {number} [stepMinutes]
 * @returns {Array<{minuteOfDay:number, minNoticeHours:number}>} sorted by time
 */
export function buildSlotCandidates(windows, durationMinutes, stepMinutes = 30) {
  const byMinute = new Map();

  for (const window of windows ?? []) {
    for (
      let minuteOfDay = window.startMinute;
      minuteOfDay + durationMinutes <= window.endMinute;
      minuteOfDay += stepMinutes
    ) {
      const existing = byMinute.get(minuteOfDay);
      if (!existing || window.minNoticeHours < existing.minNoticeHours) {
        byMinute.set(minuteOfDay, { minuteOfDay, minNoticeHours: window.minNoticeHours });
      }
    }
  }

  return [...byMinute.values()].sort((a, b) => a.minuteOfDay - b.minuteOfDay);
}

/** True when `dateStr` (YYYY-MM-DD) falls inside any blackout range. */
export function isBlackedOut(dateStr, blackouts) {
  return blackouts.some((range) => dateStr >= range.startsOn && dateStr <= range.endsOn);
}

/**
 * True when `slotStart` is far enough in the future to satisfy the window's
 * notice period. This is what lets day-job hours stay bookable two weeks out
 * while free time is bookable tomorrow.
 */
export function meetsNoticePeriod(slotStart, minNoticeHours, now = new Date()) {
  return slotStart.getTime() - now.getTime() >= minNoticeHours * 60 * 60 * 1000;
}
