# McCal Development

Technical product portfolio for `dev.mcc-cal.com`.

## Purpose

`mcc-cal.com` is an editorial photography portfolio. This is a separate publication for software
work: a numbered project index, structured project metadata, documentation-style case studies,
build notes, and visible development history.

It shares the brand's dark tone, restraint, and typographic discipline with the photography site.
It does not share its layout system, gallery structure, or component library. The two are
deliberately different mediums.

Design direction: **dark technical editorial with product-system structure.**

## Local development

```bash
cd sites/mcc-cal-dev
npm install
npm run dev
```

Runs on http://localhost:4320.

```bash
npm run build      # tsc -b && vite build
npm run typecheck  # tsc -b
npm run lint       # eslint
```

## Architecture

| Path | Purpose |
| --- | --- |
| `src/content/` | All site content, typed. Projects, notes, activity, site identity. No CMS, no runtime fetch. |
| `src/content/types.ts` | The case-study schema. Every project page renders through it. |
| `src/components/` | The component kit (index rows, metadata tables, section nav, diagrams, timelines). |
| `src/styles/tokens.css` | The design system. One accent token, one type scale. |
| `public/fonts/` | Self-hosted woff2. The CSP is `font-src 'self'`, so no external font host will load. |

Adding a project means adding one entry to `src/content/projects.ts`. The index row, the route,
the metadata table, and the sticky section nav all derive from it.

## Content rules

- No fabricated metrics. Repository counts are shown only when they come from real data.
- No AI terminology, branding, or features.
- No em dashes in site copy. Use commas, parentheses, or sentence breaks.
- Status is communicated by shape and text, never by color alone.

## Required Vercel setup

1. Create a **separate Vercel project** with root directory `sites/mcc-cal-dev`.
2. Point `dev.mcc-cal.com` at it.

   **`dev.mcc-cal.com` is currently the photography site's preview domain.** It must be released
   first, and the photography project's preview-environment `VITE_SITE_URL` updated, or production
   canonical URLs will regress. See `docs/runbooks/vercel-dev-portfolio.md` and
   `docs/learned/audit-remediation-and-deploy-pipeline-pitfalls.md` section 1.

3. No environment variables are required. The site has no API surface and no runtime data fetching.
