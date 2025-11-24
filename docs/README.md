# McCal's Website Documentation

Welcome to the comprehensive documentation for McCal's Website project. This documentation is organized by category for easy navigation.

## 📁 Directory Structure

### 🔄 **workflows/** - Content & Development Workflows
Step-by-step guides for content creation and management:
- `workflows/portfolio-image-import.md` - How to add new portfolio images
- `journalism-import-workflow.md` - Process for importing journalism content
- `event-portfolio-ingest.md` - Event portfolio content ingestion

### 🤖 **automation/** - Automated Processes
Documentation for automated systems and scripts:
- `CONCERT-AUTO-READER.md` - Concert photo organization automation

### 🔌 **integrations/** - External Services & Platforms
Integration guides and external resource documentation:
- `google-reviews-extraction.md` - Google Reviews data extraction
- `google-reviews-integration-options.md` - Integration options for reviews
- `logo-sources.md` - External logo and branding resources
- `squarespace/` - Squarespace-specific integration docs
- `wordpress/` - WordPress integration documentation



### 📏 **standards/** - Coding, Organization & Validation Standards ⭐ **EXPANDED**
Project standards, conventions, and versioning:
- `workspace-organization.md` - **Single source of truth for scripts folder structure, archival, workspace validation, and preflight/afterflight checklists**
- `widget-reference.md` - Quick reference for widget development
- `widget-standards.md` - Comprehensive widget standards guide
- `widget-development.md` - Systematic enhancement methodology
- `seo-testing-guide.md` - Comprehensive SEO testing and validation methods
- `date-naming.md` - File and folder naming conventions
- `versioning.md` - Project versioning guidelines

### 🧠 **learned/** - Short writeups capturing practical lessons and postmortems
- `manifest-webhook-integration.md` — Lessons learned from automating manifest → API webhook notifications, composite action design, CI secrets guidance and testing tips

### 🚀 **deployment/** - Deployment & Publishing
Deployment guides and hosting setup:
- `DEPLOYMENT.md` - Main deployment documentation
- `DEPLOY-CHEATSHEET.md` - Quick deployment reference
- `PACKAGE-DEPLOYMENT.md` - Package-based deployment
- `SETUP-GITHUB-HOSTING.md` - GitHub Pages hosting setup

### 🗄️ **archive/** - Completed & Historical Documents
Archived documentation and completed project records:
- `widget-unification-todo.md` - Completed widget unification tasks
- `REORGANIZATION-2025-10-04.md` - Repository reorganization log

### 📋 **Root Level Documents**
- `README.md` - This overview document
- `CHANGELOG.md` - Project change history

## 🔍 Quick Find

### Common Tasks
- **Adding new photos**: `workflows/portfolio-image-import.md`
- **Deploying changes**: `deployment/DEPLOY-CHEATSHEET.md`
- **File naming**: `standards/date-naming.md`
- **Version updates**: `standards/versioning.md`
- **Widget development**: `standards/widget-reference.md` ⭐
- **Widget enhancement**: `standards/widget-standards.md` and `standards/widget-development.md`

### Development
- **Automation scripts**: `automation/`
- **External integrations**: `integrations/`
- **Deployment setup**: `deployment/`

### Reference
- **Project standards**: `standards/`
- **Historical records**: `archive/`
- **Change history**: `CHANGELOG.md`

## 📝 Contributing to Documentation

When adding new documentation:

1. **Choose the right category**:
   - `workflows/` - Step-by-step processes
   - `automation/` - Script and automation docs
   - `integrations/` - External service docs
   - `standards/` - Rules and conventions
   - `deployment/` - Deployment and hosting
   - `archive/` - Completed or outdated docs

2. **Use descriptive filenames** following the date-naming standards
3. **Update this README** if adding new categories
4. **Cross-reference** related documents when helpful

## 🏗️ Project Architecture

This is a Squarespace widget development workspace where:
- **Production**: Squarespace site embeds versioned widget HTML from `src/widgets/`
- **Development**: Local test harness in `src/site/` 
- **Pipeline**: Photo assets → manifest generation → self-contained HTML widgets

For technical details, see the main project README and individual widget documentation.
2. Add images and optional `manifest.json`:
   ```json
   {
     "date": "2025-09-16",
     "images": ["photo1.jpg", "photo2.jpg"]
   }
   ```
3. Push to main branch

## Versioning Policy
- **Major** (vN.0): Significant features/visual changes → new major version file
- **Minor** (vN.M): Small tweaks → increment by 0.1
- Each widget maintains its own CHANGELOG.md
- Repository-level changes tracked in root CHANGELOG.md


