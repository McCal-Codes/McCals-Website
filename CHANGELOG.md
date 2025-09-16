# Changelog — McCal Media Repository

This changelog tracks repository-level changes. Individual widgets maintain their own changelogs.

## 2025-09-16 — Repository Merge & Reorganization
- **MAJOR**: Merged McCals Site development workspace into McCals-Website repository
- Combined production website and development tools into unified repository
- Added comprehensive README covering both website and development aspects
- Integrated development structure:
  - `widgets/`: Reusable web widgets with versioning
  - `sites/`: Platform-specific setup documentation
  - `notes/`: Development history and living documentation
- Maintained existing production site structure (`site/`, `images/`, `.github/`)
- Cleaned up duplicate files and .DS_Store artifacts
- Established unified versioning policy across repository

### Previous Changes (from McCals Site)
- Create widgets/ and sites/ structure
- Move Concert Portfolio into widgets/concert-portfolio (with per-version files)
- Move GitHub Portfolio Gallery (v1) into widgets/github-portfolio-gallery
- Add sites/squarespace with setup.md
- Seed per-widget changelogs and READMEs
