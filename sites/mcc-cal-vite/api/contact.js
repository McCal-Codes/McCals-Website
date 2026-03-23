import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const TO_EMAIL = process.env.CONTACT_TO_EMAIL || 'contact@mcc-cal.com';
const FROM_EMAIL = process.env.CONTACT_FROM_EMAIL || 'noreply@mcc-cal.com';
const MIN_SUBMIT_DELAY_MS = 2500;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { name, email, subject, message, consent, contact_loaded_at, cf_website_url } = req.body || {};

  // Honeypot check
  if (cf_website_url) {
    res.status(200).json({ ok: true }); // silently discard
    return;
  }

  // Timing check
  const loadedAt = Number(contact_loaded_at);
  if (loadedAt && Date.now() - loadedAt < MIN_SUBMIT_DELAY_MS) {
    res.status(429).json({ error: 'Please wait a moment before submitting.' });
    return;
  }

  // Validation
  if (!name || !email || !subject || !message || !consent) {
    res.status(400).json({ error: 'All required fields must be filled in.' });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ error: 'Invalid email address.' });
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
        `Submitted: ${new Date().toISOString()}`,
      ].join('\n'),
    });

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[contact] Resend error:', err);
    res.status(500).json({ error: 'Failed to send message. Please try again.' });
  }
}
