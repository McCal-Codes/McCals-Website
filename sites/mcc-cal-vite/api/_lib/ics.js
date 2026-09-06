/**
 * Minimal iCalendar (RFC 5545) event builder for booking confirmations.
 *
 * Written by hand rather than pulled from a package: a single VEVENT is a
 * small, stable spec, and this keeps a dependency out of the serverless
 * bundle. The pieces that are easy to get wrong, CRLF line endings, text
 * escaping, and folding long lines, are handled below.
 */

/** RFC 5545 §3.3.11: escape backslash, semicolon, comma and newline in TEXT values. */
function escapeText(value) {
  return String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

/** RFC 5545 §3.1: content lines are folded at 75 octets, continuations start with a space. */
function foldLine(line) {
  if (line.length <= 75) return line;

  const parts = [line.slice(0, 75)];
  let rest = line.slice(75);
  while (rest.length > 74) {
    parts.push(` ${rest.slice(0, 74)}`);
    rest = rest.slice(74);
  }
  if (rest.length) parts.push(` ${rest}`);
  return parts.join('\r\n');
}

/** UTC timestamp in the basic format iCalendar expects: 20260908T130000Z. */
function toIcsUtc(date) {
  return `${date.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`;
}

/**
 * Builds a VCALENDAR containing one VEVENT.
 *
 * METHOD:REQUEST plus an ATTENDEE is what makes mail clients render this as an
 * invitation with Accept/Decline rather than as a file to download.
 *
 * @returns {string} The .ics file contents.
 */
export function buildBookingIcs({
  uid,
  start,
  end,
  summary,
  description,
  location,
  organizerName,
  organizerEmail,
  attendeeName,
  attendeeEmail,
  url,
}) {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//McCal Media//Booking//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${escapeText(uid)}`,
    `DTSTAMP:${toIcsUtc(new Date())}`,
    `DTSTART:${toIcsUtc(new Date(start))}`,
    `DTEND:${toIcsUtc(new Date(end))}`,
    `SUMMARY:${escapeText(summary)}`,
    `DESCRIPTION:${escapeText(description)}`,
    `LOCATION:${escapeText(location)}`,
    `ORGANIZER;CN=${escapeText(organizerName)}:mailto:${organizerEmail}`,
    `ATTENDEE;CN=${escapeText(attendeeName)};ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE:mailto:${attendeeEmail}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'TRANSP:OPAQUE',
  ];

  // A bare '#mock-booking' placeholder is not a URL worth emitting.
  if (url && /^https?:\/\//.test(url)) {
    lines.push(`URL:${escapeText(url)}`);
  }

  lines.push('BEGIN:VALARM', 'TRIGGER:-PT30M', 'ACTION:DISPLAY', 'DESCRIPTION:Reminder', 'END:VALARM');
  lines.push('END:VEVENT', 'END:VCALENDAR');

  return lines.map(foldLine).join('\r\n');
}

/**
 * "Add to Google Calendar" URL, for the confirmation screen where an email
 * attachment isn't available.
 */
export function buildGoogleCalendarUrl({ start, end, summary, description, location }) {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: summary,
    dates: `${toIcsUtc(new Date(start))}/${toIcsUtc(new Date(end))}`,
    details: description,
    location,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
