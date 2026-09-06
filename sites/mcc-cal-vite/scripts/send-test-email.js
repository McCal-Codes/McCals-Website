/**
 * Sends a real booking confirmation through Resend, using the same builder the
 * booking endpoint uses.
 *
 * Exists because the email path is the one part of the booking flow that
 * cannot be verified locally by any other means, it needs a live API key, and
 * its failures are quiet by nature. Rather than booking through the UI and
 * waiting to see whether anything arrives, this reports exactly what Resend
 * said, including the errors that are easy to misread.
 *
 *   node scripts/send-test-email.js
 *
 * Reads RESEND_API_KEY, CONTACT_FROM_EMAIL and CONTACT_TO_EMAIL from .env.
 * Never prints the key.
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import { Resend } from 'resend';
import { buildBookingEmails } from '../api/_lib/booking-emails.js';
import { BOOKING_CONFIGS } from '../api/_lib/booking-config.js';

const here = path.dirname(fileURLToPath(import.meta.url));

/** Minimal .env reader, avoids a dependency for a one-file script. */
function loadEnv() {
  try {
    const raw = readFileSync(path.join(here, '..', '.env'), 'utf8');
    for (const line of raw.split('\n')) {
      const match = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2].trim();
      }
    }
  } catch {
    // Falls through to the missing-variable check below.
  }
}

loadEnv();

const { RESEND_API_KEY, CONTACT_FROM_EMAIL, CONTACT_TO_EMAIL } = process.env;

const missing = Object.entries({ RESEND_API_KEY, CONTACT_FROM_EMAIL, CONTACT_TO_EMAIL })
  .filter(([, value]) => !value)
  .map(([name]) => name);

if (missing.length) {
  console.error(`\nMissing in .env: ${missing.join(', ')}`);
  console.error('Fill them in and run this again.\n');
  process.exit(1);
}

const start = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
start.setUTCHours(13, 0, 0, 0);
const end = new Date(start.getTime() + 60 * 60 * 1000);

const emails = buildBookingEmails({
  booking: {
    id: `test-${Date.now()}`,
    start: { dateTime: start.toISOString() },
    end: { dateTime: end.toISOString() },
    requester: {
      name: 'Test Booking',
      email: CONTACT_TO_EMAIL,
      notes: 'Sent by scripts/send-test-email.js to verify the email pipeline.',
    },
    eventLink: 'https://calendar.google.com/calendar',
  },
  config: BOOKING_CONFIGS['book-podcast'],
  requesterTimezone: 'America/New_York',
  manageUrl: `${process.env.VITE_SITE_URL || 'http://localhost:5173'}/manage-booking?token=TEST`,
  ownerEmail: CONTACT_TO_EMAIL,
});

console.log(`\nFrom: ${CONTACT_FROM_EMAIL}`);
console.log(`To:   ${CONTACT_TO_EMAIL}`);
console.log(`Subject: ${emails.requester.subject}`);
console.log(`Attachment: ${emails.attachments[0].filename} (${emails.attachments[0].content.length} bytes)\n`);

const resend = new Resend(RESEND_API_KEY);

// Resend resolves with { data, error } rather than rejecting, so the error
// branch has to be read explicitly, this is the failure mode that made every
// send look successful before.
const { data, error } = await resend.emails.send({
  from: CONTACT_FROM_EMAIL,
  to: CONTACT_TO_EMAIL,
  subject: emails.requester.subject,
  html: emails.requester.html,
  attachments: emails.attachments,
});

if (error) {
  console.error(`FAILED - ${error.name}: ${error.message}\n`);

  if (error.name === 'validation_error' && /domain is not verified/i.test(error.message || '')) {
    console.error('The DNS records may be live while the domain is still unverified in');
    console.error('Resend. It does not check automatically. Open https://resend.com/domains,');
    console.error('select the domain and press "Verify DNS Records", then run this again.');
    console.error('To test before that, set CONTACT_FROM_EMAIL=onboarding@resend.dev.\n');
  }
  if (/403/.test(String(error.statusCode || '')) || error.name === 'invalid_access') {
    console.error('With onboarding@resend.dev you can only send to the email address on');
    console.error('your Resend account. Check CONTACT_TO_EMAIL matches it.\n');
  }

  process.exit(1);
}

console.log(`Sent. Resend id: ${data?.id}`);
console.log('Check the inbox. The message should carry a booking.ics attachment');
console.log('that your calendar offers to add.\n');
