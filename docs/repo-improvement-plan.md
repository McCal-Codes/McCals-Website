# Repository Improvement Plan

This plan translates the high-level improvement goals for **McCals-Website** into actionable steps. It is organized into quick wins (do now), near-term priorities (1–2 weeks), and medium-term initiatives (2–4 weeks). Owners and checkpoints can be assigned in follow-up issues.

## Goals
- Strengthen documentation and contributor guidance so newcomers can reliably set up, contribute, and release changes.
- Raise accessibility and semantic HTML quality to meet WCAG AA and modern SEO expectations.
- Modernize CSS/JS structure for maintainability, consistency, and performance.
- Improve performance and resource loading to reduce LCP/TBT and avoid regressions.
- Standardize automation (CI, templates, dependency hygiene) to keep quality high over time.

## Quick Wins (Do Now)
- **README refresh**: Add clear setup, run, and deploy instructions plus a short architecture map (widgets, dev server, scripts). **Status:** Done.
- **Contributing hygiene**: Update `CONTRIBUTING.md` with branching, testing, and review expectations; link to lint/test scripts. **Status:** Done.
- **Code of Conduct check**: Confirm `CODE_OF_CONDUCT.md` exists, is referenced from README, and matches GitHub community standards. **Status:** Done.
- **Git ignore audit**: Verify `.gitignore` covers `node_modules/`, `.DS_Store`, `.env*`, `logs/`, `reports/`, and build outputs; add missing patterns. **Status:** Done.
- **Resource hints**: Add `<link rel="preconnect">`/`<link rel="dns-prefetch">` for critical domains in site layouts/templates.
- **Defer/async scripts**: Ensure non-critical scripts load with `defer` or `async` where safe.

## Near-Term Priorities (1–2 Weeks)
- **Semantic & accessibility audit**:
  - Replace non-semantic wrappers with `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>` where appropriate.
  - Enforce logical heading order and ARIA labels for nav, toggles, dialogs, and forms.
  - Add `loading="lazy"` and explicit dimensions to images; ensure alt text coverage.
  - Run axe-core (Firefox/Playwright) and save reports to `reports/axe-firefox-results.json` and `reports/axe-firefox-widget-report.html`; summarize findings.
- **CSS modularization**:
  - Establish shared tokens/variables (colors, spacing, typography) via Tailwind config or CSS variables.
  - Extract shared widget styles into `src/widgets/_shared/site-widgets.css` with opt-out guidance.
  - Adopt a naming convention (BEM or utility-first) and document in README/CONTRIBUTING.
- **JavaScript modernization**: Convert remaining `var` usage to `let/const`, prefer strict equality, and centralize utility helpers; avoid inline scripts.
- **Performance checklist**: Add a lightweight checklist (LCP, CLS, TBT, font loading, caching) to PR template and release steps.
- **CI coverage**: Add lint (`npm run lint`), tests (`npm run test` or Playwright subset), and accessibility audit jobs to GitHub Actions; gate on PRs.

## Medium-Term Initiatives (2–4 Weeks)
- **Automated widget validation**: Build small unit/integration harness for widgets and wire into CI; capture artifacts in `reports/`.
- **Dependency governance**: Enable Dependabot (npm) with weekly cadence; add security advisories scanning.
- **Templates & metadata**: Add PR template, issue templates (bug report, feature request), and ensure LICENSE/README link to them.
- **Performance hardening**: Implement image pipeline (WebP/AVIF, responsive sources), cache headers for assets, and preload critical CSS/JS.
- **Legacy/active version policy enforcement**: Add CI guard to ensure no more than two active versions per widget directory and archive legacy versions under `src/widgets/_archived/`.
- **Monitoring hooks**: Add optional Lighthouse/Calibre runs on staging or scheduled basis; track metrics over time.

## Execution Notes
- Use small, incremental PRs tied to this plan; keep commit messages descriptive (what/why) and under 50 characters in the subject.
- Update `updates/todo.md` as items land (reference this plan and link the relevant PRs).
- Keep accessibility and performance reports versioned in `reports/`; avoid committing large binary artifacts.
- Re-run `npm run ai:preflight:short` (or equivalent) before merging substantial structural changes.

