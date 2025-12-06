# Performance Monitoring Guide

Comprehensive monitoring system for api.mcc-cal.com Cloudflare Worker API.

## Overview

The monitoring system provides real-time health checks, cache performance analysis, and operational insights for the McCal Media API infrastructure.

## Tools & Scripts

### 1. API Health Check (`scripts/utils/health-check.js`)

**Purpose:** Monitor endpoint availability and response times

**Usage:**
```bash
# Check all endpoints
node scripts/utils/health-check.js

# JSON output for automation
node scripts/utils/health-check.js --json

# Check specific endpoint
node scripts/utils/health-check.js --endpoint=/api/v1/manifests/concert
```

**Output:**
```
🏥 API Health Check

API Base: https://api.mcc-cal.com
Time: 2025-12-06T12:00:00.000Z

Checking Health Check... ✅ 200 (45ms)
Checking Concert Manifest... ✅ 200 (123ms) [CACHED]
Checking Events Manifest... ✅ 200 (98ms) [CACHED]
Checking Journalism Manifest... ✅ 200 (110ms) [CACHED]
Checking Blog Posts... ✅ 200 (87ms) [CACHED]

📊 Summary:
  Total: 5
  Passed: 5
  Failed: 0
  Avg Duration: 92ms
  Cache Hit Rate: 100%
```

**Automated Monitoring:**
```bash
# Add to cron for continuous monitoring
*/5 * * * * cd /path/to/project && node scripts/utils/health-check.js --json >> logs/health-check.log 2>&1
```

### 2. Cache Performance Analyzer (`scripts/utils/cache-analyzer.js`)

**Purpose:** Analyze cache hit rates and performance optimization

**Usage:**
```bash
# Analyze all endpoints (5 iterations each)
node scripts/utils/cache-analyzer.js

# More iterations for accuracy
node scripts/utils/cache-analyzer.js --iterations=20

# Analyze specific endpoint
node scripts/utils/cache-analyzer.js --endpoint=/api/v1/manifests/concert
```

**Output:**
```
🔍 Cache Performance Analysis

API Base: https://api.mcc-cal.com
Iterations: 5
Time: 2025-12-06T12:00:00.000Z

📊 Analyzing: Concert Manifest
   Endpoint: /api/v1/manifests/concert
   Expected TTL: 600s

   Request 1/5: ⚠️  MISS - 234ms (age: 0s)
   Request 2/5: ✅ HIT - 45ms (age: 1s)
   Request 3/5: ✅ HIT - 42ms (age: 2s)
   Request 4/5: ✅ HIT - 43ms (age: 3s)
   Request 5/5: ✅ HIT - 44ms (age: 4s)

   📈 Statistics:
      Cache Hits: 4/5 (80%)
      Avg Duration: 81ms
      Avg Hit Duration: 43ms
      Avg Miss Duration: 234ms
      Min/Max: 42ms / 234ms

═══════════════════════════════════════
📊 OVERALL SUMMARY
═══════════════════════════════════════

🟢 Concert Manifest
   Hit Rate: 80% | Avg: 81ms
🟢 Events Manifest
   Hit Rate: 85% | Avg: 75ms
🟢 Journalism Manifest
   Hit Rate: 90% | Avg: 68ms
🟢 Blog Posts
   Hit Rate: 75% | Avg: 92ms

🎯 Overall Cache Hit Rate: 82%
   ✅ Excellent! Cache is performing well.
```

## NPM Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "health:check": "node scripts/utils/health-check.js",
    "health:json": "node scripts/utils/health-check.js --json",
    "cache:analyze": "node scripts/utils/cache-analyzer.js",
    "cache:analyze:deep": "node scripts/utils/cache-analyzer.js --iterations=20",
    "monitor:all": "npm run health:check && npm run cache:analyze"
  }
}
```

## Cloudflare Analytics

### Accessing Cloudflare Dashboard

1. Login to Cloudflare: https://dash.cloudflare.com
2. Navigate to **Workers & Pages**
3. Select your Worker (e.g., `mccal-api`)
4. Click **Metrics** tab

### Key Metrics

**Requests:**
- Total requests per day/week/month
- Requests by country/region
- Top requesting IPs

**Performance:**
- Median execution time
- 95th percentile latency
- Error rate

**Cache:**
- Cache hit ratio
- Bandwidth saved
- Origin requests avoided

### Real-Time Logs

View live Worker logs:
```bash
cd tools/cloudflare
npx wrangler tail

