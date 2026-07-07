import { Resend } from 'resend';
import { applyRateLimit } from './_lib/rate-limit-redis.js';
import { quoteSchema, safeParseBody } from './_lib/validation.js';
import { getServiceClient, isSupabaseConfigured } from './_lib/supabase-server.js';
import { captureApiException } from './_lib/sentry.js';

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

  const rateLimit = await applyRateLimit(req, res, QUOTE_RATE_LIMIT);
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

  const deliverables = Array.isArray(body.deliverable)
    ? body.deliverable.join(', ')
    : body.deliverable || 'N/A';

  // Save to Supabase
  let quoteId = null;
  if (isSupabaseConfigured()) {
    const supabase = getServiceClient();
    const { data: quote, error: dbError } = await supabase
      .from('quote_requests')
      .insert({
        name,
        email,
        phone: body.phone || null,
        event_type: service_type,
        event_date: project_date || null,
        location: body.location || null,
        budget_range: budget,
        details: [
          `=== PROJECT ===`,
          `Service: ${service_type}`,
          `Date: ${project_date || 'Not specified'}`,
          `Time: ${body.start_time || '--'} to ${body.end_time || '--'}`,
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
        ].join('\n'),
        status: 'pending',
      })
      .select('id')
      .single();

    if (dbError) {
      console.error('[quote] Database error:', dbError);
      await captureApiException(dbError, { route: 'quote', operation: 'insert_quote_request' });
    } else {
      quoteId = quote?.id;
    }
  }

  // Send email notification
  if (process.env.RESEND_API_KEY) {
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: TO_EMAIL,
        replyTo: email,
        subject: `[Quote Request] ${service_type} — from ${name}`,
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
          `Time: ${body.start_time || '--'} to ${body.end_time || '--'}`,
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
          quoteId ? `Quote ID: ${quoteId}` : '',
          ``,
          `Submitted: ${new Date().toISOString()}`,
        ].join('\n'),
      });
    } catch (err) {
      console.error('[quote] Email error:', err);
      await captureApiException(err, { route: 'quote', operation: 'send_quote_email' });
      if (quoteId) {
        res.status(200).json({ ok: true, id: quoteId, emailError: true });
        return;
      }
    }
  } else {
    console.warn('[quote] RESEND_API_KEY not set, skipping email');
  }

  res.status(200).json({ 
    ok: true, 
    id: quoteId,
    message: 'Quote request received. We will respond within 24-48 hours.'
  });
}
