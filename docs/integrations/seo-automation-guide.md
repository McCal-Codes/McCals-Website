# SEO Automation Guide

## Overview

Your repository now includes **automatic SEO asset generation** that runs whenever you add new portfolio images. The system generates sitemaps and structured data, commits them, and submits them to search engines—all automatically.

---

## 🤖 How It Works

### Automatic Triggers

The workflow runs automatically when:
1. **Portfolio images change** - Any changes to `src/images/Portfolios/**`
2. **Manifest scripts change** - Updates to `scripts/manifest/**`
3. **API routes change** - Updates to `src/api/routes/manifests.js`

### What It Does

```
📸 You push new photos
  ↓
🔄 GitHub Actions detects changes
  ↓
📋 Regenerates all manifests
  ↓
🚀 Starts API server
  ↓
🗺️  Generates sitemap.xml (all URLs + images)
  ↓
📊 Generates structured data (Schema.org JSON-LD)
  ↓
✅ Validates XML and JSON
  ↓
💾 Commits changes to repo
  ↓
🌐 Submits sitemap to Google
  ↓
✨ Done! Search engines notified
```

---

## 📁 Generated Files

### Sitemap
- **Location**: `dist/sitemap.xml`
- **Contains**: 
  - All portfolio pages
  - Individual photo collection pages
  - Image entries with metadata
  - Proper lastmod dates
  - changefreq and priority hints

### Structured Data
- **Location**: `dist/structured-data/`
- **Files**:
  - `concert-schema.json` - Concert portfolio Schema.org data
  - `events-schema.json` - Events portfolio Schema.org data
  - `journalism-schema.json` - Journalism portfolio Schema.org data
  - `portrait-schema.json` - Portrait portfolio Schema.org data
  - `all-schemas.json` - Combined schemas

---

## 🎮 Manual Control

### Run Manually via GitHub

1. Go to **Actions** tab in your repo
2. Select **Auto-Update SEO Assets**
3. Click **Run workflow**
4. Optional: Check "Force regeneration" to rebuild even if no changes

### Run Locally

```bash
# Start API server
npm run api:start &

# Generate sitemap
npm run seo:sitemap

# Generate structured data
npm run seo:schema

# Generate both
npm run seo:all
```

---

## 🔧 Configuration

### Environment Variables

The workflow uses these defaults (override in workflow file if needed):

```yaml
API_BASE: http://localhost:3001
SITE_URL: https://mcc-cal.com
```

### Customization

Edit `.github/workflows/seo-auto-update.yml` to:

- **Change site URL**: Update `SITE_URL` env var
- **Add more portfolios**: Scripts auto-discover from API
- **Adjust timing**: Modify `paths` in trigger section
- **Add Bing submission**: Uncomment Bing API section and add `BING_WEBMASTER_KEY` secret

---

## 📊 Monitoring

### Check Workflow Status

1. Go to **Actions** tab in GitHub
2. Look for "Auto-Update SEO Assets" runs
3. Green checkmark = success, red X = failed
4. Click run for detailed logs and summary

### Workflow Summary Shows:

- ✅ Sitemap: X URLs, Y images
- ✅ Structured Data: N schema files  
- 📤 Status: Changes committed/No changes
- **Next Steps** with verification links

### Artifacts

Each run uploads artifacts (available for 30 days):
- `seo-assets-<commit-hash>.zip`
- Contains generated sitemap + structured data
- Download to inspect locally

---

## 🐛 Troubleshooting

### Workflow Failed

**Check the logs:**
1. Go to Actions → Failed run
2. Expand failed step
3. Common issues:

#### API didn't start
```
Error: curl -f http://localhost:3001/api/v1/manifests/concert failed
```
**Fix**: Check if `src/api/server.js` has errors, verify port 3001 is free

#### Invalid XML/JSON
```
Invalid sitemap XML
```
**Fix**: Check `scripts/seo/generate-sitemap.js` for syntax errors

#### No manifests found
```
Sitemap has fewer than 5 URLs
```
**Fix**: Run `npm run manifest:generate` locally first, ensure manifests exist

### Local Testing

```bash
# Test the full workflow locally
npm ci
npm run manifest:generate
npm run api:start &
sleep 5
npm run seo:all

# Validate outputs
test -f dist/sitemap.xml && echo "✓ Sitemap exists"
grep -c '<loc>' dist/sitemap.xml # Should show URL count
jq empty dist/structured-data/*.json # Should validate JSON
```

---

## 🌐 Search Engine Integration

### Google Search Console