# Filter for specific endpoint
npx wrangler tail --format pretty | grep "/api/v1/manifests"

# Filter for errors
npx wrangler tail --status error
```

## Performance Targets

### Response Times
- **Health Check**: < 100ms
- **Cached Manifests**: < 150ms
- **Uncached Manifests**: < 500ms
- **Blog Posts (KV)**: < 200ms

### Cache Hit Rates
- **Manifests**: > 80% (10-minute TTL)
- **Blog Posts**: > 70% (5-minute TTL)
- **Overall**: > 75%

### Availability
- **Uptime**: > 99.9%
- **Error Rate**: < 0.1%

## Alerting

### GitHub Actions Health Check

Create `.github/workflows/api-health-check.yml`:

```yaml
name: API Health Check

on:
  schedule:
    - cron: '*/30 * * * *'  # Every 30 minutes
  workflow_dispatch:

jobs:
  health:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
      
      - name: Run Health Check
        run: |
          node scripts/utils/health-check.js --json > health-result.json
          
      - name: Check for Failures
        run: |
          FAILED=$(cat health-result.json | jq '.summary.failed')
          if [ "$FAILED" -gt 0 ]; then
            echo "❌ $FAILED endpoints failed health check"
            cat health-result.json | jq '.endpoints[] | select(.success == false)'
            exit 1
          fi
          echo "✅ All endpoints healthy"
      
      - name: Notify on Failure
        if: failure()
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: '🚨 API Health Check Failed',
              body: 'One or more API endpoints are failing. Check workflow logs for details.',
              labels: ['bug', 'api', 'monitoring']
            });
```

### Uptime Monitoring Services

Consider integrating with:

- **UptimeRobot**: Free tier for 50 monitors
- **Pingdom**: Enterprise monitoring
- **Healthchecks.io**: Dead man's switch monitoring
- **Better Uptime**: Status pages + monitoring

Example UptimeRobot setup:
1. Add monitor for `https://api.mcc-cal.com/health`
2. Set interval to 5 minutes
3. Configure alerts (email, SMS, Slack)
4. Add public status page

## Troubleshooting

### High Cache Miss Rate

**Symptoms:**
- Cache hit rate < 50%
- Slow response times
- High origin requests

**Causes:**
1. TTL too short
2. Cache purging too frequently
3. Query strings varying
4. Headers preventing caching

**Solutions:**
```bash
# Check cache headers
curl -I https://api.mcc-cal.com/api/v1/manifests/concert

# Should see:
# Cache-Control: public, max-age=600, stale-while-revalidate=3600
# X-Cache: HIT

# If X-Cache: MISS, check Worker cache logic
npx wrangler tail | grep "cache"
```

### Slow Response Times

**Symptoms:**
- Avg duration > 500ms
- Timeout errors
- User complaints

**Solutions:**
```bash
# Analyze performance
node scripts/utils/cache-analyzer.js --iterations=20

# Check Cloudflare metrics
npx wrangler tail --format pretty

# Review Worker logs for bottlenecks
```

### High Error Rate

**Symptoms:**
- 4XX or 5XX responses
- Failed health checks
- Error rate > 0.1%

**Solutions:**
```bash
# Check recent errors
npx wrangler tail --status error

# Test specific endpoint
curl -v https://api.mcc-cal.com/api/v1/blog/posts

# Review Worker code for bugs
```

## Best Practices

### 1. Regular Monitoring
- Run health checks hourly via cron/GitHub Actions
- Analyze cache performance weekly
- Review Cloudflare Analytics monthly

### 2. Proactive Alerting
- Set up uptime monitoring
- Configure Slack/email notifications
- Create public status page

### 3. Performance Optimization
- Target > 80% cache hit rate
- Keep response times < 200ms for cached content
- Use CDN for static assets

### 4. Incident Response
- Document outages in incident log
- Post-mortem analysis for issues > 5 minutes
- Update runbooks based on learnings

### 5. Capacity Planning
- Monitor request volume trends
- Plan for traffic spikes (releases, viral content)
- Set up rate limiting for protection

## Related Documentation

- [Cloudflare Worker API](../../tools/cloudflare/worker.js)
- [GitHub Actions Integration](./GITHUB-ACTIONS-CLOUDFLARE-INTEGRATION.md)
- [API Setup Guide](../integrations/CLOUDFLARE-SUBDOMAIN-SETUP.md)

---

**Version:** 1.0.0  
**Last Updated:** December 6, 2025  
**Maintainer:** McCal Media
