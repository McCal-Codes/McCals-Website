import { Resend } from 'resend';
import { applyRateLimit } from './_lib/rate-limit.js';
import { quoteSchema, safeParseBody } from './_lib/validation.js';

const resend = new Resend(process.env.RESEND_API_KEY);

const TO_EMAIL = process.env.CONTACT_TO_EMAIL || 'contact@mcc-cal.com';
const FROM_EMAIL = process.env.CONTACT_FROM_EMAIL || 'noreply@mcc-cal.com';
const QUOTE_RATE_LIMIT = {
  route: 'quote',
  limit: 3,
  windowMs: 30 * 60 * 1000,
};

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const rateLimit = applyRateLimit(req, res, QUOTE_RATE_LIMIT);
  if (!rateLimit.allowed) {
    res.status(429).json({ error: 'Too many quote requests. Please try again later.' });
    return;
  }

  // Honeypot check - must run before validation to silently discard spam bots
  const rawBody = req.body || {};
  if (rawBody.mcc_valid_field) {
    res.status(200).json({ ok: true }); // silently discard
    return;
  }

  const parsed = safeParseBody(quoteSchema, req.body);
  if (!parsed.ok) {
    res.status(400).json({ error: parsed.error.message, issues: parsed.error.issues });
    return;
  }

  const body = parsed.data;

  const { name, email, service_type, project_date, intended_use, duration, geographic, budget } =
    body;

  if (!process.env.RESEND_API_KEY) {
    console.error('[quote] RESEND_API_KEY not set');
    res.status(503).json({ error: 'Email service not configured.' });
    return;
  }

  const deliverables = Array.isArray(body.deliverable)
    ? body.deliverable.join(', ')
    : body.deliverable || 'N/A';

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      replyTo: email,
      subject: `[Quote Request] ${service_type}  from ${name}`,
      text: [
        `=== CONTACT ===`,
        `Name: ${name}`,
        `Email: ${email}`,
        `Phone: ${body.phone || 'N/A'}`,
        `Organization: ${body.organization || 'N/A'}`,
        ``,
        `=== PROJECT ===`,
        `Service: ${service_type}`,
        `Date: ${project_date}`,
        `Time: ${body.start_time || '--'}  ${body.end_time || '--'}`,
        `Location: ${body.location || 'N/A'}`,
        `Setting: ${body.setting || 'N/A'}`,
        `Attendees: ${body.attendees || 'N/A'}`,
        ``,
        `=== DELIVERABLES ===`,
        `${deliverables}${body.other_deliverables ? `, ${body.other_deliverables}` : ''}`,
        ``,
        `=== LICENSING ===`,
        `Intended Use: ${intended_use}`,
        `Duration: ${duration}`,
        `Geographic Scope: ${geographic}`,
        ``,
        `=== BUDGET ===`,
        `Budget: ${budget}`,
        `Timeline: ${body.timeline || 'N/A'}`,
        ``,
        `=== NOTES ===`,
        body.notes || 'No additional notes',
        ``,
        `Submitted: ${new Date().toISOString()}`,
      ].join('\n'),
    });

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[quote] Resend error:', err);
    res.status(500).json({ error: 'Failed to send quote request. Please try again.' });
  }
}