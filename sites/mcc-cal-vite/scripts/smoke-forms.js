/**
 * Exercises the three form endpoints against a running site and cleans up after
 * itself.
 *
 *   node scripts/smoke-forms.js                     # against production
 *   node scripts/smoke-forms.js --url http://localhost:5173
 *   node scripts/smoke-forms.js --keep              # leave the rows in place
 *   node scripts/smoke-forms.js --cleanup-only      # just remove old test rows
 *
 * Why this exists: contact and quote submissions returned 200 with "Message
 * received" for months while the function was crashing on load, and later while
 * neither Supabase nor Resend was configured. A 200 from these endpoints proves
 * nothing on its own, so this checks the observable end state instead: an id
 * comes back, which only happens when the row was actually written.
 *
 * Everything it creates is tagged with SMOKE_MARKER in the name and sent from
 * SMOKE_EMAIL, so cleanup can delete precisely what it made and nothing a real
 * visitor submitted.
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const here = path.dirname(fileURLToPath(import.meta.url));

/** Recognisable, and unlikely to collide with a real enquiry. */
const SMOKE_MARKER = '[smoke]';
const SMOKE_EMAIL = 'smoke-test@mcc-cal.com';

/**
 * `vercel env pull` writes values wrapped in double quotes, and writes the
 * literal string `[SENSITIVE]` for any variable marked sensitive rather than
 * its value. Both have to be handled or the placeholder is mistaken for a real
 * secret and fails later as a confusing "Invalid URL".
 */
