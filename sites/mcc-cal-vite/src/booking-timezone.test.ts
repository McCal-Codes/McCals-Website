import { describe, expect, it } from 'vitest';
import { ownerWallTimeToUtc, getZoneWallParts, OWNER_TIMEZONE } from '../api/_lib/timezone.js';

/**
 * Booking slots are wall-clock times in the owner's zone. They used to be
 * turned into instants with `new Date(\`${date}T${time}\`)`, which resolves
 * against the *runtime's* zone, correct on a laptop in New York, four hours
 * wrong on Vercel, where the runtime is UTC. Every calendar event, conflict
 * check and confirmation email was affected, and none of it was reproducible
 * locally.
 *
 * These assertions are absolute: they compare against fixed UTC instants, so
 * they hold no matter what TZ the test runner happens to have.
 */
describe('owner wall time to UTC', () => {
  it.each([
    ['2026-09-08', '09:00', '2026-09-08T13:00:00.000Z', 'EDT (UTC-4)'],
    ['2026-01-15', '09:00', '2026-01-15T14:00:00.000Z', 'EST (UTC-5)'],
    ['2026-03-08', '09:00', '2026-03-08T13:00:00.000Z', 'spring-forward day'],
    ['2026-11-01', '09:00', '2026-11-01T14:00:00.000Z', 'fall-back day'],
    ['2026-09-08', '17:30', '2026-09-08T21:30:00.000Z', 'afternoon slot'],
  ])('%s %s in the owner zone is %s (%s)', (date, time, expected) => {
    expect(ownerWallTimeToUtc(date, time).toISOString()).toBe(expected);
  });

  it('accepts HH:mm:ss as well as HH:mm', () => {
    expect(ownerWallTimeToUtc('2026-09-08', '09:00:00').toISOString()).toBe(
      '2026-09-08T13:00:00.000Z'
    );
  });

  it('returns an invalid date for malformed input rather than a wrong instant', () => {
    expect(Number.isNaN(ownerWallTimeToUtc('not-a-date', '09:00').getTime())).toBe(true);
  });

  it('round-trips back to the same wall time', () => {
    const instant = ownerWallTimeToUtc('2026-09-08', '09:00');
    expect(getZoneWallParts(instant, OWNER_TIMEZONE)).toEqual({ hour: 9, minute: 0 });
  });

  it('reads wall parts in the owner zone, not the runtime zone', () => {
    // 13:00Z is 09:00 in New York year-round-adjusted terms for this date.
    expect(getZoneWallParts(new Date('2026-09-08T13:00:00.000Z'))).toEqual({
      hour: 9,
      minute: 0,
    });
  });
});
