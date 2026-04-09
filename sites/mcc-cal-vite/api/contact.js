import { Resend } from 'resend';
import { applyRateLimit } from './_lib/rate-limit.js';
import { contactSchema, safeParseBody } from './_lib/validation.js';

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

  const rateLimit = applyRateLimit(req, res, CONTACT_RATE_LIMIT);
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

  // Timing check
  const loadedAt = contact_loaded_at ? Number(contact_loaded_at) : undefined;
  if (loadedAt && Number.isFinite(loadedAt) && Date.now() - loadedAt < MIN_SUBMIT_DELAY_MS) {
    res.status(429).json({ error: 'Please wait a moment before submitting.' });
    return;
  }

  if (!process.env.RESEND_API_KEY) {
    console.error('[contact] RESEND_API_KEY not set');
    res.status(503).json({ error: 'Email service not configured.' });
    return;
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      replyTo: email,
      subject: `[Contact] ${subject}  from ${name}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        `Subject: ${subject}`,
        ``,
        `Message:`,
        message,
        ``,
        `Consent: ${consent ? 'Yes' : 'No'}`,
        `Submitted: ${new Date().toISOString()}`,
      ].join('\n'),
    });

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[contact] Resend error:', err);
    res.status(500).json({ error: 'Failed to send message. Please try again.' });
  }
}