# Vercel Pro Deployment Configuration

This document outlines the enhanced deployment management features now enabled for the McCal Media website.

## Current Status

- **Plan**: Vercel Pro
- **Project**: mc-cals-website
- **Team**: mccal-codes
- **Framework**: Vite + React

## 1. Web Analytics (Enabled)

Analytics are already configured in `src/main.tsx`:
- `@vercel/analytics` - Page view tracking
- `@vercel/speed-insights` - Performance monitoring

### Dashboard Access
View analytics at: https://vercel.com/mccal/mc-cals-website/analytics

## 2. Deployment Protection (Recommended)

### Password Protection for Preview Deployments
1. Go to: https://vercel.com/mccal/mc-cals-website/settings/deployment-protection
2. Enable **Password Protection** for preview deployments
3. Set a password for team members to access previews

### SSO/SAML Protection (Enterprise)
If you upgrade to Enterprise, you can enable SAML-based authentication for deployment access.

## 3. Deployment Management Features

### Instant Rollback
- Any deployment marked as `isRollbackCandidate: true` can be instantly rolled back to production
- Current rollback candidates visible in deployment list

### Deployment Retention
- Pro plan includes extended deployment retention
- Failed deployments are retained for debugging

### Build Configuration
Build settings are optimized in `vite.config.ts`:
- Bundle analyzer available via `npm run analyze`
- Source maps enabled for debugging
- Asset optimization configured

## 4. Environment Variables

Required environment variables for full functionality:

```bash
# Vercel Analytics (auto-injected by Vercel)
VERCEL_ENV=production
VERCEL_URL=https://www.mcc-cal.com

# KV Storage (if using)
KV_URL=
KV_REST_API_URL=
KV_REST_API_TOKEN=
KV_REST_API_READ_ONLY_TOKEN=
```

## 5. Collaboration Features

### Team Access
- Pro includes unlimited **Viewer seats** (free)
- Invite team members: https://vercel.com/teams/mccal/settings/members

### Slack Integration
```
/vercel subscribe mccal/mc-cals-website
```

## 6. Monitoring & Alerts

### Recent Deployment Issues
Recent error states detected. Monitor build logs at:
https://vercel.com/mccal/mc-cals-website/deployments

### Common Build Issues
1. **Manifest validation failures** - Run `npm run validate:manifests` locally
2. **Missing dependencies** - Ensure all deps installed in `sites/mcc-cal-vite/`
3. **Path issues** - Check portfolio image paths in manifests

## Quick Commands

```bash
# Validate manifests before build
npm run validate:manifests

# Sync manifests
node scripts/sync-manifests.js

# Build locally (matches Vercel)
npm run build

# Analyze bundle size
npm run analyze
```

## Next Steps

1. [ ] Enable password protection for previews (Dashboard)
2. [ ] Invite team members as Viewers
3. [ ] Configure Slack notifications
4. [ ] Review analytics dashboard after next deployment
