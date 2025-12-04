# NPM Scripts Reference

Complete reference for all available npm scripts organized by category.

## Table of Contents

- [Quick Commands](#quick-commands)
- [Development](#development)
- [API Management](#api-management)
- [Manifest Generation](#manifest-generation)
- [Building & Deployment](#building--deployment)
- [Docker Commands](#docker-commands)
- [Testing & Validation](#testing--validation)
- [Maintenance & Utilities](#maintenance--utilities)
- [Git & Version Control](#git--version-control)

---

## Quick Commands

Essential commands for everyday development:

```bash
# Start development (manifests + dev server)
npm run quick:start

# Start API only
npm run quick:api

# Start everything (site + API)
npm run quick:full

# Check environment
npm run env:check

# Validate environment variables
npm run env:validate
```

---

## Development

### Development Servers

```bash
# Start development server
npm run dev

# Serve static site files
npm run serve:site

# Development with API
npm run dev:with-api

# Full development stack (site + API + watchers)
npm run dev:full

# Auto-manifest watching
npm run dev:auto
```

### Live Watching

```bash
# Watch all portfolios for changes
npm run watch:auto-manifest

# Watch specific portfolio types
npm run watch:auto-manifest:concert
npm run watch:auto-manifest:events
npm run watch:auto-manifest:journalism
npm run watch:auto-manifest:nature
npm run watch:auto-manifest:portrait
npm run watch:auto-manifest:all
```

---

## API Management

### API Server

```bash
# Start API server
npm run api:start

# Start API with auto-restart (development)
npm run api:dev

# Setup API development environment
npm run api:setup-dev

# Check API health
npm run api:health

# Test API (curl)
npm run api:test
```

### API Cache Management

```bash
# Invalidate all caches
npm run api:refresh

# Refresh specific portfolio caches
npm run api:refresh:concert
npm run api:refresh:events
npm run api:refresh:journalism
```

### API Demo

```bash
# Run SEO demo with API
npm run api:demo-seo
```

---

## Manifest Generation

### Generate Manifests

```bash
# Generate all manifests
npm run manifest:generate

# Generate with dry-run (preview)
npm run manifest:dry-run

# Generate specific portfolio types
npm run manifest:concert
npm run manifest:events
npm run manifest:journalism
npm run manifest:nature
npm run manifest:portrait
npm run manifest:universal
npm run manifest:featured
```

### Manifest Utilities

```bash
# Generate fallback manifests
npm run manifest:fallback

# Upload manifests to S3
npm run upload:s3

# Update manifests with CDN URLs
npm run manifest:update-cdn

# Backup manifests
npm run backup:manifests

# List available backups
npm run restore:manifests
```

---

## Building & Deployment

### Build Commands

```bash
# Build site
npm run build

# Build with manifest generation (prebuild hook)
npm run build

# Build optimized
npm run build:optimized

# Build concert portfolio
npm run build:concert

# Build universal portfolio
npm run build:universal

# Build thesis interactive
npm run build:thesis
```

### Site Export

```bash
# Export Next.js site
npm run site:export
```

### SEO Generation

```bash
# Generate sitemap
npm run seo:sitemap

# Generate structured data
npm run seo:schema

# Generate all SEO files
npm run seo:all
```

---

## Docker Commands

### Building Images

```bash
# Build API Docker image
npm run docker:build:api

# Build main site (legacy)
npm run docker:build
```

### Running Containers

```bash
# Run API container
npm run docker:run:api

# Run main site container (legacy)
npm run docker:run

# Deploy container (legacy)
npm run docker:deploy
```

### Docker Management

```bash
# View API container logs
npm run docker:logs:api

# Stop all containers
npm run docker:stop:all

# Clean Docker system
npm run docker:clean
```

---

## Testing & Validation

### Testing

```bash
# Run all tests
npm run test

# Run accessibility tests
npm run test:a11y

# Validate widgets HTML
npm run validate:widgets
```

### Linting

```bash
# Lint scripts folder
npm run lint:scripts

# Lint all JavaScript
npm run lint
```

### Environment Validation

```bash
# Check Node.js version and environment
npm run env:check

# Validate environment variables
npm run env:validate
```

### Repository Health

```bash
# Run repository health check
npm run repo:health

# Analyze large files
npm run analyze:large-files

# Find duplicate files
npm run analyze:duplicates
```

### Security

```bash
# Security audit
npm run security:check

# npm audit
npm audit

# Audit with auto-fix
npm run deps:audit:fix

# Pre-commit checks
npm run precommit:check
```

---

## Maintenance & Utilities

### Cleaning

```bash
# Clean build artifacts and logs
npm run clean

# Clean npm cache
npm run cache:clear

# Clean git working directory (careful!)
npm run git:clean
```

### Organization

```bash
# Organize concert folders
npm run organize:concerts

# Preview organization (dry-run)
npm run organize:preview

# Organize concert folder structure
npm run organize:folders

# Preview folder organization
npm run organize:folders-preview
```

### Dependencies

```bash
# Check for outdated packages
npm run deps:check

# Update minor versions
npm run deps:update:minor

# Audit and fix security issues
npm run deps:audit:fix
```

### Statistics & Analysis

```bash
# View repository statistics
npm run stats:repo

# View widget statistics
npm run stats:widgets

# Scan widget versions
npm run scan:widget-versions
```

### Widget Utilities

```bash
# Build site widgets
npm run site-widgets:build

# Prepare widget release
npm run site-widgets:prepare-release

# Audit widget READMEs
npm run audit:widget-readmes

# Audit dark mode support
npm run audit:dark-mode
```

### Modernization

```bash
# Modernize JavaScript (dry-run)
npm run modernize:js:dry

# Modernize with verbose output
npm run modernize:js:verbose

# Modernize specific widget
npm run modernize:js:widget

# Apply modernization
npm run modernize:js
```

### Accessibility

```bash
# Audit accessibility (dry-run)
npm run audit:a11y

# Fix accessibility issues
npm run fix:a11y
```

### Image Optimization

```bash
# Optimize events images
npm run optimize:events

# Generate WebP versions
npm run optimize:events:webp
```

### Version Management

```bash
# Standardize version format
npm run versions:standardize

# Check versions (dry-run)
npm run versions:check

# Rename version files
npm run versions:rename

# Check rename operations (dry-run)
npm run versions:rename-check
```

---

## Git & Version Control

### Git Utilities

```bash
# Git status (short format)
npm run "Git: Status" (via VS Code tasks)

# Quick commit
npm run "Git: Quick Commit" (via VS Code tasks)

# Clean git working directory
npm run git:clean
```

### LFS Migration

```bash
# Generate LFS migration plan
npm run generate-lfs-plan

# Migrate to Git LFS
npm run migrate-to-git-lfs
```

---

## AI & Automation

### AI Tools

```bash
# Run AI preflight check
npm run ai:preflight

# Quick preflight (short version)
npm run ai:preflight:short

# Preflight with JSON output
npm run ai:preflight:json

# Finalize AI session
npm run ai:finalize
```

### CI Simulation

```bash
# Simulate CI environment
npm run ci:simulate

# Simulate with sample changes
npm run ci:simulate:sample1
npm run ci:simulate:sample2
```

### CI Utilities

```bash
# Validate CI scripts
npm run ci:validate-scripts

# Find duplicate scripts
npm run ci:find-duplicates

# Archive duplicate scripts
npm run ci:archive-duplicates

# Run smoke tests
npm run ci:smoke-test
```

---

## Special Commands

### Setup & Welcome

```bash
# Run setup script
npm run setup

# Show welcome message
npm run welcome

# Open welcome document
npm run welcome:open

# Post-install hook (runs automatically)
npm run postinstall
```

### Blog Generation

```bash
# Generate blog feed
npm run blog:generate
```

### Admin Tools

```bash
# Run admin import backend
npm run admin:backend
```

### Package Management

```bash
# Create package tarball
npm run package
```

---

## Usage Examples

### Typical Development Workflow

```bash
# 1. Check environment
npm run env:validate

# 2. Start development
npm run quick:start

# 3. In another terminal, watch for changes
npm run watch:auto-manifest

# 4. Make changes, test locally

# 5. Before committing
npm run precommit:check
```

### API Development Workflow

```bash
# 1. Setup API environment
npm run api:setup-dev

# 2. Start API with auto-restart
npm run api:dev

# 3. In another terminal, test API
npm run api:health

# 4. Refresh caches as needed
npm run api:refresh
```

### Docker Workflow

```bash
# 1. Build image
npm run docker:build:api

# 2. Run container
npm run docker:run:api

# 3. Check logs
npm run docker:logs:api

# 4. When done, stop containers
npm run docker:stop:all
```

### Maintenance Workflow

```bash
# 1. Check repository health
npm run repo:health

# 2. Update dependencies
npm run deps:check
npm run deps:update:minor

# 3. Run security audit
npm run security:check

# 4. Clean up
npm run clean
npm run cache:clear
```

---

## Tips & Best Practices

### Performance Tips

- Use `npm run quick:*` commands for common workflows
- Run `npm run cache:clear` if builds seem stale
- Use `--dry-run` flags to preview operations safely

### Security Tips

- Always run `npm run env:validate` before deployment
- Never commit `.env` files (they're gitignored)
- Use `npm run security:check` regularly
- Update secrets before production deployment

### Development Tips

- Use watchers (`npm run watch:*`) to auto-regenerate during development
- Run `npm run precommit:check` before pushing
- Check `npm run stats:widgets` to track widget growth
- Use `npm run ai:preflight:short` before AI-assisted work

---

## Troubleshooting

### Scripts Not Working?

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Clear cache
npm run cache:clear

# Check Node version
npm run env:check
```

### Port Already in Use?

```bash
# Change PORT in .env
echo "PORT=3002" >> .env

# Or kill process on port
lsof -ti:3000 | xargs kill -9
```

### Need Help?

```bash
# View available scripts
npm run

# Check specific script
npm run <script-name> -- --help
```

---

Last updated: December 2025
