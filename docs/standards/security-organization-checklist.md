# Security & Organization Checklist (Non-Breaking)

Use this list for quick hardening passes or PR reviews. It is derived from `security-organization-prompt.md` and focuses on changes that keep existing behavior intact.

## HTTP & App Surface
- Add standard headers: HSTS, X-Frame-Options, X-Content-Type-Options, and a CSP with only required sources. Keep relaxed CORS limited to non-production.
- Cap request body sizes and apply sensible rate limits on API endpoints and background triggers (e.g., dev-server helpers).
- Validate and sanitize all inbound parameters, including CLI-like endpoints such as `__start_next` in `dev-server.js`.

## Secrets & Dependencies
- Enforce env files with required-key checks; prevent secrets from being committed. Run automated secret scanning in CI (e.g., gitleaks or GitHub advanced security).
- Run dependency audits in CI (`npm audit --production` or `npm-audit-resolver`); consider Snyk for continuous monitoring.

## AuthZ / AuthN
- Require auth tokens or IP allowlists for state-changing routes and powerful controls; avoid enabling dev-only flags in production.

## CI & Ops Hygiene
- Standardize CI to run lint, tests, security audits, and build checks on every PR.
- Centralize environment-specific configuration (ports, hosts, feature flags) in a single config module to avoid drift.
- Keep assets/logs tidy with clean/health scripts in CI to prevent artifact bloat.
- Maintain a short “operations index” in `docs/` that explains utility scripts (e.g., `manifest:*`, `watch:*`, `versions:*`) for onboarding.

## Usage
- For AI-assisted reviews, paste `docs/standards/security-organization-prompt.md` into your tool and ask for recommendations that must keep behavior unchanged.
