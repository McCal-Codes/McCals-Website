/**
 * Shared HTML email layout.
 *
 * Email clients are not browsers. The constraints these helpers exist to
 * satisfy, all of which are still true in 2026:
 *
 *   * Layout is tables. Outlook renders through Word's HTML engine, which has
 *     no flexbox or grid, so a <div> layout collapses there.
 *   * Styles are inline. Gmail strips <style> blocks when a message is
 *     forwarded or clipped, and several clients never support them.
 *   * Width caps at 600px, the width every client shows without horizontal
 *     scrolling on a phone.
 *   * No background images and no web fonts, silently dropped by Outlook and
 *     several mobile clients, so anything depending on them must degrade.
 *   * Every message ships a plain-text alternative. Spam filters score
 *     HTML-only mail worse, and it is the accessible fallback.
 *
 * The palette is a light one rather than the site's dark theme: dark email
 * backgrounds fight with clients that apply their own dark-mode inversion, and
 * a confirmation someone needs to read on a phone in daylight is not the place
 * to make a stylistic point. The accent is the site's own.
 */

const ACCENT = '#8a7f74';
const INK = '#1a1a1a';
const MUTED = '#5f5a55';
const LINE = '#e4e0db';
const PANEL = '#f7f5f3';

/** Escapes values that originate outside our control. */
export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * A label/value row. Rendered as a table row rather than a flex pair so it
 * survives Outlook.
 */
export function detailRow(label, value) {
  if (value === null || value === undefined || value === '') return '';

  return `
              <tr>
                <td style="padding:6px 0;color:${MUTED};font-size:14px;white-space:nowrap;vertical-align:top;width:130px;">${escapeHtml(label)}</td>
                <td style="padding:6px 0;color:${INK};font-size:14px;font-weight:600;vertical-align:top;">${escapeHtml(value)}</td>
              </tr>`;
}

/** A block of longer free text, notes, a message body. */
export function noteBlock(label, body) {
  if (!body) return '';

  return `
        <tr><td style="padding:0 0 4px;color:${MUTED};font-size:13px;text-transform:uppercase;letter-spacing:0.06em;">${escapeHtml(label)}</td></tr>
        <tr><td style="padding:0 0 22px;color:${INK};font-size:15px;line-height:1.55;white-space:pre-wrap;">${escapeHtml(body)}</td></tr>`;
}

/** A call to action. Bulletproof enough for the clients that matter. */
export function button(href, label) {
  if (!href) return '';

  return `
        <tr><td style="padding:4px 0 22px;">
          <a href="${escapeHtml(href)}" style="display:inline-block;padding:12px 22px;background:${INK};color:#ffffff;text-decoration:none;border-radius:6px;font-size:15px;font-weight:600;">${escapeHtml(label)}</a>
        </td></tr>`;
}

/**
 * Wraps content in the shared shell.
 *
 * @param {{ preheader?: string, eyebrow?: string, heading: string, intro?: string, body: string, footnote?: string }} input
 */
export function renderEmail({ preheader, eyebrow, heading, intro, body, footnote }) {
  // The preheader is the grey line a client previews next to the subject. Left
  // unset, clients scrape whatever text comes first, usually "View in
  // browser" or, here, the greeting. Hidden in the body itself.
  const preheaderMarkup = preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>`
    : '';

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${escapeHtml(heading)}</title>
</head>
<body style="margin:0;padding:0;background:${PANEL};">
${preheaderMarkup}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${PANEL};">
  <tr><td align="center" style="padding:32px 16px;">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:100%;background:#ffffff;border:1px solid ${LINE};border-radius:12px;">
      <tr><td style="padding:32px 32px 0;">
        <div style="font:600 12px -apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;letter-spacing:0.14em;text-transform:uppercase;color:${ACCENT};padding-bottom:10px;">${escapeHtml(eyebrow || 'McCal Media')}</div>
        <h1 style="margin:0 0 ${intro ? '10px' : '22px'};font:700 24px/1.25 -apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:${INK};">${escapeHtml(heading)}</h1>
        ${intro ? `<p style="margin:0 0 22px;font:400 16px/1.55 -apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:${MUTED};">${escapeHtml(intro)}</p>` : ''}
      </td></tr>
      <tr><td style="padding:0 32px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
          ${body}
        </table>
      </td></tr>
      ${
        footnote
          ? `<tr><td style="padding:8px 32px 32px;border-top:1px solid ${LINE};">
        <p style="margin:18px 0 0;font:400 13px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:${MUTED};">${footnote}</p>
      </td></tr>`
          : `<tr><td style="padding:0 32px 32px;"></td></tr>`
      }
    </table>
    <p style="margin:16px 0 0;font:400 12px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:${MUTED};">McCal Media &middot; Pittsburgh, PA</p>
  </td></tr>
</table>
</body>
</html>`;
}

/** A panel for the details table, so it reads as one grouped block. */
export function detailPanel(rows) {
  if (!rows.trim()) return '';

  return `
        <tr><td style="padding:0 0 22px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${PANEL};border:1px solid ${LINE};border-radius:8px;">
            <tr><td style="padding:14px 18px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rows}</table>
            </td></tr>
          </table>
        </td></tr>`;
}

/**
 * A secondary, lower-weight action. Used where a message has a primary button
 * already and a second link would compete with it.
 */
export function linkRow(href, label, hint) {
  if (!href) return '';

  return `
        <tr><td style="padding:0 0 22px;font:400 14px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:${MUTED};">
          <a href="${escapeHtml(href)}" style="color:${INK};font-weight:600;text-decoration:underline;">${escapeHtml(label)}</a>${hint ? ` &nbsp;<span style="color:${MUTED};">${escapeHtml(hint)}</span>` : ''}
        </td></tr>`;
}
