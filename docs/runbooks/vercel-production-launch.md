# Vercel Production Launch Runbook

This runbook covers the repository-side and dashboard-side work needed to launch `sites/mcc-cal-vite` on Vercel with a controlled cutover.

For the incident-driven troubleshooting checklist created after the April 6, 2026 launch failures, see [vercel-deployment-troubleshooting.md](vercel-deployment-troubleshooting.md).

## Deployment Flow

1. Push to the branch connected to the Vercel project.
2. Confirm the preview deployment is healthy.
3. Verify the custom production domain still points at the intended target.
4. Promote the approved deployment to production from the Vercel dashboard or CLI.
5. Validate the live site:
   - Homepage loads without console errors.
   - `/blog`, `/contact-us`, `/request-a-quote`, and the portfolio routes render correctly.
   - Contact and quote forms submit successfully.
   - `/api/manifests/concert` returns `200` with cache headers.

## Incident Response

### Severity Levels

- `SEV-1`: Site unavailable, broken checkout or lead flow, or a security incident.
- `SEV-2`: Major route or form regression with a workaround.
- `SEV-3`: Cosmetic issue, degraded performance, or non-critical integration failure.

### Escalation Path

1. Incident owner: Caleb McCartney.
2. Platform escalation: the person with Vercel project admin access.
3. DNS escalation: the person with registrar and DNS provider access.
4. Vendor escalation: Vercel support if the issue is platform-side or traffic-related.

### Communication

- Primary internal channel: the project issue tracker or launch thread.
- External update channel: temporary banner, status post, or direct client communication if leads are affected.
- Record every incident with:
  - start time
  - impact
  - current mitigation
  - next owner

## Rollback Strategy

1. Open the Vercel project deployment history.
2. Identify the last known good production deployment.
3. Use Vercel rollback to restore that deployment.
4. Re-test the homepage, forms, and portfolio routes.
5. If the issue is domain or DNS-related, revert DNS only after confirming the deployment is healthy.

Use rollback instead of rebuilding an older commit under pressure when a known-good deployment already exists.

## Zero-Downtime DNS Cutover

1. Add the production domain to the Vercel project before changing nameservers or records.
2. Lower the existing DNS TTL at least 24 hours before the migration window.
3. Confirm all required records in Vercel:
   - apex/root domain
   - `www`
   - preview suffix domain if used
4. Perform the DNS change during a monitored window.
5. Validate:
   - HTTPS certificate issuance
   - apex and `www` resolution
   - preview domain routing
   - redirect behavior

## Production Verification

- `npm run build` completes in `sites/mcc-cal-vite`.
- The production deployment uses the intended framework preset.
- Security headers are present on the production hostname.
- Preview deployments remain `noindex`.
- Vercel Analytics and Speed Insights are enabled.
- Contact and quote endpoints are rate limited and return `Cache-Control: no-store`.
- Manifest endpoints return CDN cache headers.
- Widget routes return immutable cache headers when a specific version is requested.

## Dashboard Checklist

### Required before launch

- Confirm the Vercel project framework is set for the Vite app, not Next.js.
- Attach the production custom domain.
- Enable Deployment Protection for preview environments.
- Configure Firewall rules and bot controls.
- Configure a Log Drain destination.
- Review team roles and remove unnecessary admin access.
- Set spend alerts and usage thresholds.

### Plan-dependent items

- `Pro` or `Enterprise`: enable Observability Plus if available for the project.
- `Enterprise`: review Secure Compute failover, automatic Function failover, SAML SSO, SCIM, Audit Logs, and cookie policy controls.

## Post-Launch Monitoring

Check these during the first 24 hours:

- build or runtime errors in Vercel logs
- Web Vitals and Speed Insights trends
- form submission success rate
- unexpected spikes in Function invocations
- firewall hits and blocked bot traffic
