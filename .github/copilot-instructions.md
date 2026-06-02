# McCal Media Workspace — Copilot Instructions

Purpose: fast, safe, and consistent edits for the `McCals-Website` workspace.

## 1) Project reality (read first)

- Primary production target is **the Vite public app** in `sites/mcc-cal-vite/`, deployed for `mcc-cal.com`.
- The internal admin console lives in `sites/mcc-cal-admin/` and deploys as a separate Vercel project.
- The companion API/Worker source is not present in this checkout; deploy it from the companion API repository when needed.
- Manifests are generated artifacts; do not hand-edit generated JSON outputs.

## 2) Non-negotiable rules

- Keep new public work in `sites/mcc-cal-vite` unless a legacy widget explicitly needs maintenance.
- Legacy widgets, when maintained, must remain self-contained HTML and should not overwrite older version files.
- Do not edit `dist/**` manually.
- Do not commit secrets, tokens, private keys, or plaintext credentials.
- Do not include AI tool names or attribution in commit messages, co-author lines, or code comments.
- Use standard code annotations: `TODO`, `FIXME`, `BUG`, `SECURITY`, `NOTE`, `A11Y`, etc.
- If adding a code `TODO:`, also track it in `updates/todo.md` (or move to completed tracking when finished).

## 3) Source map (high signal)

- `src/content/blog/` -> canonical blog content (`authors.json`, `posts/<slug>/post.md` preferred, generated `post.json`, `blog-manifest.json`)

- `sites/mcc-cal-vite/` -> public Vite app, routes, components, Vercel Functions, and static assets
- `sites/mcc-cal-admin/` -> internal admin console and admin-only Vercel Functions
- `src/images/Portfolios/` → portfolio images + generated manifests
- `src/content/blog/` -> canonical blog content (`authors.json`, `posts/<slug>/post.md` preferred, generated `post.json`, `blog-manifest.json`)
- `scripts/manifest/` → canonical manifest generators
- `scripts/watchers/` → local auto-regeneration watchers
- `scripts/utils/` → validation/audit utilities
- `docs/standards/` → authoritative coding, performance, accessibility, and workflow standards

## 4) Daily workflow (preferred)

1. Run preflight: `npm run ai:preflight:short`
2. Read the relevant app/API/content file and standards doc before changing behavior
3. Make minimal, scoped edits
4. If image/folder/manifests changed, run generators
5. Validate before handoff

Useful commands:

- `npm run dev`
- `npm run dev:admin`
- `cd sites/mcc-cal-vite && npm run test:run`
- `npm run manifest:dry-run`
- `npm run manifest:generate`
- `npm run repo:health`

## 5) Manifest policy (current)

- Prefer/consume **aggregated manifests** per portfolio (for example: `concert-manifest.json`, `events-manifest.json`, `journalism-manifest.json`, `portrait-manifest.json`, `nature-manifest.json`, `portfolio-manifest.json`).
- Avoid reintroducing per-folder `manifest.json` workflows unless a migration explicitly requires it.
- If schema changes, update generator scripts, app/API consumers, CI/workflows, and docs together.

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

- 2026-06-02: CI guard maintenance should keep `actions/github-script@v9` issue calls under `github.rest.issues`, grant `issues: write` to PR-commenting guards, keep Gitleaks checkouts deep enough for commit range scans, and use tracked static manifest fixtures in Vite tests.

- 2026-03-30: Added a Markdown-first blog workflow under `src/content/blog/`. `post.md` is now the preferred authored source, `post.json` is generated for runtime compatibility, and Google Docs import now writes Markdown to support gradual migration off Docs.

- 2026-03-05: Consolidated this file into a concise operations guide sourced from current standards and READMEs; moved long-form historical detail responsibility to `CHANGELOG.md` and `docs/**`.
