# Design System Portfolio Widget

**Current Version: v1.4.0** — Overview-first, breathable dynamic portfolio with spotlight storytelling, deep-dive modals, and per-case-study page links.

## Overview

This widget is intentionally different from image-heavy portfolio widgets. It presents engineering evidence instead of gallery media and is designed for recruiters, collaborators, and maintainers reviewing systems-thinking work.

## Features

- **Evidence-first project cards** with problem, approach, architecture, decisions, and outcomes
- **Track filters** (`all`, `ui`, `infrastructure`, `governance`, `tooling`) for quick review
- **System foundations panel** for token, component, and governance principles
- **Architecture map + workflow timeline** for high-level system reasoning
- **Accessible interactions** (keyboard-operable controls, semantic landmarks, focus states)
- **Self-contained deployment** (inline CSS/JS; no runtime dependencies)
- **Live GitHub enrichment** for mapped repos (stars, forks, open issues, push date, languages)
- **Card-level links** to GitHub and homepage when available
- **Manual refresh control** plus local cache for API-friendly updates
- **Interactive project explorer** with search and sort controls
- **Project detail viewer modal** with previous/next navigation across filtered projects
- **Projects-first case study structure** (Problem, Process, System Architecture, Result, Reflection)
- **Screenshot gallery controls** inside each project modal (plus keyboard left/right navigation)
- **Feature evidence cards** for each project to demonstrate role-ready capability depth
- **Connected systems section** in each modal to show how related projects reinforce each other
- **Case-study page links** per project (`caseStudyUrl`) shown in card actions, spotlight actions, and modal deep dive
- **Overview + spotlight layout** for quick recruiter scan before full case-study exploration
- **About + language coverage section** mapping known languages to projects worked on
- **Contribution attribution support** (`attribution`) for team/collaboration context and original repo source links
- **Private repository support** via `privateRepo: true` (or `repoVisibility: "private"`) so project evidence can render without failing GitHub sync
- **Required version indicator + changelog modal** pattern

## Usage (Squarespace)

1. Copy the full contents of `versions/v1.4.0-design-system-portfolio-overview-dynamic.html`.
2. Paste into a Squarespace Code Block.
3. Optionally tune root attributes:
  - `data-default-track="all|platform|tooling|governance|product|systems"`
  - `data-github-owner="McCal-Codes"`
4. Replace or extend the inline JSON dataset (`#designSystemPortfolioData`) with real projects and outcomes.

### Squarespace Routing (Important)

You do **not** have to use `/projects/*` URLs unless your site IA is set up that way.

- If you created a **Projects folder** page in Squarespace, use paths like `/projects/roadmap`.
- If you use **root-level pages**, use paths like `/roadmap` and `/abridged-app`.
- For external software pages (like TerraNova), use full URLs (for example `https://www.tryterranova.com/`).

The widget uses your per-project `caseStudyUrl` and `related[].url` values exactly as provided.

## Data Schema

The widget reads JSON from:

`<script id="designSystemPortfolioData" type="application/json">...</script>`

Expected shape:

```json
{
  "version": "1.4.0",
  "projects": [
    {
      "id": "website-architecture",
      "name": "McCal Website Architecture",
      "repo": "McCals-Website",
      "privateRepo": false,
      "track": "platform",
      "attribution": {
        "statement": "Contribution note shown in spotlight and modal",
        "role": "Contributor / Team Member",
        "originalRepoUrl": "https://github.com/org/repo",
        "originalRepoLabel": "Original repository"
      },
      "caseStudyUrl": "/portfolio",
      "caseStudyLabel": "Design System Portfolio page",
      "summary": "One-line summary",
      "problem": "Problem statement",
      "process": "How you solved it",
      "result": "What changed after implementation",
      "reflection": "What you learned and what you'd improve next",
      "systemArchitecture": ["Input", "Transform", "Output"],
      "capabilities": ["Systems thinking", "Release engineering"],
      "features": [
        {
          "title": "Feature title",
          "description": "Deep implementation explanation"
        }
      ],
      "screenshots": [
        {
          "src": "https://example.com/screenshot-1.jpg",
          "type": "desktop",
          "alt": "Describe what the screenshot shows",
          "caption": "Explain why this visual matters"
        }
      ],
      "tools": ["Style Dictionary", "GitHub Actions"],
      "outcomes": ["-35% style drift", "+24% delivery speed"]
    }
  ],
  "profile": {
    "about": "Short bio/about me summary",
    "highlights": [
      "Major collaboration or team-membership note",
      "Important context line (for example original repo source)"
    ],
    "languages": [
      {
        "name": "JavaScript",
        "projects": ["website-architecture", "terranova-editor"]
      }
    ]
  },
  "foundations": [
    { "title": "Token Strategy", "detail": "System-level principle" }
  ],
  "workflow": ["Discover", "Model", "Validate", "Ship", "Measure"]
}
```

