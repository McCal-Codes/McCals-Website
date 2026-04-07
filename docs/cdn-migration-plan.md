# CDN Migration Plan: Squarespace → Cloudflare R2

## Overview
Migrate hero and featured images from Squarespace CDN to Cloudflare R2 for:
- **Better performance** (Cloudflare's edge network)
- **Zero egress fees** (R2 doesn't charge for bandwidth)
- **Custom domain** (e.g., `cdn.mcc-cal.com` or `images.mcc-cal.com`)
- **Full control** over caching and optimization

---

## Option 1: Cloudflare R2 (Recommended)

### Setup Steps

1. **Create R2 Bucket**
   ```bash
   npx wrangler r2 bucket create mccal-media-images
   ```

2. **Enable Public Access**
   - Via Cloudflare Dashboard → R2 → Bucket Settings
   - Enable "Public Development URL" for testing
   - Or connect custom domain: `images.mcc-cal.com`

3. **Upload Images**
   Use the migration script (see below) or Wrangler:
   ```bash
   npx wrangler r2 object put mccal-media-images/hero/obama-rally.jpg -f ./src/images/...
   ```

4. **Update URLs in Code**
   Replace `https://images.squarespace-cdn.com/...` with:
   - `https://images.mcc-cal.com/hero/...` (custom domain)
   - OR `https://pub-xxx.r2.dev/hero/...` (r2.dev subdomain)

### Benefits
- Zero bandwidth costs
- Automatic CDN through Cloudflare's network
- Can use Cloudflare Images for on-the-fly optimization
- Same platform as your other infrastructure

---

## Option 2: Vercel Edge Network (If staying on Vercel)

Since you deploy to Vercel, you could use:
- `/public` folder images (automatically served from Vercel's edge)
- But limited to 250MB total for hobby plan

---

## Image Mapping

### Images Found Locally (Ready to Upload)

| Squarespace URL | Local Path | Status |
|-----------------|------------|--------|
| `101024_Obama+Speaks...CAL3364-min.jpg` | `src/images/Portfolios/Journalism/Politics/obama-speaks-pitt/101024_Obama Speaks at Pittsburgh_CAL3364.jpg` | ✅ Available |
| `IMGP7209.jpg` | `src/images/Portfolios/Nature/Landscapes/Downtown Pittsburgh/IMGP7209.jpg` | ✅ Available |
| `230411_Cock+Tail+Hour...876_Published.jpg` | `src/images/Portfolios/Events/bond-party-2023/230411_Cock Tail Hour - James Bond Event_876_Published.webp` | ✅ Available (WebP) |
| `250829_Haven_CAL4401.jpg` | `src/images/Portfolios/Concert/Turtle Park/August 2025/250829_Haven_CAL4401.jpg` | ✅ Available |
| `3a804513...250715_CMU+Trump+Protest_CAL1573.jpg` | `src/images/Portfolios/Journalism/Politics/cmu-trump-protest-2025/` | ⚠️ Check filename |
| `f75a0ba5...6-9-25_Caleb+McCartney_134.jpg` | `src/images/Portfolios/...` | ⚠️ Need to locate |

### Images NOT Found Locally (Need Download)

| Squarespace URL | Notes |
|-----------------|-------|
| `250518_Senior+Portraits_CAL0318.jpg` | Need to download from Squarespace |
| `20240706-_CAL6872.jpg` | Need to download from Squarespace |
| `250823_Honky+Tonk_CAL4149.jpg` | Need to download from Squarespace |
| `251025+When+We+Were+Dead_CAL8612_webuse.jpg` | Need to download from Squarespace |
| `250319+A+Guy+Who+Hates+Musicals+-+Ghostlight_CAL999.jpg` | Need to download from Squarespace |
| `IMGP6886.jpg` | Need to download from Squarespace |

---

## Migration Script

See `scripts/migrate-to-r2.js` for automated upload script.

### Quick Commands

```bash
# Install wrangler if not already
npm install -g wrangler

# Login to Cloudflare
npx wrangler login

# Create bucket
npx wrangler r2 bucket create mccal-media-images

# Upload single image
npx wrangler r2 object put mccal-media-images/hero/obama-rally.jpg -f "./src/images/Portfolios/Journalism/Politics/obama-speaks-pitt/101024_Obama Speaks at Pittsburgh_CAL3364.jpg"

# Or use the migration script
node scripts/migrate-to-r2.js
```

---

## Post-Migration URL Updates

### Current (Squarespace)
```typescript
image: 'https://images.squarespace-cdn.com/content/v1/.../101024_Obama+Speaks...jpg?format=webp&width=1920'
```

### New (R2 with Custom Domain)
```typescript
image: 'https://images.mcc-cal.com/hero/obama-rally-1920.webp'
```

### With Cloudflare Images (Optional)
If using Cloudflare Images service, you can do on-the-fly resizing:
```typescript
image: 'https://images.mcc-cal.com/cdn-cgi/image/width=1920,format=webp/hero/obama-rally.jpg'
```

---

## Cost Estimate (Cloudflare R2)

| Usage | Cost |
|-------|------|
| Storage (1GB) | ~$0.015/month |
| Class A operations | $0.50/million requests |
| Class B operations | $0.50/million requests |
| **Egress (bandwidth)** | **$0** |

For ~50 hero images (~100MB): **~$0.002/month**

---

## Next Steps

1. **Download missing images** from Squarespace (or check if they exist under different names locally)
2. **Set up R2 bucket** and enable public access
3. **Run migration script** to upload all images
4. **Update code** to use new CDN URLs
5. **Test** all pages load correctly
6. **Monitor** performance in Lighthouse

## Files to Update After Migration

- `sites/mcc-cal-vite/src/components/HeroCarousel.tsx` (9 images)
- `sites/mcc-cal-vite/src/content/liveSiteFallbacks.ts` (13 images)
