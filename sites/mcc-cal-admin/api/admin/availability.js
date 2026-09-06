/**
 * Read and update booking availability.
 *
 * Backs the admin Availability editor. Weekly windows used to be hardcoded in
 * the public site's schedule/availability.js, so changing when you could be
 * booked meant editing code and redeploying; they now live in
 * `availability_rules` (see supabase/migrations/20260906120000).
 *
 * Times are minutes from midnight in the owner's timezone, matching the
 * migration and the public site's api/_lib/timezone.js.
 */

import { requireAdminSession } from '../_lib/auth.js';
import {
  fetchAvailability,
  isAvailabilityConfigured,
  replaceRulesForType,
} from '../_lib/availability-data.js';

const VALID_BOOKING_TYPES = new Set(['grab-coffee', 'book-podcast']);
const MINUTES_IN_DAY = 1440;

function isValidRule(rule) {
  return (
    rule &&
    Number.isInteger(rule.weekday) &&
    rule.weekday >= 0 &&
    rule.weekday <= 6 &&
    Number.isInteger(rule.startMinute) &&
    Number.isInteger(rule.endMinute) &&
    rule.startMinute >= 0 &&
    rule.endMinute <= MINUTES_IN_DAY &&
    rule.endMinute > rule.startMinute &&
    Number.isInteger(rule.minNoticeHours) &&
    rule.minNoticeHours >= 0 &&
    // A year of notice is not a schedule, it is a typo.
    rule.minNoticeHours <= 8760 &&
    (rule.label == null || typeof rule.label === 'string')
  );
}

export default async function handler(req, res) {
  const session = requireAdminSession(req, res);
  if (!session) return;

  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (!isAvailabilityConfigured()) {
    return res.status(503).json({ ok: false, error: 'supabase_not_configured' });
  }

  try {
    if (req.method === 'GET') {
      return res.status(200).json({ ok: true, data: await fetchAvailability() });
    }

    if (req.method === 'PUT') {
      const { bookingType, rules } = req.body ?? {};

      if (!VALID_BOOKING_TYPES.has(bookingType)) {
        return res.status(400).json({ ok: false, error: 'invalid_booking_type' });
      }
      if (!Array.isArray(rules) || !rules.every(isValidRule)) {
        return res.status(400).json({ ok: false, error: 'invalid_rules' });
      }
      // A weekday may have several windows, but two cannot start at the same
      // minute — that is the table's unique constraint.
      const starts = rules.map((rule) => `${rule.weekday}:${rule.startMinute}`);
      if (new Set(starts).size !== starts.length) {
        return res.status(400).json({ ok: false, error: 'duplicate_window_start' });
      }

      await replaceRulesForType(bookingType, rules);
      return res.status(200).json({ ok: true, data: await fetchAvailability() });
    }

    res.setHeader('Allow', 'GET, PUT');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  } catch (err) {
    const status = err.statusCode && err.statusCode >= 400 ? err.statusCode : 500;
    return res.status(status).json({ ok: false, error: err.code || 'availability_failed' });
  }
}
