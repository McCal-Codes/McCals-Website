# McCal Media Workspace — Copilot Instructions

Purpose: fast, safe, and consistent edits for the `McCals-Website` workspace.

## 1) Project reality (read first)

- Primary production target is **Squarespace** (`mcc-cal.com`) embedding versioned widget HTML from `src/widgets/**/versions/`.
- `src/site/` is a **local preview harness**, not production runtime.
- `src/api/` is the companion API service code used by dev/proxy and integrations.
- Manifests are generated artifacts; do not hand-edit generated JSON outputs.

## 2) Non-negotiable rules

- Widgets must be self-contained HTML (inline CSS/JS, no external runtime dependencies unless explicitly required).
- Create new widget versions; do not overwrite older version files.
- Do not edit `dist/**` manually.
- Do not commit secrets, tokens, private keys, or plaintext credentials.
- Use standard code annotations: `TODO`, `FIXME`, `BUG`, `SECURITY`, `NOTE`, `A11Y`, etc.
- If adding a code `TODO:`, also track it in `updates/todo.md` (or move to completed tracking when finished).

## 3) Source map (high signal)

- `src/widgets/` → deliverable widgets (`_content`, `_navigation`, `portfolios`, `_admin`, `_archived`)
- `src/images/Portfolios/` → portfolio images + generated manifests
- `scripts/manifest/` → canonical manifest generators
- `scripts/watchers/` → local auto-regeneration watchers
- `scripts/utils/` → validation/audit utilities
- `docs/standards/` → authoritative coding, performance, accessibility, and workflow standards

## 4) Daily workflow (preferred)

1. Run preflight: `npm run ai:preflight:short`
2. Read the relevant widget/API README and standards doc before changing behavior
3. Make minimal, scoped edits
4. If image/folder/manifests changed, run generators
5. Validate before handoff

Useful commands:

- `npm run dev`
- `npm run validate:widgets`
- `npm run manifest:dry-run`
- `npm run manifest:generate`
- `npm run repo:health`

## 5) Manifest policy (current)

- Prefer/consume **aggregated manifests** per portfolio (for example: `concert-manifest.json`, `events-manifest.json`, `journalism-manifest.json`, `portrait-manifest.json`, `nature-manifest.json`, `portfolio-manifest.json`).
- Avoid reintroducing per-folder `manifest.json` workflows unless a migration explicitly requires it.
- If schema changes, update: generator scripts, consumers (widgets/site/API), CI/workflows, and docs together.

## 6) Performance + accessibility doctrine

Optimize for real users first (not synthetic scores):

1. LCP / above-the-fold visibility
2. main-thread blocking avoidance
3. progressive enhancement
4. accessibility and semantic correctness
5. maintainability

Guardrails:

- Do not JS-render critical above-the-fold visuals.
- Prefer native `<img>` for primary images; progressively enhance after first paint.
- Defer non-critical JS.
- Treat performance and accessibility regressions as bugs.

## 7) Widget conventions

- Keep selectors scoped to widget namespace.
- Use semantic versioning filename format: `vX.Y.Z-*.html`.
- Update each widget’s `README.md` and `CHANGELOG.md` when behavior changes.
- For Squarespace deployment, use immutable jsDelivr tag URLs when possible.

## 8) Script organization + archival

- Keep new scripts inside the right subfolder (`manifest/`, `watchers/`, `utils/`, `admin/`).
- Move obsolete scripts to `scripts/_archived/` with clear context.
- Validate script references after reorgs.

## 9) Security baseline

- Use `.env`/environment variables for secrets; keep `.env.example` updated.
- Enforce auth on admin/privileged routes.
- Validate/sanitize untrusted inputs and URLs.
- Prefer production dependency audits (`npm audit --omit=dev`) across root and subprojects.

## 10) Change-management requirements

- If this file changes, add a `CHANGELOG.md` entry under **Docs/Meta**.
- If major structure/workflow changes land, update root `README.md` and relevant standards docs.
- Keep instructions concise; move deep history to changelog/docs, not this file.

## 11) Quick references

- `docs/ONBOARDING.md`
- `docs/standards/workspace-organization.md`
- `docs/standards/widget-reference.md`
- `docs/standards/widget-standards.md`
- `docs/standards/performance-standards.md`
- `docs/standards/accessibility-patterns.md`
- `docs/standards/code-annotations.md`

## Recent updates

- 2026-03-05: Consolidated this file into a concise operations guide sourced from current standards and READMEs; moved long-form historical detail responsibility to `CHANGELOG.md` and `docs/**`.