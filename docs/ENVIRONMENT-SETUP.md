# Environment Setup Guide

Complete guide for setting up and configuring your McCal Media development and production environments.

## Table of Contents

- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Development Setup](#development-setup)
- [Production Setup](#production-setup)
- [Docker Setup](#docker-setup)
- [Common Issues](#common-issues)

## Quick Start

### 1. Prerequisites

- Node.js 18.20.0 or higher (use `.nvmrc` file)
- npm 8.0.0 or higher
- Docker (optional, for containerized deployment)

```bash
# Check your Node.js version
node --version

# If using nvm (recommended)
nvm use
```

### 2. Initial Setup

```bash
# Clone the repository
git clone https://github.com/McCal-Codes/McCals-Website.git
cd McCals-Website

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your configuration
# (See Environment Variables section below)

# Validate your environment
npm run env:validate

# Start development server
npm run quick:start
```

## Environment Variables

### Required Variables (Development)

Create a `.env` file in the project root with these minimum variables:

```bash
NODE_ENV=development
PORT=3000
API_PORT=3001
```

### Required Variables (Production)

Production environments require additional security configuration:

```bash
NODE_ENV=production
PORT=3000
API_PORT=3001
MANIFEST_BASE_URL=https://McCal-Codes.github.io/McCals-Website/src/images/Portfolios
ALLOWED_ORIGINS=https://mcc-cal.com,https://api.mcc-cal.com
BLOG_JWT_SECRET=<strong-random-secret>
WEBHOOK_SECRET=<strong-random-secret>
```

### Optional Variables

See `.env.example` for complete list of optional configuration options including:

- **Caching**: Redis URL for distributed caching
- **Monitoring**: Sentry DSN, Google Analytics
- **External Services**: Mailchimp, Cloudflare, AWS
- **Security**: Rate limiting, CORS configuration

### Generating Secure Secrets

```bash
# Generate random secret (macOS/Linux)
openssl rand -hex 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Development Setup

### Standard Development Workflow

```bash
# Start development server with auto-manifest generation
npm run quick:start

# Or start with API server
npm run quick:full

# Watch for manifest changes
npm run watch:auto-manifest
```

### Development with API

```bash
# Setup API development environment
npm run api:setup-dev

# Start API server only
npm run api:dev

# Run site and API concurrently
npm run dev:full
```

### Useful Development Commands

```bash
# Check environment
npm run env:check

# Validate environment variables
npm run env:validate

# Check API health
npm run api:health

# Run repository health check
npm run repo:health

# View widget statistics
npm run stats:widgets
```

## Production Setup

### Environment Preparation

1. **Set Production Environment Variables**

```bash
# Copy example and edit
cp .env.example .env.production

# Set NODE_ENV
NODE_ENV=production

# Set strong secrets (IMPORTANT!)
BLOG_JWT_SECRET=$(openssl rand -hex 32)
WEBHOOK_SECRET=$(openssl rand -hex 32)
SESSION_SECRET=$(openssl rand -hex 32)
```

2. **Validate Configuration**

```bash
NODE_ENV=production npm run env:validate
```

3. **Build Production Assets**

```bash
# Generate all manifests
npm run manifest:generate

# Build optimized site
npm run build:optimized

# Run SEO generation
npm run seo:all
```

### API Deployment

#### Cloudflare Workers

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy to Cloudflare Workers
cd src/api/src
wrangler publish
```

#### Docker Deployment

```bash
# Build production Docker image
npm run docker:build:api

# Run with environment file
npm run docker:run:api

# Or use docker-compose
docker-compose up -d api
```

## Docker Setup

### Building Docker Images

```bash
# Build API image
npm run docker:build:api

# Build with custom tag
docker build -f Dockerfile.api -t mccal-api:v1.0.0 .
```

### Running Containers

```bash
# Run API container
npm run docker:run:api

# Run with custom environment
docker run -p 3001:3001 \
  -e NODE_ENV=production \
  -e MANIFEST_BASE_URL=https://your-cdn.com \
  mccal-api:latest

# View logs
npm run docker:logs:api
```

### Docker Compose

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f api
```

### Docker Cleanup

```bash
# Stop all containers
npm run docker:stop:all

# Clean up Docker system
npm run docker:clean
```

## Common Issues

### Issue: "Missing required environment variables"

**Solution**: Copy `.env.example` to `.env` and configure required variables

```bash
cp .env.example .env
npm run env:validate
```

### Issue: "Port already in use"

**Solution**: Change port in `.env` or kill process using the port

```bash
# Find process on port 3000
lsof -ti:3000

# Kill the process
kill -9 $(lsof -ti:3000)

# Or change PORT in .env
PORT=3002
```

### Issue: "Cannot connect to API"

**Solution**: Ensure API server is running and CORS is configured

```bash
# Check API health
npm run api:health

# Check API port
lsof -ti:3001

# Verify ALLOWED_ORIGINS in .env includes your domain
```

### Issue: "Manifest generation fails"

**Solution**: Verify image directory structure and permissions

```bash
# Check directory structure
ls -la src/images/Portfolios/

# Try dry run to see what would happen
npm run manifest:dry-run

# Force regenerate all manifests
npm run manifest:generate
```

### Issue: "Docker build fails"

**Solution**: Clean Docker cache and rebuild

```bash
# Clean Docker system
npm run docker:clean

# Rebuild without cache
docker build --no-cache -f Dockerfile.api -t mccal-api:latest .
```

### Issue: "Node version mismatch"

**Solution**: Use the correct Node.js version specified in `.nvmrc`

```bash
# Install nvm if not installed
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Use correct version
nvm use

# Or install the version
nvm install
```

## Additional Resources

- [Repository Health Check](./docs/standards/workspace-organization.md)
- [Widget Development Guide](./docs/standards/widget-development.md)
- [API Documentation](./src/api/README.md)
- [Docker Configuration](./Dockerfile.api)

## Support

For issues or questions:

1. Check [Common Issues](#common-issues) section above
2. Review [docs/](./docs/) for detailed documentation
3. Open an issue on GitHub
4. Contact: contact@mcc-cal.com

---

Last updated: December 2025
