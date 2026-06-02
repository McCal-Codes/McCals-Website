import { Resend } from 'resend';
import { applyRateLimit } from './_lib/rate-limit-redis.js';
import { contactSchema, safeParseBody } from './_lib/validation.js';
import { getServiceClient, isSupabaseConfigured } from './_lib/supabase-server.js';

const resend = new Resend(process.env.RESEND_API_KEY);

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

  // Timing check (required client timestamp — blocks drive-by scripted posts)
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
      // Continue to try sending email even if DB save fails
    } else {
      submissionId = submission?.id;
    }
  }

  // Send email notification
  if (process.env.RESEND_API_KEY) {
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: TO_EMAIL,
        replyTo: email,
        subject: `[Contact] ${subject} — from ${name}`,
        text: [
          `Name: ${name}`,
          `Email: ${email}`,
          `Subject: ${subject}`,
          ``,
          `Message:`,
          message,
          ``,
          `Consent: ${consent ? 'Yes' : 'No'}`,
          submissionId ? `Submission ID: ${submissionId}` : '',
          `Submitted: ${new Date().toISOString()}`,
        ].join('\n'),
      });
    } catch (err) {
      console.error('[contact] Email error: - contact.js:103', err);
      // Don't fail the request if email fails but DB succeeded
      if (submissionId) {
        res.status(200).json({ ok: true, id: submissionId, emailError: true });
        return;
      }
    }
  } else {
    console.warn('[contact] RESEND_API_KEY not set, skipping email notification - contact.js:111');
  }

  res.status(200).json({ 
    ok: true, 
    id: submissionId,
    message: 'Message received. Thank you for contacting us!'
  });
}
