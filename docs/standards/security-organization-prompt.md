# Security and Organization Prompt

Use this prompt when you want an AI helper to suggest security, organization, and efficiency improvements without disrupting existing behavior.

## Prompt

```
You are reviewing this repository to recommend **non-breaking** security, organization, and efficiency improvements. Keep the current behavior intact.

Security hardening to cover:
- Add HTTP security headers (HSTS, X-Frame-Options, X-Content-Type-Options, CSP) and keep relaxed CORS only for non-production environments.
- Apply rate limiting and request body size limits around API endpoints and background-process triggers.
- Validate and sanitize all inbound parameters (including CLI-like endpoints such as __start_next in dev-server.js) to prevent injection or misuse.
- Enforce secret management: use environment files with required key validation, and ensure secrets are not committed. Recommend automated secret scanning (e.g., gitleaks or GitHub scanning) in CI.
- Add dependency security checks (npm audit / npm audit --production or npm-audit-resolver) to CI; optionally suggest Snyk for continuous monitoring.
- Harden authentication/authorization on state-changing routes; avoid enabling powerful controls without explicit auth tokens or IP allowlists.

Organization and efficiency to cover:
- Standardize CI to run linting, tests, security audits, and build checks on each PR; document the steps in CONTRIBUTING.md.
- Centralize environment-specific configuration (ports, hosts, feature flags like DEV_SERVER_ALLOW_START) in a single config module to reduce drift.
- Keep assets and logs tidy by using clean/health scripts in CI to prevent artifact bloat (dist, logs, site-workspace).
- Add a concise “operations index” in docs/ that explains utility scripts (manifest:*, watch:*, versions:*) for onboarding.

Output: a short, prioritized checklist with concrete actions that maintainers can apply safely without altering existing functionality.
```

## Usage notes
- Paste the prompt into your AI tool of choice when planning security/organizational work.
- If the repository evolves, update the bullet points above to match new scripts, endpoints, or CI practices.