1. **Verify ownership** at [Google Search Console](https://search.google.com/search-console)
2. **Add sitemap**: 
   - Go to Sitemaps section
   - Enter: `https://mcc-cal.com/sitemap.xml`
   - Click Submit
3. **Monitor**: Check Coverage report for indexing status

**Note**: Workflow auto-pings Google on each update!

### Bing Webmaster Tools

1. **Verify ownership** at [Bing Webmaster Tools](https://www.bing.com/webmasters)
2. **Add sitemap**: 
   - Go to Sitemaps section
   - Enter: `https://mcc-cal.com/sitemap.xml`
   - Click Submit
3. **Optional automation**:
   - Get API key from Bing Webmaster
   - Add `BING_WEBMASTER_KEY` to GitHub Secrets
   - Uncomment Bing submission in workflow

### Testing Rich Results

**Google Rich Results Test:**
1. Go to https://search.google.com/test/rich-results
2. Enter: `https://mcc-cal.com/concerts` (or other portfolio)
3. Paste structured data from `dist/structured-data/concert-schema.json`
4. Click "Test Code"
5. Should see: ✅ ImageGallery with images

---

## 📈 Performance Monitoring

### Key Metrics to Track

In Google Search Console:

1. **Index Coverage**: 
   - Valid pages should increase as you add content
   - Check for "Submitted via sitemap" status

2. **Performance**:
   - Image impressions/clicks
   - Portfolio page clicks
   - Average position

3. **Sitemaps Report**:
   - URLs discovered
   - URLs indexed
   - Last read date (should be recent after each push)

### Expected Results

- **Indexing speed**: 1-3 days for new content (vs 1-2 weeks manual)
- **Image search visibility**: Higher due to proper metadata
- **Rich results**: May appear for portfolio galleries
- **Coverage**: Near 100% of submitted URLs

---

## 🎯 Best Practices

### Do's ✅

- **Commit organized photos**: Follow naming conventions (YYMMDD prefixes)
- **Run manifests before pushing**: `npm run manifest:generate`
- **Check workflow success**: Monitor Actions tab after big photo batches
- **Verify sitemap periodically**: Visit `https://mcc-cal.com/sitemap.xml`

### Don'ts ❌

- **Don't edit sitemap manually**: It's auto-generated
- **Don't commit huge image batches** (1000+ at once): May timeout
- **Don't disable workflow** without disabling sitemap submission too
- **Don't modify dist/ files directly**: They're regenerated

---

## 🔄 Workflow Lifecycle

### When Photos Added:

```
1. You: git push (new photos in src/images/Portfolios/)
   ↓
2. GitHub: Detects changes, starts workflow
   ↓
3. Workflow: Installs deps, generates manifests
   ↓
4. Workflow: Starts API, generates SEO assets
   ↓
5. Workflow: Validates XML/JSON
   ↓
6. Workflow: Commits dist/sitemap.xml + schemas
   ↓
7. Workflow: Pings Google Search Console
   ↓
8. Google: Crawls new sitemap (within hours)
   ↓
9. Google: Indexes new photos/pages (1-3 days)
```

### When No Changes:

- Workflow runs but detects no differences
- Skips commit/push step
- Still validates existing assets
- Logs "No changes detected"

---

## 🚀 Advanced Usage

### Custom Portfolio Types

Add new portfolio types in scripts:

```javascript
// scripts/seo/generate-sitemap.js
const PORTFOLIOS = ['concert', 'events', 'journalism', 'portrait', 'nature', 'YOUR_NEW_TYPE'];
```

Scripts auto-discover structure from API endpoints.

### Scheduled Regeneration

Add cron schedule to workflow:

```yaml
on:
  schedule:
    - cron: '0 3 * * 0'  # Every Sunday at 3 AM UTC
  push:
    # ... existing triggers
```

### Integration with Other Tools

The generated files can be used by:

- **CMS plugins**: Import structured data
- **Analytics**: Track sitemap coverage
- **Testing tools**: Automated SEO audits
- **CDN**: Serve sitemap from edge

---

## 📚 References

- [Sitemap script](../../scripts/seo/generate-sitemap.js)
- [Schema generator](../../scripts/seo/generate-structured-data.js)
- [API integration guide](./api-integration-guide.md)
- [Workflow file](../../.github/workflows/seo-auto-update.yml)

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Workflow runs successfully (check Actions tab)
- [ ] `dist/sitemap.xml` exists and has content
- [ ] `dist/structured-data/*.json` files exist
- [ ] Sitemap accessible at https://mcc-cal.com/sitemap.xml
- [ ] Google Search Console shows submitted sitemap
- [ ] Rich Results Test validates structured data
- [ ] New photos trigger automatic updates

---

## 💡 Tips

1. **Pin Actions tab**: Monitor SEO updates easily
2. **Enable notifications**: Get alerts on workflow failures
3. **Schedule reviews**: Check Search Console weekly
4. **Test locally first**: Run `npm run seo:all` before big changes
5. **Keep API updated**: Ensure manifest endpoints stay current

---

**Your SEO is now automated! 🎉**

Every time you push new photos, your sitemap and structured data update automatically, and search engines are notified immediately.