For your use case, map your core projects to repo names (for example):

- `McCals-Website`
- `TerraNova`
- `mccal-app`

Then update each project object’s `repo` field to match the exact repository name on GitHub.

### Private Repository Pattern

If a project repository is private (for example `abridgd`), keep the project in the dataset and mark it as private:

```json
{
  "id": "abridged-app",
  "repo": "abridgd",
  "privateRepo": true
}
```

Behavior:

- The widget **skips GitHub API sync** for private repos (so no noisy 404/fail churn).
- Portfolio narrative sections (problem/process/architecture/results) still render fully.
- UI surfaces the repository as private in card/spotlight/modal context.
- You can still include `attribution.originalRepoUrl` if you want a canonical source link for users with access.

### No-runtime-API private metadata sync (recommended for private repos)

If you want private-repo signals in the widget **without** calling your API at runtime:

1. Set `GITHUB_PRIVATE_REPO_TOKEN` in your local `.env` (fine-grained PAT with read access to the private repo).
2. Run:
  - `npm run private-meta:export`
3. This updates:
  - `src/data/private-repo-metadata.json`
4. The widget reads that file automatically via `data-private-meta-src` and merges sanitized fields into matching `projects[].repo` entries.

Automation:

- Workflow file: `.github/workflows/private-repo-metadata-sync.yml`
- Required repo secret: `PRIVATE_REPO_METADATA_TOKEN`
- Default target repo in workflow/script: `McCal-Codes/abridgd`

This keeps private tokens out of browser code while still providing refreshed metadata in static widget deployments.

### Interactivity Controls

- **Search**: filters by project name, summary, tools, and outcomes.
- **Track filters**: quickly switch between capability tracks.
- **Open project**: launches a full detail modal for one project.
- **Project page links**: open software/project pages directly from cards, spotlight, and modal.
- **About/language mapping**: uses `profile.languages[].projects` with project IDs to show what languages were used where.
- **Contribution context**: `attribution` appears in spotlight + modal so team contributions and original repos are explicit.

### Case Study Modal Structure

Each project modal now presents an in-depth job/admissions-friendly narrative:

- **Hero screenshot** + caption
- **Capabilities** demonstrated
- **Key features** with implementation explanations
- **Problem** statement
- **Process** and approach
- **System architecture** sequence
- **Result** and measurable outcomes
- **Reflection** and learning

### Connected Systems Mapping

To communicate how projects correlate, add a `related` array per project:

```json
"related": [
  {
    "label": "Abridged App",
    "url": "/abridged",
    "note": "Product-facing layer that uses the same systems conventions"
  },
  {
    "label": "Public Roadmap",
    "url": "/roadmap",
    "note": "Shows delivery progress and milestone transparency"
  }
]
```

If your Squarespace site later adds a Projects folder, just switch these to `/projects/...`.

This is useful for application reviewers because it demonstrates system-level coherence across multiple surfaces.

### Screenshot Guidance

- Add `screenshots[]` per project for your own UI/system visuals.
- If omitted, the widget auto-falls back to a GitHub Open Graph preview image for mapped repos.
- Use captions to explain *why* each screenshot matters (not just what it is).
- Current `v1.4.0` sample data includes repository-hosted assets via jsDelivr (for example Abridgd screenshots in `assets/images/Abridgd App/`) so visuals resolve cleanly in Squarespace embeds.
- PNG screenshots (for example transparent logo assets) automatically get a soft blurred backdrop in spotlight/modal hero views to match the site-logo presentation style.
- Optional screenshot `type` values: `icon`, `desktop`, `phone`.
  - `icon`: transparent/logo-style visuals with blurred backdrop treatment.
  - `desktop`: landscape screenshot presentation.
  - `phone`: portrait/mobile screenshot framing.
- SEO/accessibility tip: write alt text as concise visual descriptions (what is visible and context), avoid keyword stuffing, and keep decorative icons meaningfully labeled.

## Accessibility & Performance Notes

- Uses semantic sectioning and ARIA labels for card collections.
- No blocking external resources or runtime libraries.
- Minimal DOM updates (render-on-filter only).

## Changelog

See `CHANGELOG.md`.
