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

## 2026 Site Health Additions

### Already wired in the repo
- **Speed Insights**: Enabled only in Vercel preview and production runtimes so local production previews do not log `/_vercel/speed-insights/script.js` 404 noise.
- **Image Optimization**: Vercel Image Optimization is configured for `/assets`, `/images`, `/about`, and `/content/blog-static` assets. Blog lead/card images and the About portrait should route through `/_vercel/image` in Vercel preview and production.
- **Performance budgets**: Run `npm run perf:budget` after starting `npm run preview -- --host 127.0.0.1 --port 4173` from `sites/mcc-cal-vite`. To check a deployed URL, run `PERFORMANCE_BASE_URL=https://www.mcc-cal.com npm run perf:budget`.

### Dashboard / Vercel settings to review
- **Vercel Toolbar for previews**: Enable for preview deployments and use its layout shift, interaction timing, and accessibility tools during visual QA.
- **Observability**: Monitor Function latency and errors for `/api/contact`, `/api/quote`, `/api/schedule/*`, `/api/podcast-feed`, `/api/testimonials`, and `/api/manifests/*`.
- **Firewall / WAF**: Add managed rules and rate-limit rules for write-heavy endpoints, especially contact, quote, and booking APIs.
- **Deployment Protection**: Protect preview deployments before client review or major content changes.
- **Skew Protection**: Confirm it is enabled for the project so clients do not keep stale JavaScript across deployments.
- **Cron Jobs**: Consider a later cache-warming or smoke-check cron for podcast, manifest, and scheduling endpoints.
