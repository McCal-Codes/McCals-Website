/**
 * Builds the two booking confirmation messages and the calendar invite.
 *
 * Pure and separate from sending, so the content can be asserted and previewed
 * without a Resend key, a verified domain, or a real inbox, none of which are
 * available in tests or local development.
 *
 * Both messages carry an HTML part and a plain-text alternative. Sending
 * HTML-only scores worse with spam filters and leaves nothing for clients that
 * refuse to render it.
 */

import { buildBookingIcs, buildGoogleCalendarUrl } from './ics.js';
import { OWNER_TIMEZONE } from './timezone.js';
import { button, detailPanel, detailRow, linkRow, noteBlock, renderEmail } from './email-template.js';

/**
 * Renders a date and time in an explicit zone.
 *
 * Without `timeZone` these fall back to the runtime's zone, which is UTC on
 * Vercel, so someone who booked 9:00 AM Eastern in the UI was emailed
 * "1:00 PM UTC" and the message contradicted the page they had just used.
 */
function inZone(startDate, zone) {
  return {
    date: startDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: zone,
    }),
    time: startDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZoneName: 'short',
      timeZone: zone,
    }),
    short: startDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      timeZone: zone,
    }),
  };
}

/**
 * @param {{
 *   booking: {
 *     id: string,
 *     start: { dateTime: string },
 *     end: { dateTime: string },
 *     requester: { name: string, email: string, notes?: string | null },
 *     eventLink?: string | null,
 *   },
 *   config: {
 *     name: string,
 *     location: string,
 *     durationMinutes: number,
 *     confirmationTitle: string,
 *     confirmationMessage: string,
 *   },
 *   requesterTimezone?: string,
 *   manageUrl?: string | null,
 *   ownerEmail: string,
 *   ownerName?: string,
 * }} input
 * @returns {{
 *   requester: { subject: string, html: string, text: string },
 *   owner: { subject: string, html: string, text: string, replyTo: string },
 *   invite: string,
 *   attachments: Array<{ filename: string, content: Buffer }>,
 * }}
 */
