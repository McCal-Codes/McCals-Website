import { Resend } from 'resend';
import { applyRateLimit } from './_lib/rate-limit-redis.js';
import { contactSchema, safeParseBody } from './_lib/validation.js';
import { getServiceClient, isSupabaseConfigured } from './_lib/supabase-server.js';
import { captureApiException } from './_lib/sentry.js';
import { sendEmailOrThrow } from './_lib/email.js';
import { buildContactEmail } from './_lib/enquiry-emails.js';

// Lazy-initialize Resend, matching schedule/book.js. Constructing it at module
// scope throws when RESEND_API_KEY is absent, which takes down the whole
// module: the endpoint stops responding rather than degrading to "stored, not
// emailed", and the local API server cannot boot at all without secrets.
let resendClient = null;
function getResendClient() {
  if (!resendClient && process.env.RESEND_API_KEY) {
    try {
      resendClient = new Resend(process.env.RESEND_API_KEY);
    } catch (err) {
      console.error('Failed to initialize Resend client: - contact.js', err.message);
    }
  }
  return resendClient;
}

const TO_EMAIL = process.env.CONTACT_TO_EMAIL || 'contact@mcc-cal.com';
const FROM_EMAIL = process.env.CONTACT_FROM_EMAIL || 'noreply@mcc-cal.com';
const MIN_SUBMIT_DELAY_MS = 2500;
const CONTACT_RATE_LIMIT = {
  route: 'contact',
  limit: 5,
  windowMs: 15 * 60 * 1000,
};

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const rateLimit = await applyRateLimit(req, res, CONTACT_RATE_LIMIT);
  if (!rateLimit.allowed) {
    res.status(429).json({ error: 'Too many contact requests. Please try again later.' });
    return;
  }

  // Honeypot check - must run before validation to silently discard spam bots
  const rawBody = req.body || {};
  if (rawBody.cf_website_url) {
    res.status(200).json({ ok: true }); // silently discard
    return;
  }

  const parsed = safeParseBody(contactSchema, req.body);
  if (!parsed.ok) {
    res.status(400).json({ error: parsed.error.message, issues: parsed.error.issues });
    return;
  }

  const { name, email, subject, message, consent, contact_loaded_at } = parsed.data;

  // Timing check (required client timestamp, blocks drive-by scripted posts)
  const loadedAt = Number(contact_loaded_at);
  if (!Number.isFinite(loadedAt)) {
    res.status(400).json({ error: 'Invalid request.' });
    return;
  }
  if (Date.now() - loadedAt < MIN_SUBMIT_DELAY_MS) {
    res.status(429).json({ error: 'Please wait a moment before submitting.' });
    return;
  }

  // Save to Supabase (even if email fails, we have the record)
  let submissionId = null;
  if (isSupabaseConfigured()) {
    const supabase = getServiceClient();
    const { data: submission, error: dbError } = await supabase
      .from('contact_submissions')
      .insert({
        name,
        email,
        subject,
        message,
        status: 'new',
      })
      .select('id')
      .single();

    if (dbError) {
      console.error('[contact] Database error: - contact.js:74', dbError);
      await captureApiException(dbError, { route: 'contact', operation: 'insert_contact_submission' });
      // Continue to try sending email even if DB save fails
    } else {
      submissionId = submission?.id;
    }
  }

  const stored = submissionId !== null;

  // Send email notification
  let emailed = false;
  const resend = getResendClient();
  if (resend) {
    try {
      const mail = buildContactEmail({ name, email, subject, message, consent, submissionId });
      await sendEmailOrThrow(resend, {
        from: FROM_EMAIL,
        to: TO_EMAIL,
        replyTo: mail.replyTo,
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
      });
      emailed = true;
    } catch (err) {
      console.error('[contact] Email error: - contact.js:103', err);
      await captureApiException(err, { route: 'contact', operation: 'send_contact_email' });
    }
  } else {
    console.warn('[contact] RESEND_API_KEY not set, skipping email notification - contact.js:111');
  }

  // The response has to say what actually happened. This used to answer 200
  // "Message received. Thank you for contacting us!" whenever it reached the
  // end, including when the row was never written and the mail never sent, so a
  // visitor was thanked for a message that reached nobody and the form then
  // cleared their text. scripts/smoke-forms.js exists because that exact shape
  // ran for months undetected.
  if (!stored && !emailed) {
    console.error('[contact] Submission reached neither the database nor email');
    await captureApiException(new Error('Contact submission was neither stored nor emailed'), {
      route: 'contact',
      operation: 'deliver_contact_submission',
    });
    res.status(503).json({
      error: `We could not record your message. Please email ${TO_EMAIL} directly.`,
      stored: false,
      emailed: false,
    });
    return;
  }

  res.status(200).json({
    ok: true,
    id: submissionId,
    stored,
    emailed,
    // Stored but not sent is still a real receipt: the enquiry is on record and
    // will be seen. Saying so is honest without alarming the visitor.
    emailError: !emailed || undefined,
    message: 'Message received. Thank you for contacting us!',
  });
}
