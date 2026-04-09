# Contact Form Widget

Latest stable: `v1.0.0`  
Latest preview: `v1.1.0-WIP` (`versions/v1.1.0-contact-enhanced.html`)  
Last updated: March 11, 2026

## Overview

This widget is the Squarespace-era contact form used for lead capture before the native `/contact`
route replaces it. The current implementation sends messages through EmailJS, so it can run in a
static embed without a custom backend.

## Current behavior

- EmailJS delivery with client-side credentials
- Required-field validation
- Honeypot spam trap
- Minimum submit-time trap for basic bot filtering
- Success and error status messaging
- Theme toggle with local preference persistence
- Mobile-friendly layout and keyboard focus states

## Files

- Stable version: `src/widgets/_content/contact-form/versions/v1.0.0-contact-form.html`
- Active preview: `src/widgets/_content/contact-form/versions/v1.1.0-contact-enhanced.html`
- Setup guide: `src/widgets/_content/contact-form/SETUP.md`

## Quick start

1. Create an EmailJS account and connect the mailbox that should receive submissions.
2. Create an EmailJS template using the widget fields listed in `SETUP.md`.
3. Open `versions/v1.1.0-contact-enhanced.html`.
4. Replace the placeholder values in `EMAILJS_CONFIG` with your real EmailJS keys.
5. Test a submission in a local browser before copying the widget into Squarespace.

## Configuration

Update this block near the bottom of the widget file:

```javascript
const EMAILJS_CONFIG = {
  publicKey: 'YOUR_PUBLIC_KEY',
  serviceId: 'YOUR_SERVICE_ID',
  templateId: 'YOUR_TEMPLATE_ID',
};
```

The widget sends these template variables:

```text
name
email
subject
message
consent
timestamp
```

## Deployment notes

- For the hardened bridge version, use `v1.1.0-contact-enhanced.html`.
- If you need the older stable fallback, use `v1.0.0-contact-form.html`.
- Copy the widget HTML directly into a Squarespace Code Block or load it through the existing CDN
  flow used elsewhere in this repo.

## Security notes

- EmailJS public keys are expected to be exposed client-side, but service/template IDs should still
  be scoped to this form only.
- The widget now uses both a honeypot field and a minimum submit-time check to filter basic bots.
- Provider error details are escaped before they are rendered into the page.
- High-volume traffic should move to an owned backend or enable stronger provider-side protections.

## Known limitations

- This is still a bridge widget, not the target long-term `/contact` implementation.
- Delivery depends on EmailJS availability and account configuration.
- Spam filtering is improved but still client-side; it is not equivalent to a server-owned form
  pipeline.

## Version notes

### v1.1.0-WIP

- Added UI polish and a visible version marker
- Hardened bot filtering with a time trap on top of the honeypot
- Fixed the broken auto-hide behavior for form status messages
- Escaped provider error details before injecting them into the DOM

### v1.0.0

- Initial EmailJS release
- Dark mode and responsive layout
- Required-field validation and success/error messaging
