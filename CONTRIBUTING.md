# Contributing to McCals-Website

Thank you for helping improve McCal Media's Squarespace widget workspace. This guide covers the basics to get productive quickly and keep contributions consistent.

## Quick Start

1. Install dependencies: `npm install`
2. Run the local dev server: `npm run dev`
3. Validate widgets before committing: `npm run validate:widgets`
4. (Optional) Generate manifests after image changes: `npm run manifest:generate`

## Branching & Commit Hygiene

- Use short-lived feature branches: `feature/<description>` or `fix/<description>`.
- Create branches from `main` and keep them up-to-date with regular rebases.
- Keep commit subjects under ~50 characters and explain the "why" in the body when useful.
- Prefer focused commits (docs, tests, or feature change per commit) to keep history readable.
- Before submitting a PR, ensure your branch is clean: squash WIP commits and remove debug changes.

## Pull Request Process

1. **Create PR from your feature branch** targeting `main` (or the designated branch).
2. **Fill out the PR template** with a clear description, testing steps, and any related issues.
3. **Link to TODO items** or the [Repository Improvement Plan](docs/repo-improvement-plan.md) when applicable.
4. **Request reviews** from maintainers listed in `CODEOWNERS`.
5. **Address feedback promptly** and push updates to the same branch.
6. **Wait for approval** before merging (maintainers will merge or enable auto-merge).
7. **Delete branch** after merge to keep the repository clean.

## Testing & Checks

Before opening a PR:

- `npm run lint` — ESLint (fix issues with `npm run lint:fix`)
- `npm run test` — Playwright tests (or targeted subset if applicable)
- `npm run validate:widgets` — Widget structure/attribute checks
- `npm run manifest:dry-run` — Verify manifest generators work without writing files
- `npm run repo:health` — Repository health checks (macOS/Linux)
- `npm run ai:preflight:short` — Quick context validation for instruction compliance

All tests must pass before merging. If adding new features, include appropriate test coverage.

## Code & Content Standards

- Widgets must remain self-contained (inline CSS/JS, required attributes). Follow `docs/standards/widget-standards.md`.
- Use semantic HTML and accessible patterns; ensure images include `alt` text and consider `loading="lazy"` where appropriate.
- Prefer `const`/`let`, strict equality, and small, single-purpose functions in JavaScript.
- Avoid committing large binaries (>5MB); use Git LFS or external hosting when needed.
- Follow the manifest aggregation policy: one manifest per portfolio type in `src/images/Portfolios/<Type>/`.
- Archive legacy widget versions to `src/widgets/_archived/legacy-widget-versions/<widget>/` with INDEX.json.

## Code of Conduct

By participating, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). If you witness or experience unacceptable behavior, please contact the maintainers listed in `CODEOWNERS`.

## Need Help?

Open an issue or reach out to the repo owners in `CODEOWNERS`. For workflow guidance, see `docs/standards/workspace-organization.md`.