export function buildBookingEmails({
  booking,
  config,
  requesterTimezone = OWNER_TIMEZONE,
  manageUrl = null,
  ownerEmail,
  ownerName = 'Caleb McCartney',
  location = null,
}) {
  // Falls back to the type's default so callers that predate in-person
  // bookings keep working.
  const place = location ?? { label: config.location, isInPerson: false };
  const whereLabel = place.isInPerson ? 'Address' : 'Where';
  const startDate = new Date(booking.start.dateTime);
  const forRequester = inZone(startDate, requesterTimezone);
  const forOwner = inZone(startDate, OWNER_TIMEZONE);
  const notes = booking.requester.notes;

  const sameZone = forRequester.time === forOwner.time;

  const invite = buildBookingIcs({
    uid: `${booking.id}@mcc-cal.com`,
    start: booking.start.dateTime,
    end: booking.end.dateTime,
    summary: `${config.name}: ${booking.requester.name}`,
    description: [
      config.name,
      notes ? `Notes: ${notes}` : '',
      `Booked by ${booking.requester.name} (${booking.requester.email})`,
    ]
      .filter(Boolean)
      .join('\n'),
    location: place.label,
    organizerName: ownerName,
    organizerEmail: ownerEmail,
    attendeeName: booking.requester.name,
    attendeeEmail: booking.requester.email,
    url: booking.eventLink,
  });

  // The same invite goes to both parties so the event lands in each calendar.
  const attachments = [{ filename: 'booking.ics', content: Buffer.from(invite, 'utf-8') }];

  // Apple Mail and Outlook add the event straight from the .ics attachment;
  // Gmail does not, so Google users get an explicit link instead.
  const googleCalendarUrl = buildGoogleCalendarUrl({
    start: booking.start.dateTime,
    end: booking.end.dateTime,
    summary: `${config.name} with ${ownerName}`,
    description: config.emailMessage || config.confirmationMessage,
    location: place.label,
  });

  // ---- To the person who booked -------------------------------------------

  const requesterHtml = renderEmail({
    preheader: `${forRequester.short} at ${forRequester.time} · ${place.label}`,
    eyebrow: 'Confirmed',
    heading: config.confirmationTitle,
    // Not "your book a podcast recording is booked". The configured names are
    // noun phrases that read badly inside a sentence, so the type goes in the
    // panel where it belongs rather than being forced into the greeting.
    intro: `Hi ${booking.requester.name}, you're confirmed. Here are the details.`,
    body: [
      detailPanel(
        [
          detailRow('Type', config.name),
          detailRow('When', `${forRequester.date}`),
          detailRow('Time', forRequester.time),
          detailRow('Duration', `${config.durationMinutes} minutes`),
          detailRow(whereLabel, place.label),
          place.isInPerson ? detailRow('Format', 'In person') : '',
        ].join(''),
      ),
      noteBlock('Your notes', notes),
      `<tr><td style="padding:0 0 22px;color:#1a1a1a;font-size:15px;line-height:1.55;">${config.emailMessage || config.confirmationMessage}</td></tr>`,
      button(manageUrl, 'Reschedule or cancel'),
      linkRow(googleCalendarUrl, 'Add to Google Calendar', '(or use the attached invite)'),
    ].join(''),
    footnote: manageUrl
      ? `A calendar invitation is attached. That reschedule link is personal to this booking &mdash; please don't forward it. Questions? Just reply to this email.`
      : `A calendar invitation is attached. Questions? Just reply to this email.`,
  });

  const requesterText = [
    config.confirmationTitle,
    '',
    `Hi ${booking.requester.name}, you're confirmed. Here are the details.`,
    '',
    `Type:     ${config.name}`,
    `When:     ${forRequester.date}`,
    `Time:     ${forRequester.time}`,
    `Duration: ${config.durationMinutes} minutes`,
    `${place.isInPerson ? 'Address:  ' : 'Where:    '}${place.label}`,
    notes ? `\nYour notes: ${notes}` : '',
    '',
    config.emailMessage || config.confirmationMessage,
    manageUrl ? `\nReschedule or cancel: ${manageUrl}\n(personal to this booking, please don't forward it)` : '',
    '',
    `Add to Google Calendar: ${googleCalendarUrl}`,
    'A calendar invitation is also attached. Questions? Just reply to this email.',
  ]
    .filter((line) => line !== '')
    .join('\n');

  // ---- To Caleb -----------------------------------------------------------
  //
  // Written to be read on a phone in a few seconds: who, when, and how to
  // reply. The subject carries the date so the inbox list alone is useful.

  const ownerHtml = renderEmail({
    preheader: `${booking.requester.name}, ${forOwner.short}, ${forOwner.time}`,
    eyebrow: 'New booking',
    heading: `${booking.requester.name} booked a session`,
    intro: `${forOwner.date} at ${forOwner.time}.`,
    body: [
      detailPanel(
        [
          detailRow('Type', config.name),
          detailRow('When', `${forOwner.date}, ${forOwner.time}`),
          detailRow('Duration', `${config.durationMinutes} minutes`),
          detailRow(whereLabel, place.label),
          place.isInPerson ? detailRow('Format', 'In person, travel required') : '',
          detailRow('Name', booking.requester.name),
          detailRow('Email', booking.requester.email),
          // Only worth the line when the two actually differ.
          sameZone ? '' : detailRow('Their time', `${forRequester.time} (${requesterTimezone})`),
        ].join(''),
      ),
      noteBlock('What they said', notes),
      button(`mailto:${booking.requester.email}`, `Email ${booking.requester.name.split(' ')[0]}`),
      linkRow(googleCalendarUrl, 'Add to Google Calendar', '(or use the attached invite)'),
    ].join(''),
    footnote: `The calendar invitation is attached. Booked ${new Date().toLocaleString('en-US', { timeZone: OWNER_TIMEZONE })}.`,
  });

  const ownerText = [
    `${booking.requester.name} booked: ${config.name}`,
    '',
    `When:     ${forOwner.date}, ${forOwner.time}`,
    `Duration: ${config.durationMinutes} minutes`,
    `${place.isInPerson ? 'Address:  ' : 'Where:    '}${place.label}`,
    place.isInPerson ? 'Format:   In person, travel required' : '',
    '',
    `Name:  ${booking.requester.name}`,
    `Email: ${booking.requester.email}`,
    sameZone ? '' : `Their local time: ${forRequester.time} (${requesterTimezone})`,
    notes ? `\nWhat they said:\n${notes}` : '\nNo notes provided.',
    '',
    booking.eventLink ? `Calendar event: ${booking.eventLink}` : '',
  ]
    .filter((line) => line !== '')
    .join('\n');

  return {
    requester: {
      subject: config.confirmationTitle,
      html: requesterHtml,
      text: requesterText,
    },
    owner: {
      // Date in the subject so the inbox list is scannable without opening.
      subject: `${config.name}: ${booking.requester.name}, ${forOwner.short} ${forOwner.time}`,
      html: ownerHtml,
      text: ownerText,
      // Replying goes straight to the person who booked.
      replyTo: booking.requester.email,
    },
    invite,
    attachments,
  };
}