function loadEnv() {
  for (const file of ['.env.local', '.env']) {
    try {
      const raw = readFileSync(path.join(here, '..', file), 'utf8');
      for (const line of raw.split('\n')) {
        const match = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
        if (!match) continue;

        const value = match[2].trim().replace(/^["'](.*)["']$/, '$1');
        if (!value || value === '[SENSITIVE]') continue;
        if (!process.env[match[1]]) process.env[match[1]] = value;
      }
    } catch {
      // Absent file is fine; cleanup simply reports that it cannot run.
    }
  }
}

loadEnv();

const args = process.argv.slice(2);
const urlFlag = args.indexOf('--url');
const BASE = (urlFlag >= 0 ? args[urlFlag + 1] : 'https://mcc-cal.com').replace(/\/$/, '');
const KEEP = args.includes('--keep');
const CLEANUP_ONLY = args.includes('--cleanup-only');

let passed = 0;
let skipped = 0;

const pass = (m) => { passed++; console.log(`  PASS  ${m}`); };
const fail = (m) => console.log(`  FAIL  ${m}`);
const skip = (m) => { skipped++; console.log(`  SKIP  ${m}`); };

/**
 * A 429 means the endpoint's rate limiter is working, not that the endpoint is
 * broken. Quote allows 3 per 30 minutes, contact 5 per 15, booking 5 per hour,
 * so running this a few times in a row will legitimately hit them. Counting
 * that as a failure would train the reader to ignore a red result.
 */
function rateLimited(result) {
  return result.status === 429;
}

async function post(pathname, body) {
  const response = await fetch(`${BASE}${pathname}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  return { status: response.status, data };
}

/** A future weekday, so the booking is not rejected for being in the past. */
function futureDate(offsetDays = 21) {
  const d = new Date(Date.now() + offsetDays * 86400000);
  while (d.getUTCDay() === 0) d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().split('T')[0];
}

/**
 * A different slot each run. book.js keeps booked slots in a module-level Set
 * when Google credentials are absent, and that Set outlives the database row on
 * a warm instance, so a fixed slot starts answering 409 forever.
 */
const bookingDate = futureDate(21 + Math.floor(Math.random() * 20));

async function runSmoke() {
  let failures = 0;
  console.log(`\nSmoke testing ${BASE}\n`);

  const contact = await post('/api/contact', {
    name: `${SMOKE_MARKER} contact`,
    email: SMOKE_EMAIL,
    subject: 'General inquiry',
    message: 'Automated smoke test. Safe to ignore or delete.',
    consent: true,
    contact_loaded_at: Date.now() - 5000,
  });
  // The id is the point: a 200 without one means the submission was discarded.
  if (contact.status === 200 && contact.data.id) pass(`contact stored, id ${contact.data.id}`);
  else if (rateLimited(contact)) skip('contact rate limited, 5 per 15 minutes');
  else { fail(`contact returned ${contact.status}, id ${contact.data.id ?? 'null'}`); failures++; }

  const quote = await post('/api/quote', {
    name: `${SMOKE_MARKER} quote`,
    email: SMOKE_EMAIL,
    service_type: 'Editorial',
    project_date: futureDate(),
    intended_use: 'Editorial',
    duration: '1 year',
    geographic: 'Local',
    budget: '$300-600',
    notes: 'Automated smoke test. Safe to ignore or delete.',
  });
  if (quote.status === 200 && quote.data.id) pass(`quote stored, id ${quote.data.id}`);
  else if (rateLimited(quote)) skip('quote rate limited, 3 per 30 minutes');
  else { fail(`quote returned ${quote.status}, id ${quote.data.id ?? 'null'}`); failures++; }

  const booking = await post('/api/schedule/book', {
    eventTypeId: 'grab-coffee',
    date: bookingDate,
    time: '09:00',
    durationMinutes: 30,
    requester: { name: `${SMOKE_MARKER} booking`, email: SMOKE_EMAIL, notes: 'Automated smoke test.' },
    requesterTimezone: 'America/New_York',
    hp_field: '',
  });
  if (booking.status === 200 && booking.data.booking?.id) {
    pass(`booking created, id ${booking.data.booking.id}`);
    // "mock" means Google Calendar credentials are absent, so nothing reached a
    // real calendar. Worth surfacing: the booking still succeeds either way.
    if (booking.data.mock) console.log('        note: mock booking, Google Calendar credentials not set');
  } else if (rateLimited(booking)) {
    skip('booking rate limited, 5 per hour');
  } else if (booking.status === 409) {
    // Without Google credentials book.js holds booked slots in a module-level
    // Set, which survives on a warm serverless instance and is never cleared,
    // so a slot stays taken even after its database row is deleted. The random
    // slot above avoids it in practice; this branch explains it if it recurs.
    skip('booking slot already taken, pick another or wait for the instance to recycle');
  } else { fail(`booking returned ${booking.status}`); failures++; }

  // The honeypot must swallow a filled submission without creating anything.
  const bot = await post('/api/schedule/book', {
    eventTypeId: 'grab-coffee',
    date: bookingDate,
    time: '10:00',
    durationMinutes: 30,
    requester: { name: `${SMOKE_MARKER} bot`, email: SMOKE_EMAIL },
    requesterTimezone: 'America/New_York',
    hp_field: 'i am a bot',
  });
  if (bot.status === 200 && !bot.data.booking) pass('honeypot discarded a filled submission');
  else { fail('honeypot did not discard a filled submission'); failures++; }

  // Never claim more than was actually exercised. A run where everything was
  // rate limited has verified nothing, and saying "all paths working" there is
  // the same false reassurance these endpoints used to give.
  if (failures > 0) {
    console.log(`\n${failures} failed, ${passed} passed, ${skipped} skipped.\n`);
  } else if (passed === 0) {
    console.log('\nNothing was verified: every check was skipped, almost certainly');
    console.log('rate limiting from a recent run. Wait a few minutes and try again.\n');
  } else if (skipped > 0) {
    console.log(`\n${passed} passed, ${skipped} skipped. The skipped paths were not checked.\n`);
  } else {
    console.log('\nAll paths working. Check the inbox to confirm the emails arrived.\n');
  }

  return failures;
}

/** Deletes only rows this script created, matched on the marker email. */
async function cleanup({ quiet = false } = {}) {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    if (quiet) return;
    console.log('Cleanup skipped: VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not usable locally.');
    console.log('Note that `vercel env pull` cannot recover a variable marked Sensitive; it writes');
    console.log('[SENSITIVE] in place of the value, so these have to be pasted into .env by hand.');
    console.log(`Otherwise, delete rows where the email is ${SMOKE_EMAIL} in the Supabase dashboard.\n`);
    return;
  }

  const headers = { apikey: key, Authorization: `Bearer ${key}`, Prefer: 'return=representation' };
  const tables = [
    ['contact_submissions', 'email'],
    ['quote_requests', 'email'],
    ['bookings', 'client_email'],
  ];

  if (!quiet) console.log('Cleaning up:');
  for (const [table, column] of tables) {
    const response = await fetch(
      `${url.replace(/\/$/, '')}/rest/v1/${table}?${column}=eq.${encodeURIComponent(SMOKE_EMAIL)}`,
      { method: 'DELETE', headers }
    );
    if (!response.ok) {
      if (!quiet) console.log(`  ${table}: failed (${response.status})`);
      continue;
    }
    const rows = await response.json().catch(() => []);
    if (!quiet) console.log(`  ${table}: removed ${rows.length}`);
  }
  if (!quiet) console.log('');
}

let exitCode = 0;

if (!CLEANUP_ONLY) {
  // Clear leftovers first. The booking uses a fixed slot, so a row surviving an
  // earlier run holds that time and the conflict check correctly answers 409,
  // which would read as a failure of the site rather than of the test. Running
  // twice in a row has to pass.
  await cleanup({ quiet: true });
  exitCode = (await runSmoke()) > 0 ? 1 : 0;
}

if (!KEEP) await cleanup();
process.exit(exitCode);
