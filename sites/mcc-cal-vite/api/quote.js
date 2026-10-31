import { Resend } from 'resend';
import { applyRateLimit } from './_lib/rate-limit-redis.js';
import { quoteSchema, safeParseBody } from './_lib/validation.js';
import { getServiceClient, isSupabaseConfigured } from './_lib/supabase-server.js';
import { captureApiException } from './_lib/sentry.js';
import { sendEmailOrThrow } from './_lib/email.js';
import { buildQuoteEmail } from './_lib/enquiry-emails.js';

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
      console.error('Failed to initialize Resend client: - quote.js', err.message);
    }
  }
  return resendClient;
}

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
  const stored = quoteId !== null;

  let emailed = false;
  const resend = getResendClient();
  if (resend) {
    try {
      const mail = buildQuoteEmail({
        name,
        email,
        serviceType: service_type,
        projectDate: project_date,
        budget,
        intendedUse: intended_use,
        duration,
        geographic,
        deliverables: `${deliverables}${body.other_deliverables ? `, ${body.other_deliverables}` : ''}`,
        details: {
          phone: body.phone,
          organization: body.organization,
          location: body.location,
          setting: body.setting,
          attendees: body.attendees,
          times:
            body.start_time || body.end_time
              ? `${body.start_time || '--'} to ${body.end_time || '--'}`
              : undefined,
          timeline: body.timeline,
        },
        notes: body.notes,
        quoteId,
      });
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
      console.error('[quote] Email error:', err);
      await captureApiException(err, { route: 'quote', operation: 'send_quote_email' });
    }
  } else {
    console.warn('[quote] RESEND_API_KEY not set, skipping email');
  }

  // See the note in api/contact.js. This answered 200 "Quote request received"
  // whenever it reached the end, including when nothing was stored and nothing
  // was sent, promising a reply within 24 to 48 hours for a request that
  // reached nobody.
  if (!stored && !emailed) {
    console.error('[quote] Request reached neither the database nor email');
    await captureApiException(new Error('Quote request was neither stored nor emailed'), {
      route: 'quote',
      operation: 'deliver_quote_request',
    });
    res.status(503).json({
      error: `We could not record your request. Please email ${TO_EMAIL} directly.`,
      stored: false,
      emailed: false,
    });
    return;
  }

  res.status(200).json({
    ok: true,
    id: quoteId,
    stored,
    emailed,
    emailError: !emailed || undefined,
    message: 'Quote request received. We will respond within 24-48 hours.',
  });
}
