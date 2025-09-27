# Site Footer Widget

Drop-in footer embed for Squarespace code blocks that matches the glass navigation aesthetic.

## Features
- Blur + translucent background so text stays readable on top of imagery.
- Links grouped for About, Contact, Portfolio, plus social icons and Mailchimp form.
- Version badge and modal consistent with other widgets for QA tracking.

## Usage
1. Copy the latest file from `versions/` (starting with `v1.0.0.html`).
2. Paste into a Squarespace Code Block at the bottom of the page.
3. Adjust link destinations or Mailchimp action URL as needed.
4. If you iterate, duplicate the prior version file, rename it with the new semantic version, then edit.

## Notes
- Keep the wrapper `<div class="mcc-footer-widget">` so the scoped styles remain intact.
- The script moves the version badge/modal to the body and stamps the current year automatically.
