# Contributing to McCals-Website

Thank you for helping improve McCal Media's Squarespace widget workspace. This guide covers the basics to get productive quickly and keep contributions consistent.

## Quick Start
1. Install dependencies: `npm install`
2. Run the local dev server: `npm run dev`
3. Validate widgets before committing: `npm run validate:widgets`
4. (Optional) Generate manifests after image changes: `npm run manifest:generate`

## Branching & Commit Hygiene
- Use short-lived feature branches: `feature/<description>` or `fix/<description>`.
- Keep commit subjects under ~50 characters and explain the "why" in the body when useful.
- Prefer focused commits (docs, tests, or feature change per commit) to keep history readable.

## Testing & Checks
Before opening a PR:
- `npm run lint` — ESLint
- `npm run test` — Playwright tests (or targeted subset if applicable)
- `npm run validate:widgets` — Widget structure/attribute checks
- `npm run repo:health` — Repository health checks
- `npm run ai:preflight:short` — Quick context validation for instruction compliance

## Code & Content Standards
- Widgets must remain self-contained (inline CSS/JS, required attributes). Follow `docs/standards/widget-standards.md`.
- Use semantic HTML and accessible patterns; ensure images include `alt` text and consider `loading="lazy"` where appropriate.
- Prefer `const`/`let`, strict equality, and small, single-purpose functions in JavaScript.
- Avoid committing large binaries (>5MB); use Git LFS or external hosting when needed.

## Reviews & PRs
- Link PRs to related TODO items or the [Repository Improvement Plan](docs/repo-improvement-plan.md) when applicable.
- Include testing results in the PR description.
- Be explicit about any follow-up work or known limitations.

## Code of Conduct
By participating, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). If you witness or experience unacceptable behavior, please contact the maintainers listed in `CODEOWNERS`.

## Need Help?
Open an issue or reach out to the repo owners in `CODEOWNERS`. For workflow guidance, see `docs/standards/workspace-organization.md`.
