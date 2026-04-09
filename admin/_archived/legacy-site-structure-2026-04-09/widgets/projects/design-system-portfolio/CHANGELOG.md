# Design System Portfolio Widget Changelog

All notable changes to the Design System Portfolio widget are documented in this file.

## [1.4.1] - 2026-03-05

### Added

- Added no-runtime-API private metadata flow using static JSON from `src/data/private-repo-metadata.json`.
- Added `data-private-meta-src` widget attribute support and client-side merge behavior for private repo evidence.
- Added automation support for private metadata export via:
  - `scripts/utils/export-private-repo-metadata.js`
  - root scripts `private-meta:export` and `private-meta:export:dry`
  - GitHub workflow `.github/workflows/private-repo-metadata-sync.yml`

### Changed

- Initialization order now applies static private metadata first, then runs public GitHub sync for non-private repositories.
- Documentation now includes setup and operations guidance for token-based metadata export without exposing runtime credentials.

## [1.4.0] - 2026-03-05

### Added

- New overview-first dynamic version: `v1.4.0-design-system-portfolio-overview-dynamic.html`.
- Spotlight panel + breathable split layout for fast project scanning.
- Per-case-study project page links via `caseStudyUrl` / `caseStudyLabel`:
  - shown in project cards
  - shown in spotlight actions
  - shown in case-study modal content
- TerraNova case-study links now route to live TerraNova surfaces:
  - `https://www.tryterranova.com/`
  - `https://www.tryterranova.com/templates?category=biome`
- Added profile summary panel (`profile.about`) and language-to-project mapping (`profile.languages`) for recruiter-focused context.
- Added TerraNova contribution attribution fields (`attribution.statement`, `attribution.role`) and original repository source link support (`attribution.originalRepoUrl`).
- Added private repository support (`privateRepo: true` / `repoVisibility: "private"`) so projects can remain in portfolio evidence while being skipped by GitHub API sync.

### Changed

- Prioritized overview + navigation flow before modal deep-dive reading.
- Updated project data shape to support direct project/software destination links.
- Updated default internal links to slug-based routes (`/roadmap`, `/abridged-app`, etc.) so `/projects/*` is optional based on Squarespace IA.
- External connected-system links now open safely in a new tab.
- Added repository-hosted image asset examples (including Abridgd screenshots) to reduce generic Open Graph-only visuals in spotlight/modal views.
- Added screenshot presentation metadata support (`icon`, `desktop`, `phone`) with improved hero formatting and stronger descriptive alt-text examples.
- TerraNova project entries now explicitly describe team contribution context and include a direct original-repository source link in spotlight/modal actions.
- Abridged project mapping now uses repo `abridgd` with private-repo handling and explicit repository-access messaging in the project deep-dive modal.

## [1.3.0] - 2026-03-05

### Added

- New projects-first version: `v1.3.0-design-system-portfolio-project-case-studies.html`.
- In-depth case study modal structure per project:
  - Problem
  - Process
  - System Architecture
  - Result
  - Reflection
- Screenshot gallery per project with selectable shots and keyboard left/right navigation.
- Feature evidence cards in project modals for clearer capability communication.
- Capability tags to better align with hiring and graduate admissions review.
- Connected systems mapping in case-study modals via `related` links/notes (for cross-project coherence).
- Public Roadmap System case study to align Website Architecture + Abridged + Roadmap narratives.

### Changed

- Reframed project browsing from generic project cards to job-ready case-study presentation.
- Set default sort preference to recently updated to surface active work first.

### Retained

- Live GitHub enrichment, repo/homepage links, refresh behavior, and local cache model.

## [1.2.0] - 2026-03-05

### Added

- New interactive widget version: `v1.2.0-design-system-portfolio-interactive.html`.
- Project explorer controls:
  - search by project content (name, summary, tools, outcomes)
  - sorting by stars, last update, or name
- Card-level "Open project" actions to inspect one project at a time.
- Dedicated project detail modal with previous/next navigation across filtered results.
- Extended public widget API helpers:
  - `getFilteredProjectNames()`
  - `openProjectById(id)`

### Retained

- Live GitHub repo enrichment, repo/homepage links, refresh action, and local cache behavior from v1.1.0.

## [1.1.0] - 2026-03-05

### Added

- New dynamic widget version: `v1.1.0-design-system-portfolio-dynamic.html`.
- Live GitHub enrichment for mapped repositories (website, TerraNova, app):
  - stars
  - forks
  - open issues
  - last push date
  - top languages
- Card-level repository links (`GitHub`) and homepage links (`Live`) when available.
- Manual "Refresh GitHub Data" control in the filter toolbar.
- Local cache layer for GitHub responses to reduce repeated API requests.

### Changed

- Updated documentation to set v1.1.0 as the recommended embed version.

## [1.0.0] - 2026-03-05

### Added

- Initial release of a non-photo portfolio widget focused on design-system engineering evidence.
- Structured project cards with:
  - problem statement
  - technical approach
  - architecture overview
  - key decisions + tradeoffs
  - tools and measurable outcomes
- Track filters for `ui`, `infrastructure`, `governance`, and `tooling`.
- System foundations section and workflow timeline for systems-thinking context.
- Architecture map panel for quick top-level topology communication.
- Required fixed version indicator and interactive changelog modal.
- Self-contained implementation compatible with Squarespace Code Blocks.
