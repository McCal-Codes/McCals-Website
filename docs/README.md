# McCal's Website Documentation

Welcome to the comprehensive documentation for McCal's Website project. This documentation is organized by category for easy navigation.

## Quick links
- **Onboarding**: [ONBOARDING.md](./ONBOARDING.md)
- **Workspace Standards**: [standards/workspace-organization.md](./standards/workspace-organization.md)
- **UI Patterns**: [standards/ui-patterns.md](./standards/ui-patterns.md)
- **Performance**: [standards/performance-standards.md](./standards/performance-standards.md)
- **Image SEO**: [standards/image-seo-standards.md](./standards/image-seo-standards.md)

## 📁 Directory Structure

### 🔄 **workflows/** - Content & Development Workflows
Step-by-step guides for content creation and management:
- `workflows/portfolio-image-import.md` - How to add new portfolio images
- `journalism-import-workflow.md` - Process for importing journalism content
- `event-portfolio-ingest.md` - Event portfolio content ingestion


### 🔌 **integrations/** - External Services & Platforms
Integration guides and external resource documentation:
- `mcp-memory-server.md` - **MCP Knowledge Graph Memory Server for persistent AI memory**
- `google-reviews-extraction.md` - Google Reviews data extraction
- `google-reviews-integration-options.md` - Integration options for reviews
- `logo-sources.md` - External logo and branding resources
- `squarespace/` - Squarespace-specific integration docs
- `wordpress/` - WordPress integration documentation



### 📏 **standards/** - Coding, Organization & Validation Standards ⭐ **EXPANDED**
Project standards, conventions, and best practices:
- `workspace-organization.md` - **Single source of truth for scripts folder structure, archival, workspace validation, and preflight/afterflight checklists**
- `ui-patterns.md` - UI component patterns and accessibility guidelines
- `accessibility-patterns.md` - Detailed accessibility implementation guide
- `performance-standards.md` - Performance optimization and monitoring
- `seo-testing-guide.md` - Comprehensive SEO testing and validation methods
- `date-naming.md` - File and folder naming conventions
- `widget-to-vite.md` - Migration guide from legacy widgets to Vite
- `security-organization-prompt.md` - Ready-to-use prompt for non-breaking security, organization, and efficiency reviews

### 🧠 **learned/** - Short writeups capturing practical lessons and postmortems
- `manifest-webhook-integration.md` — Lessons learned from automating manifest → API webhook notifications, composite action design, CI secrets guidance and testing tips

### 🚀 **deployment/** - Deployment & Publishing
Deployment guides and hosting setup:
- `DEPLOYMENT.md` - Main deployment documentation
- `DEPLOY-CHEATSHEET.md` - Quick deployment reference
- `PACKAGE-DEPLOYMENT.md` - Package-based deployment
- `SETUP-GITHUB-HOSTING.md` - GitHub Pages hosting setup

### 🛠 **runbooks/** - Operational Playbooks
Runbooks for live launches, incident response, and platform troubleshooting:
- `runbooks/vercel-admin-console.md` - Internal admin app architecture, rollout plan, and guardrails
- `runbooks/vercel-production-launch.md` - Production cutover and rollback workflow
- `runbooks/vercel-deployment-troubleshooting.md` - April 6, 2026 incident lessons, prevention checks, and Vercel CLI fallback flow

### 🗄️ **archive/** - Completed & Historical Documents
Archived documentation and completed project records:
- `widget-unification-todo.md` - Completed widget unification tasks
- `REORGANIZATION-2025-10-04.md` - Repository reorganization log

### 📋 **Root Level Documents**
- `README.md` - This overview document
- `CHANGELOG.md` - Project change history

## 🔍 Quick Find

### AI & Memory
- **MCP Memory Server**: `integrations/mcp-memory-server.md` - Persistent knowledge graph for Claude

### Common Tasks
- **Adding new photos**: `workflows/portfolio-image-import.md`
- **Planning the internal admin app**: `runbooks/vercel-admin-console.md`
- **Deploying changes**: `deployment/DEPLOY-CHEATSHEET.md`
- **File naming**: `standards/date-naming.md`
- **UI development**: `standards/ui-patterns.md`
- **Performance**: `standards/performance-standards.md`
- **Accessibility**: `standards/accessibility-patterns.md`

### Development
- **External integrations**: `integrations/`
- **Deployment setup**: `deployment/`
- **Standards & patterns**: `standards/`

### Reference
- **Project standards**: `standards/`
- **Historical records**: `archive/`
- **Change history**: `CHANGELOG.md`

## 📝 Contributing to Documentation

When adding new documentation:

1. **Choose the right category**:
   - `workflows/` - Step-by-step processes
   - `integrations/` - External service docs
   - `standards/` - Rules and conventions
   - `deployment/` - Deployment and hosting
   - `runbooks/` - Operational procedures
   - `archive/` - Completed or outdated docs

2. **Use descriptive filenames** following the date-naming standards
3. **Update this README** if adding new categories
4. **Cross-reference** related documents when helpful

## 🏗️ Project Architecture

This is a **Vite-based static site** with the following structure:

- **Production**: Static site deployed to GitHub Pages (or Vercel)
- **Development**: Local Vite dev server (`npm run dev`)
- **Components**: React components in `src/components/`
- **Assets**: Images and manifests in `src/images/Portfolios/`
- **Build**: Vite bundles to `dist/` for deployment

For technical details, see the main project README and [ONBOARDING.md](./ONBOARDING.md).

## Versioning Policy

- **Git-based versioning**: All changes tracked via Git commits and tags
- **Component versioning**: Major component updates documented in CHANGELOG.md
- **Site releases**: Tagged releases for major site milestones (v2026.1.0, etc.)
- **Manifest versioning**: Photo manifests use date-based versioning

See [standards/date-naming.md](./standards/date-naming.md) for file naming conventions.
