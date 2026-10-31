/**
 * Notification emails for contact and quote submissions.
 *
 * These were plain-text dumps of `=== SECTION ===` headers. They arrive on a
 * phone, usually while Caleb is doing something else, and the questions that
 * matter are: who is this, what do they want, and can I reply now. The layout
 * answers those in that order and puts a reply button at the end.
 *
 * `replyTo` is the enquirer in both cases, so replying from the notification
 * reaches the person rather than the no-reply sender.
 */

import { button, detailPanel, detailRow, noteBlock, renderEmail } from './email-template.js';

function submittedAt() {
  return new Date().toLocaleString('en-US', {
    timeZone: 'America/New_York',
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

/**
 * @param {{ name: string, email: string, subject: string, message: string,
 *           consent: boolean, submissionId?: string | null }} input
 */
export function buildContactEmail({ name, email, subject, message, consent, submissionId }) {
  const html = renderEmail({
    preheader: `${subject} - ${message.slice(0, 90)}`,
    eyebrow: 'Contact form',
    heading: `${name} got in touch`,
    intro: subject,
    body: [
      detailPanel(
        [
          detailRow('Name', name),
          detailRow('Email', email),
          detailRow('Topic', subject),
          detailRow('Consent', consent ? 'Given' : 'Not given'),
        ].join(''),
      ),
      noteBlock('Message', message),
      button(`mailto:${email}?subject=${encodeURIComponent(`Re: ${subject}`)}`, `Reply to ${name.split(' ')[0]}`),
    ].join(''),
    footnote: [
      `Submitted ${submittedAt()}.`,
      submissionId ? ` Reference <code>${submissionId}</code>.` : ' Not stored, Supabase is not configured.',
    ].join(''),
  });

  const text = [
    `${name} got in touch`,
    '',
    `Topic: ${subject}`,
    `Name:  ${name}`,
    `Email: ${email}`,
    '',
    'Message:',
    message,
    '',
    `Consent: ${consent ? 'Given' : 'Not given'}`,
    submissionId ? `Reference: ${submissionId}` : 'Not stored, Supabase is not configured.',
    `Submitted ${submittedAt()}.`,
  ].join('\n');

  return {
    subject: `${subject} - ${name}`,
    html,
    text,
    replyTo: email,
  };
}

/**
 * @param {{ name: string, email: string, serviceType: string, projectDate: string,
 *           budget: string, intendedUse: string, duration: string, geographic: string,
 *           deliverables: string, details?: Record<string, string | undefined>,
 *           notes?: string | null, quoteId?: string | null }} input
 */
export function buildQuoteEmail({
  name,
  email,
  serviceType,
  projectDate,
  budget,
  intendedUse,
  duration,
  geographic,
  deliverables,
  details = {},
  notes,
  quoteId,
}) {
  const html = renderEmail({
    // Budget and service in the preview line: the two facts that decide
    // whether this needs answering now or later.
    preheader: `${serviceType} · ${budget} · ${projectDate}`,
    eyebrow: 'Quote request',
    heading: `${name} wants a quote`,
    intro: `${serviceType} - ${budget}`,
    body: [
      detailPanel(
        [
          detailRow('Service', serviceType),
          detailRow('Date', projectDate),
          detailRow('Budget', budget),
          detailRow('Deliverables', deliverables),
        ].join(''),
      ),
      detailPanel(
        [
          detailRow('Name', name),
          detailRow('Email', email),
          detailRow('Phone', details.phone),
          detailRow('Organization', details.organization),
        ].join(''),
      ),
      detailPanel(
        [
          detailRow('Intended use', intendedUse),
          detailRow('Licence term', duration),
          detailRow('Territory', geographic),
          detailRow('Location', details.location),
          detailRow('Setting', details.setting),
          detailRow('Attendees', details.attendees),
          detailRow('Times', details.times),
          detailRow('Timeline', details.timeline),
        ].join(''),
      ),
      noteBlock('Notes', notes),
      button(`mailto:${email}?subject=${encodeURIComponent(`Re: ${serviceType} quote`)}`, `Reply to ${name.split(' ')[0]}`),
    ].join(''),
    footnote: [
      `Submitted ${submittedAt()}.`,
      quoteId ? ` Reference <code>${quoteId}</code>.` : ' Not stored, Supabase is not configured.',
    ].join(''),
  });

  const text = [
    `${name} wants a quote`,
    '',
    `Service:      ${serviceType}`,
    `Date:         ${projectDate}`,
    `Budget:       ${budget}`,
    `Deliverables: ${deliverables}`,
    '',
    `Name:         ${name}`,
    `Email:        ${email}`,
    details.phone ? `Phone:        ${details.phone}` : '',
    details.organization ? `Organization: ${details.organization}` : '',
    '',
    `Intended use: ${intendedUse}`,
    `Licence term: ${duration}`,
    `Territory:    ${geographic}`,
    details.location ? `Location:     ${details.location}` : '',
    details.setting ? `Setting:      ${details.setting}` : '',
    details.attendees ? `Attendees:    ${details.attendees}` : '',
    details.times ? `Times:        ${details.times}` : '',
    details.timeline ? `Timeline:     ${details.timeline}` : '',
    notes ? `\nNotes:\n${notes}` : '',
    '',
    quoteId ? `Reference: ${quoteId}` : 'Not stored, Supabase is not configured.',
    `Submitted ${submittedAt()}.`,
  ]
    .filter((line) => line !== '')
    .join('\n');

  return {
    subject: `Quote: ${serviceType} - ${name} - ${budget}`,
    html,
    text,
    replyTo: email,
  };
}
