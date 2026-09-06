/**
 * Timezone helpers for the booking API.
 *
 * Slot times (`"09:00"`) are wall-clock times in the *owner's* zone — that is
 * what the client's `TimeSlot` type documents and what the availability
 * endpoint generates. Turning one into an instant with
 * `new Date(\`${date}T${time}\`)` is wrong: a date-time string with no offset
 * is interpreted in the *runtime's* zone. That happens to be correct on a
 * laptop in New York and wrong on Vercel, where the runtime is UTC — a 9:00 AM
 * Eastern booking became 09:00Z, i.e. 5:00 AM Eastern, and the calendar event,
 * the conflict check and the confirmation email were all four hours early.
 *
 * `ownerWallTimeToUtc` does the conversion properly, including across DST
 * boundaries, using only Intl.
 */

/** Must match AVAILABILITY_RULES.timezone and the client's OWNER_TIMEZONE. */
export const OWNER_TIMEZONE = 'America/New_York';

/**
 * Offset of `timeZone` from UTC, in milliseconds, at a given instant.
 * Positive east of Greenwich. Derived by asking Intl what wall-clock time the
 * zone shows at that instant and comparing it to the instant itself.
 */
export function getZoneOffsetMs(utcMs, timeZone) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const parts = {};
  for (const part of formatter.formatToParts(new Date(utcMs))) {
    if (part.type !== 'literal') parts[part.type] = part.value;
  }

  // Intl renders midnight as hour 24 in some environments.
  const hour = Number(parts.hour) % 24;

  const wallAsUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    hour,
    Number(parts.minute),
    Number(parts.second)
  );

  return wallAsUtc - utcMs;
}

/**
 * Wall-clock hour and minute an instant shows in `timeZone`.
 *
 * The inverse direction of `ownerWallTimeToUtc`, used when building slots from
 * real Date objects: `date.getHours()` would report the runtime's zone, which
 * is UTC on Vercel.
 *
 * @returns {{hour: number, minute: number}}
 */
export function getZoneWallParts(date, timeZone = OWNER_TIMEZONE) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
  });

  const parts = {};
  for (const part of formatter.formatToParts(date)) {
    if (part.type !== 'literal') parts[part.type] = part.value;
  }

  return { hour: Number(parts.hour) % 24, minute: Number(parts.minute) };
}

/**
 * Converts a wall-clock date and time in `timeZone` to the correct UTC instant.
 *
 * @param {string} dateStr  `YYYY-MM-DD`
 * @param {string} timeStr  `HH:mm` or `HH:mm:ss`
 * @param {string} [timeZone] IANA zone; defaults to the owner's.
 * @returns {Date}
 */
export function ownerWallTimeToUtc(dateStr, timeStr, timeZone = OWNER_TIMEZONE) {
  const [year, month, day] = String(dateStr).split('-').map(Number);
  const [hour = 0, minute = 0, second = 0] = String(timeStr).split(':').map(Number);

  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return new Date(NaN);
  }

  // Treat the wall time as if it were UTC, then subtract the zone's offset.
  const naiveUtc = Date.UTC(year, month - 1, day, hour, minute, second);

  // The offset must be sampled at the *actual* instant, but that instant is
  // what we are solving for. One correction pass is enough for every real zone:
  // re-sampling at the corrected instant catches the case where the naive guess
  // fell on the far side of a DST transition.
  const firstPass = naiveUtc - getZoneOffsetMs(naiveUtc, timeZone);
  const secondPass = naiveUtc - getZoneOffsetMs(firstPass, timeZone);

  return new Date(secondPass);
}
