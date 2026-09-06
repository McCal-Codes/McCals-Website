/**
 * Server-side booking type configuration, the single source of truth for
 * both `schedule/book.js` and `schedule/availability.js`.
 *
 * It lives in `_lib` rather than inline in a route so it can be imported
 * without pulling in Resend, Supabase and the Redis limiter, which is what
 * lets `src/booking-config-parity.test.ts` check it against the client's
 * `BOOKING_TYPES` without mocking any of them.
 *
 * There used to be two copies of this object, one per route, and they had
 * drifted: `book.js` required podcast bookings to be at least 90 minutes while
 * the client offered 60, so every submission was rejected with a 400. Keep
 * this as the only definition.
 *
 * `durationMinutes` is the *minimum* accepted duration, not a default: the
 * booked length arrives on the request and is validated against the
 * [durationMinutes, maxDurationMinutes] range. It must therefore stay at or
 * below the duration the client is configured to send.
 */
export const BOOKING_CONFIGS = {
  'grab-coffee': {
    name: 'Grab a Coffee',
    durationMinutes: 30,
    maxDurationMinutes: 60,
    maxPerDay: 4,
    bufferMinutes: 15,
    workingHours: { start: 9, end: 17 }, // 9 AM - 5 PM
    location: 'Google Meet',
    allowInPerson: true,
    inPersonLabel: 'In person, around Pittsburgh',
    confirmationTitle: 'Coffee chat booked',
    // Shown on screen straight after booking.
    confirmationMessage: "Looking forward to it. A confirmation is on its way to your email.",
    // Shown inside that email, where the line above would be talking about itself.
    emailMessage: 'Looking forward to it. If anything changes, use the link below.',
  },
  'book-podcast': {
    name: 'Book a Podcast Recording',
    durationMinutes: 60,
    maxDurationMinutes: 120,
    maxPerDay: 2,
    bufferMinutes: 30,
    workingHours: { start: 9, end: 20 }, // 9 AM - 8 PM
    location: 'Zoom or Google Meet',
    allowInPerson: true,
    inPersonLabel: 'In person, around Pittsburgh',
    confirmationTitle: 'Podcast session booked',
    confirmationMessage: "We're all set to record. A confirmation is on its way to your email.",
    emailMessage: "We're all set to record. I'll send a few notes closer to the date. If anything changes, use the link below.",
  },
};

/**
 * Builds a time slot in the shape the client's `TimeSlot` type declares.
 *
 * The two sides had disagreed on all three fields: the API emitted
 * `{ time: <full ISO>, display }` while `TimeSlotGrid` filters on
 * `slot.available` and renders `slot.displayTime`, and `schedule/book.js`
 * parses the submitted time as `new Date(\`${date}T${time}\`)`, which a full
 * ISO string cannot satisfy. The result was "No available times for this date"
 * on every date, for every booking type.
 *
 * @param {number} hour   Hour of the slot, in the same frame as the caller's date maths.
 * @param {number} minute Minute of the slot.
 * @param {string} displayTime Preformatted label for the requester.
 */
export function buildTimeSlot(hour, minute, displayTime) {
  const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  return { time, displayTime, available: true };
}

/**
 * Resolves what to show as the meeting location.
 *
 * A booking is virtual unless the requester chose in person and gave somewhere
 * to be. An in-person choice with no address falls back to virtual rather than
 * producing a calendar event that says "in person" and nothing else, better to
 * be quietly wrong in the safe direction than to have two people turn up
 * nowhere.
 *
 * @param {{ location: string }} config
 * @param {'virtual'|'in-person'|undefined} mode
 * @param {string|undefined} detail Free text address supplied by the requester.
 * @returns {{ label: string, isInPerson: boolean }}
 */
export function resolveLocation(config, mode, detail) {
  const trimmed = typeof detail === 'string' ? detail.trim() : '';

  if (mode === 'in-person' && trimmed) {
    return { label: trimmed, isInPerson: true };
  }

  return { label: config.location, isInPerson: false };
}
