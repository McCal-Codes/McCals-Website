/**
 * Builds the two booking confirmation messages and the calendar invite.
 *
 * Pure and separate from sending, so the content can be asserted and previewed
 * without a Resend key, a verified domain, or a real inbox — none of which are
 * available in tests or local development.
 */

import { buildBookingIcs } from './ics.js';
import { OWNER_TIMEZONE } from './timezone.js';

/** Minimal HTML escaping for values that originate with the requester. */
function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Renders a date and time in an explicit zone.
 *
 * Without `timeZone` these fall back to the runtime's zone, which is UTC on
 * Vercel — so someone who booked 9:00 AM Eastern in the UI was emailed
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
 *   requester: { subject: string, html: string },
 *   owner: { subject: string, text: string },
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
}) {
  const startDate = new Date(booking.start.dateTime);
  const forRequester = inZone(startDate, requesterTimezone);
  const forOwner = inZone(startDate, OWNER_TIMEZONE);

  const notes = booking.requester.notes;

  const invite = buildBookingIcs({
    uid: `${booking.id}@mcc-cal.com`,
    start: booking.start.dateTime,
    end: booking.end.dateTime,
    summary: `${config.name} — ${booking.requester.name}`,
    description: [
      config.name,
      notes ? `Notes: ${notes}` : '',
      `Booked by ${booking.requester.name} (${booking.requester.email})`,
    ]
      .filter(Boolean)
      .join('\n'),
    location: config.location,
    organizerName: ownerName,
    organizerEmail: ownerEmail,
    attendeeName: booking.requester.name,
    attendeeEmail: booking.requester.email,
    url: booking.eventLink,
  });

  // The same invite goes to both parties so the event lands in each calendar.
  const attachments = [{ filename: 'booking.ics', content: Buffer.from(invite, 'utf-8') }];

  const html = `
        <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1a1a1a;">${escapeHtml(config.confirmationTitle)}</h1>
          <p>Hi ${escapeHtml(booking.requester.name)},</p>
          <p>Your ${escapeHtml(config.name.toLowerCase())} is confirmed for:</p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Type:</strong> ${escapeHtml(config.name)}</p>
            <p style="margin: 8px 0 0;"><strong>Date:</strong> ${escapeHtml(forRequester.date)}</p>
            <p style="margin: 8px 0 0;"><strong>Time:</strong> ${escapeHtml(forRequester.time)}</p>
            <p style="margin: 8px 0 0;"><strong>Duration:</strong> ${config.durationMinutes} minutes</p>
            <p style="margin: 8px 0 0;"><strong>Location:</strong> ${escapeHtml(config.location)}</p>
            ${notes ? `<p style="margin: 8px 0 0;"><strong>Your notes:</strong> ${escapeHtml(notes)}</p>` : ''}
          </div>
          <p>${escapeHtml(config.confirmationMessage)}</p>
          <p style="color: #666; font-size: 14px;">
            A calendar invitation is attached to this email.
          </p>
          ${
            manageUrl
              ? `<p style="margin-top: 30px;">
            <a href="${escapeHtml(manageUrl)}" style="display: inline-block; padding: 10px 18px; border-radius: 6px; background: #1a1a1a; color: #fff; text-decoration: none;">
              Reschedule or cancel
            </a>
          </p>
          <p style="color: #666; font-size: 13px;">
            That link is personal to this booking — please don't forward it.
          </p>`
              : ''
          }
          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            Questions? Reply to this email or contact me at ${escapeHtml(ownerEmail)}
          </p>
        </div>
      `;

  const text = [
    `New booking received!`,
    ``,
    `=== BOOKING DETAILS ===`,
    `Type: ${config.name}`,
    `Date: ${forOwner.date}`,
    `Time: ${forOwner.time}`,
    `Duration: ${config.durationMinutes} minutes`,
    `Location: ${config.location}`,
    ``,
    `=== CONTACT ===`,
    `Name: ${booking.requester.name}`,
    `Email: ${booking.requester.email}`,
    `Their timezone: ${requesterTimezone}`,
    `Their local time: ${forRequester.date} at ${forRequester.time}`,
    ``,
    `=== NOTES ===`,
    notes || 'No notes provided',
    ``,
    `Google Calendar Event: ${booking.eventLink || 'Created'}`,
    `Submitted: ${new Date().toISOString()}`,
  ].join('\n');

  return {
    requester: { subject: config.confirmationTitle, html },
    owner: { subject: `[Booking] ${config.name} - ${booking.requester.name}`, text },
    invite,
    attachments,
  };
}
