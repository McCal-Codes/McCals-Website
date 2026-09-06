import { describe, expect, it } from 'vitest';
import {
  buildSlotCandidates,
  isBlackedOut,
  meetsNoticePeriod,
} from '../api/_lib/availability-rules.js';

/**
 * The real seeded schedule (supabase/migrations/20260906120000), in the shape
 * loadAvailabilityRules returns. Asserting against the actual configuration
 * rather than invented fixtures means these fail if the seed and the intent
 * ever drift apart.
 *
 * Day job: Mon/Wed 10:00-18:00, Tue 12:00-20:00, Sat/Sun 12:00-20:00.
 * Thu and Fri are off. Free windows carry 24h notice; shift hours 336h.
 */
const FREE = 24;
const SHIFT = 336;

const MONDAY = [
  { startMinute: 540, endMinute: 600, minNoticeHours: FREE }, // 09:00-10:00
  { startMinute: 600, endMinute: 1080, minNoticeHours: SHIFT }, // 10:00-18:00 shift
  { startMinute: 1110, endMinute: 1260, minNoticeHours: FREE }, // 18:30-21:00
];

const THURSDAY = [{ startMinute: 540, endMinute: 1200, minNoticeHours: FREE }]; // 09:00-20:00

describe('slot candidates from weekly windows', () => {
  it('spans every window on a day, not just the first', () => {
    const candidates = buildSlotCandidates(MONDAY, 30);
    const minutes = candidates.map((candidate) => candidate.minuteOfDay);

    expect(minutes).toContain(540); // morning, before the shift
    expect(minutes).toContain(720); // midday, inside the shift
    expect(minutes).toContain(1110); // evening, after the shift
  });

  it('carries each window own notice period', () => {
    const byMinute = new Map(
      buildSlotCandidates(MONDAY, 30).map((c) => [c.minuteOfDay, c.minNoticeHours])
    );

    expect(byMinute.get(540)).toBe(FREE);
    expect(byMinute.get(720)).toBe(SHIFT);
    expect(byMinute.get(1110)).toBe(FREE);
  });

  it('returns candidates in chronological order', () => {
    const minutes = buildSlotCandidates(MONDAY, 30).map((c) => c.minuteOfDay);
    expect([...minutes].sort((a, b) => a - b)).toEqual(minutes);
  });

  it('drops starts where the booking would overrun the window', () => {
    // Monday's free morning is 09:00-10:00, so a 60-minute podcast fits once
    // and a 90-minute booking not at all.
    expect(buildSlotCandidates([MONDAY[0]], 60).map((c) => c.minuteOfDay)).toEqual([540]);
    expect(buildSlotCandidates([MONDAY[0]], 90)).toEqual([]);
  });

  it('prefers the shorter notice when two windows offer the same start', () => {
    const overlapping = [
      { startMinute: 540, endMinute: 720, minNoticeHours: SHIFT },
      { startMinute: 540, endMinute: 720, minNoticeHours: FREE },
    ];
    expect(buildSlotCandidates(overlapping, 30)[0].minNoticeHours).toBe(FREE);
  });

  it('treats a day off as open all day', () => {
    const candidates = buildSlotCandidates(THURSDAY, 60);
    expect(candidates[0].minuteOfDay).toBe(540); // 09:00
    // Last 60-minute slot that fits before 20:00 starts at 19:00.
    expect(candidates[candidates.length - 1].minuteOfDay).toBe(1140);
    expect(candidates.every((c) => c.minNoticeHours === FREE)).toBe(true);
  });

  it('offers nothing for a weekday with no configured windows', () => {
    expect(buildSlotCandidates(undefined, 30)).toEqual([]);
    expect(buildSlotCandidates([], 30)).toEqual([]);
  });
});

describe('notice periods', () => {
  const now = new Date('2026-09-06T12:00:00.000Z');

  it('offers free time tomorrow but not in the next hour', () => {
    expect(meetsNoticePeriod(new Date('2026-09-08T12:00:00.000Z'), FREE, now)).toBe(true);
    expect(meetsNoticePeriod(new Date('2026-09-06T12:30:00.000Z'), FREE, now)).toBe(false);
  });

  it('holds day-job hours back until the shift could be swapped', () => {
    // A week out is not enough warning to move a shift; three weeks is.
    expect(meetsNoticePeriod(new Date('2026-09-13T12:00:00.000Z'), SHIFT, now)).toBe(false);
    expect(meetsNoticePeriod(new Date('2026-09-27T12:00:00.000Z'), SHIFT, now)).toBe(true);
  });
});

describe('blackout dates', () => {
  const blackouts = [{ startsOn: '2026-12-24', endsOn: '2026-12-26' }];

  it('blocks the whole range inclusively and nothing outside it', () => {
    expect(isBlackedOut('2026-12-24', blackouts)).toBe(true);
    expect(isBlackedOut('2026-12-25', blackouts)).toBe(true);
    expect(isBlackedOut('2026-12-26', blackouts)).toBe(true);
    expect(isBlackedOut('2026-12-23', blackouts)).toBe(false);
    expect(isBlackedOut('2026-12-27', blackouts)).toBe(false);
  });
});
