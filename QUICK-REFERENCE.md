# Quick Reference - New Developer Tools

## 🚀 Quick Start Commands

```bash
# Start development (with manifest generation)
npm run quick:start

# Start API server
npm run quick:api

# Start everything (site + API concurrently)
npm run quick:full
```

## 🔍 Environment & Validation

```bash
# Check Node version and environment
npm run env:check

# Validate environment variables
npm run env:validate

# Check API health
npm run api:health
```

## 📊 Repository Insights

```bash
# Widget statistics (versions, sizes, docs)
npm run stats:widgets

# Repository statistics
npm run stats:repo

# Repository health check
npm run repo:health
```

## 🐳 Docker Commands

```bash
# Build API image (multi-stage, optimized)
npm run docker:build:api

# Run API container with .env
npm run docker:run:api

# View container logs
npm run docker:logs:api

# Stop all containers
npm run docker:stop:all

# Clean Docker system
npm run docker:clean
```

## 📦 Dependencies & Security

```bash
# Check for outdated packages
npm run deps:check

# Update minor versions
npm run deps:update:minor

# Run security audit
npm run security:check

# Fix security issues
npm run deps:audit:fix
```

## 🧹 Maintenance

```bash
# Clean build artifacts and logs
npm run clean

# Clear npm cache
npm run cache:clear

# Backup manifests
npm run backup:manifests

# Pre-commit checks (lint + test + validate)
npm run precommit:check
```

## 📚 Documentation

- **Environment Setup**: `docs/ENVIRONMENT-SETUP.md`
- **NPM Scripts Reference**: `docs/NPM-SCRIPTS.md`
- **Efficiency Improvements**: `updates/efficiency-improvements-2025-12-04.md`

## 🔑 Environment Variables

Copy template and configure:

```bash
cp .env.example .env
# Edit .env with your values
npm run env:validate
```

### Required Variables (Development)

```env
NODE_ENV=development
PORT=3000
API_PORT=3001
```

### Required Variables (Production)

```env
NODE_ENV=production
PORT=3000
API_PORT=3001
MANIFEST_BASE_URL=https://your-cdn.com
ALLOWED_ORIGINS=https://mcc-cal.com,https://api.mcc-cal.com
BLOG_JWT_SECRET=<strong-random-secret>
WEBHOOK_SECRET=<strong-random-secret>
```

Generate secure secrets:

```bash
openssl rand -hex 32
# or
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 🎯 Common Workflows

### Development Workflow

```bash
npm run env:validate    # Check environment
npm run quick:start     # Start development
# Make changes...
npm run precommit:check # Before committing
```

### Docker Workflow

```bash
npm run docker:build:api  # Build image
npm run docker:run:api    # Run container
npm run docker:logs:api   # Check logs
npm run docker:stop:all   # Stop when done
```

### Maintenance Workflow

```bash
npm run repo:health       # Check repository
npm run deps:check        # Check dependencies
npm run security:check    # Run security audit
npm run clean             # Clean up
```

## 🆘 Troubleshooting

### Port Already in Use

```bash
# Change PORT in .env
echo "PORT=3002" >> .env

# Or kill process on port
lsof -ti:3000 | xargs kill -9
```

### Environment Issues

```bash
# Validate environment
npm run env:validate

# Check Node version
npm run env:check

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Docker Issues

```bash
# Clean Docker system
npm run docker:clean

# Rebuild without cache
docker build --no-cache -f Dockerfile.api -t mccal-api:latest .
```

## 📈 Key Improvements

- **Docker**: 70% smaller images (500MB → 150MB)
- **Scripts**: 20+ new utility commands
- **Docs**: 1,500+ lines of new documentation
- **Security**: Environment validation + Docker hardening
- **DX**: Quick-start commands + comprehensive tooling

---

**Full Documentation**: See `docs/` folder for complete guides
**Report Issues**: Open GitHub issue or contact: contact@mcc-cal.com

Last updated: December 4, 2025
