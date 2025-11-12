# Contact Page Widget (WIP / Internal Only)

Comprehensive full-page contact form widget for Squarespace with accessible validation, spam protection primitives, consent handling, and container‑scoped theming ("Blinding Mode" pattern).

> STATUS: Work in Progress — Not for public release. Do **not** list in root README yet.

## Latest Version: v0.2.0

**What's New:**
- ✅ Dynamic provider support (Formspree, EmailJS, Custom API)
- ✅ Improved spacing and visual hierarchy
- ✅ Online functionality with real backend services
- ✅ Better error handling and user feedback
- ✅ Enhanced ARIA support and accessibility
- ✅ Comprehensive provider configuration guide

## Goals (v1 scope)
- ARIA-compliant, keyboard & screen reader friendly form
- Required fields: Name, Email, Message, Consent checkbox (privacy/GDPR)
- Optional fields: Subject
- Spam protection: honeypot + (pluggable) CAPTCHA placeholder hook
- Theming & Visibility Hardening: container `data-theme` toggle (dark ↔ blinding), safe color tokens, heading resets, optional haze overlay
- Clear inline + summary errors, live region status updates, optimistic UX with loading state
- Provider adapter abstraction (mock implementation now; future: Formspree / EmailJS / custom API)

## File Structure
```
contact-page/
  README.md              – This file
  STATUS.md              – WIP flag & policy
  CHANGELOG.md           – Version history (internal)
  PROVIDERS.md           – Provider configuration guide (Formspree/EmailJS/Custom)
  versions/
    v0.1.0-contact-page.html  – Initial scaffold (deprecated)
    v0.2.0-contact-page.html  – Current version with dynamic providers
```

## Quick Start

### For Testing (Mock Provider)
```html
<div class="mcc-contact-widget" data-widget-version="0.2.0">
  <!-- Widget content -->
</div>
```

### For Production with Formspree
```html
<div class="mcc-contact-widget" 
     data-widget-version="0.2.0"
     data-provider="formspree"
     data-formspree-id="YOUR_FORM_ID">
  <!-- Widget content -->
</div>
```

### For EmailJS
```html
<div class="mcc-contact-widget"
     data-widget-version="0.2.0"
     data-provider="emailjs"
     data-emailjs-service="YOUR_SERVICE_ID"
     data-emailjs-template="YOUR_TEMPLATE_ID"
     data-emailjs-user="YOUR_PUBLIC_KEY">
  <!-- Widget content -->
</div>
```

**See PROVIDERS.md for complete configuration guide.**

## Embedding (when production ready)
1. Copy the latest version file contents into a Squarespace Code Block on `/contact` page.
2. Adjust `data-endpoint` or provider configuration section for real email/CRM integration.
3. Optionally enable CAPTCHA by supplying an implementation in the `captchaAdapter` stub.

## Accessibility & Validation Pattern
- Each input wrapped in `.field` with `<label>` and `.field-hint` (optional) + `.field-error` region (`aria-live="polite"`).
- Inputs receive `aria-invalid="true"` when failing validation and are associated with error message via `aria-describedby`.
- A top summary list (hidden until errors) provides quick navigation to errors (`role="alert"`).
- Global status region: `<div class="form-status" role="status" aria-live="polite"></div>` for submitting / success / failure messages.
- Keyboard: submit on Enter in any field; Esc clears global alert if open.

## Theming (Blinding Mode)
- Default theme: `data-theme="dark"`.
- Toggle button changes container attribute only (never `<html>`): ensures isolation inside Squarespace.
- Light theme label displays “Dark Mode”; dark theme label displays “Blinding Mode” (action‑oriented).
- Safe tokens: `--body-safe`, `--link-safe`, `--surface-safe`, `--border-safe`, `--accent-safe`.
- Headings forcibly reset for visibility: remove blends/gradients and set `-webkit-text-fill-color: currentColor`.
- Optional haze overlay (light mode) via `data-haze="soft|softer"` applying subtle blur & gradient.

## Spam Protection
- Honeypot input (`_antiTime` + visually hidden) must stay empty.
- Time-to-submit heuristic: measure ms from page interactive to submission; if < threshold (e.g., 800ms) treat as suspicious.
- Placeholder CAPTCHA adapter exposes `captchaAdapter.getToken()` returning a Promise; default mock resolves null.

## Provider Adapter
`contactProvider.send(formData)` returns a Promise resolving `{ ok: true }` or rejecting with `{ ok:false, message }`.

### Mock Implementation
Simulates latency (600–900ms) and random (10%) failure for resilience testing.

### Future Adapters (stubs documented in code)
- Formspree (simple POST)
- EmailJS (client SDK)
- Custom serverless endpoint (POST JSON)

## Performance / Progressive Enhancements
- JS guards: no crash if JS disabled (basic form markup remains; non-functional until activation).
- CSS uses logical properties, fluid spacing with clamp(), reduced-motion handling for transitions.
- Large tasks avoided; minimal reflow on validation.

## Debug / Development Aids
- `?debug=true` adds a diagnostics panel (counts validations, shows serialized payload, spam heuristics metrics).
- Console info logs prefixed with `[ContactWidget]`.

## Roadmap
- v0.2.0: Real provider plug adapter config, optional rate limiting, character counters
- v0.3.0: i18n infrastructure
- v1.0.0: Production readiness (documentation polish, security review, CAPTCHA integration)

## References
- See `docs/standards/widget-standards.md` and `widget-development.md` for required patterns.
- Theming & Visibility Hardening section: ensure consistency if standards doc evolves.

## License
Inherits repository license; attribution header must remain intact in versioned HTML.
