# Security Policy

We aim for fast, **non-breaking** fixes. Please follow the process below to report vulnerabilities or request hardening work.

## Reporting a Vulnerability
- Prefer GitHub’s private **“Report a vulnerability”** / Security Advisory flow for this repo so details stay private until a fix ships.
- If that is unavailable, open a `security`-labeled draft issue with only minimal impact notes, or contact a maintainer directly via GitHub DM. Do **not** post exploit details publicly.
- Include: affected path / endpoint, commit hash or tag, reproduction steps, expected vs. actual behavior, environment (OS, Node version), and any logs with secrets redacted.
- Avoid testing against third-party infrastructure; keep proof-of-concepts to local/dev instances.

## Response Targets
- Acknowledgment: within 3 business days.
- Triage and mitigation plan: within 7 business days.
- Fix or workaround: best-effort within 30 days depending on severity and scope.
We’ll coordinate a disclosure timeline and CVE (if applicable) with you once a fix is ready.

## Scope and Safe Harbor
- In scope: authentication/authorization bypasses, RCE, data exposure, injection, CSRF, SSRF, sandbox escapes, sensitive secret leaks, and privilege escalation in dev tooling (e.g., `dev-server.js`).
- Out of scope: social engineering, physical attacks, DDoS, spam/SEO reports, issues requiring privileged local access, findings that only apply to forks with modified configs.
- Please avoid actions that could degrade collaborator environments (e.g., mass file writes, deliberate crash loops).

## Testing Guidelines
- Use your own environments; do not target production customer assets.
- Keep traffic low and time‑boxed; do not brute force or run unthrottled scanners.
- Never commit or transmit real secrets in reports—use redacted placeholders.

## Supported Versions
- Active branch: `main`. Older tags/branches are not maintained; please retest on `main` before reporting.

## Hardening Backlog
Maintainers track non-breaking security and organization improvements using `docs/standards/security-organization-prompt.md`. If your report or suggestion aligns with that checklist (e.g., HTTP security headers, rate limiting, input validation, secret management, dependency audits), please call it out so we can prioritize it quickly.
