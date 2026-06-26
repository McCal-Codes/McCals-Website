# Portfolio Image Import Guide

How to add new photo shoots to any portfolio. Images go live immediately — no git commit, no deploy needed.

---

## Uploading a new shoot (the fast way)

Export your images from Lightroom (or any editor) with metadata embedded, then run one command in Terminal from the repo root:

```bash
node scripts/cloudflare/add-shoot.js \
  --portfolio=journalism \
  --collection="Steel Strike 2026" \
  --folder="~/Desktop/shoot"
```

That's it. The script handles everything:

- Reads **IPTC/XMP metadata** automatically — Lightroom captions become `alt_text` and `caption` in Supabase, keywords become `tags`
- Converts JPEG/PNG → **WebP** (q82) before uploading
- Uploads to **Cloudflare R2** at `images.mcc-cal.com/{portfolio}/{collection-slug}/`
- Writes metadata to **Supabase** `portfolio_images` table
- **Resumes safely** — re-running skips already-uploaded files

### Arguments

| Flag | Required | Description |
|------|----------|-------------|
| `--portfolio` | Yes | `journalism` \| `concert` \| `portrait` \| `events` \| `nature` |
| `--collection` | Yes | Human-readable event name, e.g. `"Steel Strike 2026"` |
| `--folder` | Yes | Path to your exported images, supports `~` |
| `--tags` | No | Comma-separated tags — skipped if IPTC keywords are present |
| `--dry-run` | No | Preview what would upload without writing anything |
| `--concurrency` | No | Parallel uploads (default: 6) |

### Dry run first

```bash
node scripts/cloudflare/add-shoot.js \
  --portfolio=journalism \
  --collection="Steel Strike 2026" \
  --folder="~/Desktop/shoot" \
  --dry-run
```

Shows each file, what caption/keywords it reads from IPTC, and the R2 path — no uploads happen.

### What good terminal output looks like

```
─────────────────────────────────────────────
Portfolio : journalism
Collection: Steel Strike 2026
Folder    : /Users/you/Desktop/shoot
Images    : 14
─────────────────────────────────────────────

[1/14] OK  260612_Strike_CAL3201.webp  208KB | "Workers gather outside Clairton Coke Works at dawn..."
[2/14] OK  260612_Strike_CAL3202.webp  195KB | (no caption)
...

─────────────────────────────────────────────
Uploaded : 14
Skipped  : 0
Errors   : 0

Live at  : https://images.mcc-cal.com/journalism/steel-strike-2026/
```

---

## After uploading — fill in missing captions

Any image without a Lightroom caption will have blank `alt_text` and `caption` in Supabase. Fill those in via the dashboard:

1. Go to [Supabase → Table Editor → portfolio_images](https://supabase.com/dashboard/project/lrppdtruasrabctqkzcs/editor)
2. Filter: `portfolio_type = journalism` AND `collection_name = Steel Strike 2026`
3. Edit the `alt_text` and `caption` columns directly in the table

Changes are live immediately — no deploy.

---

## Exporting from Lightroom with metadata

For captions and keywords to auto-populate, export with metadata included:

1. **File → Export** (or Cmd+Shift+E)
2. Under **Metadata**, set to `All Metadata`
3. Make sure **Caption** (Description field) and **Keywords** are filled in before exporting

The script reads:
- **Caption/Abstract (IPTC tag 120)** → `alt_text` + `caption`
- **Headline (IPTC tag 105)** → `alt_text` fallback if no caption
- **Keywords (IPTC tag 25)** → `tags` array in Supabase

If IPTC is missing, the script also checks the XMP `dc:description` and `dc:subject` fields as a fallback (what Lightroom writes to sidecar `.xmp` files and some JPEG exports).

---

## Slideshow management

The homepage hero carousel pulls slides from Supabase `hero_slides` at runtime, with an instant fallback to the hardcoded slides if Supabase is unreachable.

Manage slides at [Supabase → hero_slides](https://supabase.com/dashboard/project/lrppdtruasrabctqkzcs/editor?schema=public&table=hero_slides):

| Column | What it does |
|--------|-------------|
| `is_active` | Toggle a slide on/off without deleting it |
| `sort_order` | Controls display order (lower = first) |
| `image_url` | Full URL of the hero image |
| `storage_path` | R2 path (e.g. `journalism/steel-strike-2026/hero.webp`) — overrides `image_url` if set |
| `alt_text` | Screen reader alt text for the hero image |
| `focal_point_mobile_x/y` | 0.0–1.0 — where to focus the crop on mobile |
| `focal_point_desktop_x/y` | 0.0–1.0 — where to focus the crop on desktop |
| `cta` | The button label shown on the hero slide |
| `href` | Where the button links |

Variants (alternate images that rotate for each slide) live in `hero_slide_variants`, linked by `slide_cta`.

---

## Infrastructure at a glance

| Layer | Service | Purpose |
|-------|---------|---------|
| Object storage | Cloudflare R2 (`portfolio-images` bucket) | Stores WebP images permanently |
| CDN | `images.mcc-cal.com` (Cloudflare) | Global edge delivery with 1-year cache |
| Image transforms | Vercel Image Optimization (`/_vercel/image`) | On-the-fly AVIF/WebP resize for `<img srcset>` |
| Metadata | Supabase `lrppdtruasrabctqkzcs` | Alt text, captions, tags, featured flags |
| Hero slides | Supabase `hero_slides` + `hero_slide_variants` | Runtime slide management without deploys |

### R2 path convention

```
{portfolio_type}/{slugified-collection}/{safe-filename}.webp

journalism/steel-strike-2026/260612_Strike_CAL3201.webp
concert/radiohead-pitt-2026/260518_Radiohead_CAL1001.webp
```

- Spaces in filenames → underscores
- Collection name → lowercase, hyphens, alphanumeric only
- All images converted to WebP at upload time

---

## Required env vars (`.env.local`)

Already configured. Reference only:

```
CLOUDFLARE_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET=portfolio-images
VITE_R2_PUBLIC_URL=https://images.mcc-cal.com
VITE_SUPABASE_URL=https://lrppdtruasrabctqkzcs.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...     ← upload scripts only (never sent to browser)
VITE_SUPABASE_ANON_KEY=...        ← browser-safe read key (hero slideshow)
```

---

## Legacy: git-based portfolio import (pre-2026)

Older portfolios still on GitHub/jsDelivr use the manifest pipeline. When you're ready to migrate a legacy portfolio to R2, use `scripts/cloudflare/migrate-portfolio-images.js` — it reads from the existing local manifest folders instead of a new shoot folder.

See [`docs/archive/CONCERT-AUTOMATION.md`](../archive/CONCERT-AUTOMATION.md) for the old workflow.
