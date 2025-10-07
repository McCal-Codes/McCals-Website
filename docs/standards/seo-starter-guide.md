# McCal Media — SEO Starter Guide (Tailored Playbook)

**Goal:** Turn Google's SEO Starter Guide into a practical, McCal‑specific playbook you can actually ship. This focuses on your photography portfolio, editorial/political coverage, and service pages on Squarespace.

---

## 0) Quick‑start checklist (print this)

* [ ] Verify site in **Google Search Console**; submit `sitemap.xml`.
* [ ] Set preferred domain: [https://www.mcc-cal.com](https://www.mcc-cal.com)
* [ ] Fix crawl blockers (robots.txt, passworded pages, blocked assets).
* [ ] Add unique **title + meta description** to every indexable page.
* [ ] Add **H1** that matches search intent on each page.
* [ ] Compress and rename images (`shoot-name-location-YYYY.jpg`), add **alt**.
* [ ] Add **internal links** from blog/case studies → service pages.
* [ ] Implement **JSON‑LD schema** (Organization, LocalBusiness/Photographer, ImageObject, Article, CreativeWork).
* [ ] Create 3–5 cornerstone pages (Event Photography, Commercial/Studio, Headshots, Political Photojournalism, About).
* [ ] Push a new post/case study weekly for 8 weeks and interlink.

---

## 1) Site structure & URL strategy

Keep it human‑legible. Group by intent and topic.

```
/
/work/                    # portfolio hub
  /work/event-photography/
/work/commercial/
/work/headshots/
/work/political/
/services/
/services/event-photography-pittsburgh/
/services/commercial-photography-studio/
/services/corporate-headshots/
/about/
/contact/
/journal/                 # blog/editorial
  /journal/market-square-business-impact/
/journal/drag-in-pittsburgh-history/
```

**Rules:**

* Descriptive slugs using words users actually search ("event‑photography‑pittsburgh", not "/svc‑01").
* One canonical URL per piece of content. If you must duplicate, use 301s or `rel=canonical`.
* Use folders to signal topical groups (`/work/`, `/services/`, `/journal/`). 

### 1A) Crawlable URL structure — Google requirements (distilled)

* **Follow IETF STD 66:** URLs must be valid; percent‑encode reserved/non‑ASCII characters. Keep emojis out of slugs; use encoded or plain ASCII.
* **No hash‑routing for content:** Don't rely on URL **fragments** (`#...`) to swap page content. If JS changes state, use the **History API** and real paths.
* **Parameters format:** Use `?key=value&key2=value2`. For multi‑values, delimit inside the value (e.g., `color=purple,pink`). Avoid custom syntaxes like `?[k:v][k2:v2]`.
* **Hyphens > underscores:** Prefer `summer-clothing` not `summer_clothing`, and avoid concatenating words.
* **Lowercase, predictable, minimal:** Treat URLs as **case‑sensitive**; standardize to lowercase. Trim parameters that don't change content (session IDs, tracking). Prefer cookies for sessions.
* **Audience language:** It's fine to use the audience's language in slugs, but percent‑encode non‑ASCII in links. For McCal, stick to plain ASCII English for consistency.
* **Keep parameters few:** Over‑parameterization creates crawl bloat and duplicate views. Design filters carefully (see faceted nav, below).
* **Multi‑regional:** If ever needed, use ccTLDs or subfolders like `/de/`. (Not needed for McCal now.)

#### Faceted navigation & crawl control (what causes bloat)

* Additive filters (e.g., `?type=event&city=pittsburgh&tag=nonprofit&sort=date`) can explode into thousands of URLs.
* Irrelevant params (referrers, UTMs, `sessionid`, `click=`) multiply duplicates.
* Infinite calendars (`?y=2025&m=10&d=13` with prev/next forever) create endless crawl spaces.

**Mitigations for Squarespace:**

* Don't link to search results pages from crawlable areas. Use **noindex** on any search/listing results that aren't core content.
* Avoid exposing filter links that only reorder/sort. If you must, block links to those states (no href, or use JS with History API and render same canonical).
* Use one **canonical** URL for each gallery/post; if filters exist, ensure filtered states point canonically to the base.
* For calendars, restrict navigation depth and add `rel="nofollow"` on links to distant months; keep canonical on the current month.

#### Robots / canonicals quick patterns

* **Robots.txt** can't target query strings reliably; prefer **noindex** meta and internal linking discipline.
* Use `link rel="canonical"` to consolidate variants to the cleanest URL (e.g., `/services/event-photography-pittsburgh/`).
* Add 301s from old/uppercase/messy slugs to lowercase, hyphenated versions.

**Good vs. risky examples (McCal):**

* ✅ `https://www.mcc-cal.com/services/event-photography-pittsburgh/`
* ✅ `https://www.mcc-cal.com/journal/market-square-business-impact/`
* ⚠️ `https://www.mcc-cal.com/JOURNAL?sort=recent&view=grid&sessionid=ABC123`
* ❌ `https://www.mcc-cal.com/#/event-photography` (hash‑routing)

---

## 2) Titles & meta descriptions (copy‑paste templates)

**Format guidance**

* **Title (≤ 60 chars):** Primary intent | Brand | Location (when relevant)
* **Meta (120–155 chars):** Benefit + specificity + differentiator + CTA

**Service page — Event Photography (Pittsburgh)**

* Title: `Event Photography in Pittsburgh | McCal Media`
* Meta: `Event photography that actually tells the story—corporate, nonprofit, and editorial events across Pittsburgh. View work and book a date.`

**Portfolio collection — Headshots**

* Title: `Studio & On‑Location Headshots | McCal Media`
* Meta: `Clean, consistent headshots for teams and creatives. Studio or on‑location setups with fast turnaround. See examples and pricing.`

**Editorial/Journal post**

* Title: `Businesses vs. Revitalization in Market Square — Photo Story`
* Meta: `What downtown changes mean for small businesses. Images, interviews, and on‑the‑ground reporting from Market Square.`

**Homepage**

* Title: `McCal Media | Event & Commercial Photography in Pittsburgh`
* Meta: `Story‑driven photography for brands, newsrooms, and nonprofits. See recent work and book your session.`

---

## 3) Heading & content patterns

* One **H1** per page that matches search intent: `Event Photography in Pittsburgh`.
* Use **H2s** for scannable sections: Services, Process, Portfolio, Rates, FAQ.
* Keep paragraphs short; add pull‑quotes and captions that carry keywords naturally.

**FAQ seeds** (great for snippets):

* `How much does event photography cost in Pittsburgh?`
* `Do you offer same‑day selects or press‑ready exports?`
* `Can you provide a certificate of insurance (COI)?`

---

## 4) Image & video optimization (critical for photographers)

**Filenames**: `event-pgh-company-2025-05-12-001.jpg`

**Alt text pattern** (describe content + context, not just "photo of"):

* `Keynote speaker at nonprofit gala in Pittsburgh—on-stage closeup during opening remarks`
* `Studio headshot with gray seamless—three-quarter pose, soft key`
* `Protest march in downtown Pittsburgh—wide shot with city skyline`

**Specs**

* Export responsive sizes (e.g., 3840w, 2560w, 1600w, 1024w) with `srcset` if theme allows.
* Aim for ≤ 200–300KB per portfolio image without banding; use AVIF/WEBP if Squarespace supports; fall back to JPEG.
* Lazy‑load below‑the‑fold; preload above‑the‑fold hero.

**Captions**

* Use substantive captions: who/what/where/why. Google uses nearby text to understand images.

---

## 5) Internal and external linking — Google best practices

### 5A) Make your links crawlable

* Always use true HTML anchor tags: `<a href="/path">Link text</a>`.
* Links **must** include an `href` value that resolves to a valid URL or relative path. Avoid JS-only navigation like `onclick="goto('...')"` or `routerLink` without `href`.
* Safe examples:

  * `<a href="https://www.mcc-cal.com/work/event-photography/">Event Photography</a>`
  * `<a href="/journal/market-square-business-impact/">Market Square article</a>`
* Unsafe examples:

  * `<a onclick="goto('/journal')">Journal</a>`
  * `<span href="/services">Services</span>`

If using JavaScript to insert links dynamically, ensure the rendered HTML still contains `<a href="...">` for crawlers.

### 5B) Anchor text: descriptive and readable

Anchor text is the visible, clickable part of the link. It should describe the destination clearly and naturally.

**Good:**

* `Learn more about our <a href="/services/event-photography-pittsburgh/">event photography in Pittsburgh</a>.`
* `See the <a href="/work/political/">political photojournalism portfolio</a> for campaign coverage.`

**Avoid:**

* `Click here` or `Read more`
* Empty link text (`<a href="/about"></a>`) — if an image is used, include descriptive `alt` text.

For image links:

```html
<a href="/contact"><img src="/assets/book-session.jpg" alt="Book a photography session" /></a>
```

### 5C) Context and flow

* Don't stack multiple links with no context (`<a>so</a><a>many</a><a>times</a>`). Write complete, contextual sentences.
* The words around a link matter. Google uses nearby text to infer relevance.
* If anchor text makes no sense by itself, rewrite until it does.

### 5D) Internal linking strategy (juice routing)

* Every page should be linked from at least one other page.
* Use descriptive, contextual anchors to help readers (and crawlers) discover related work.
* Examples:

  * From journal post → service page: `see our <a href="/services/event-photography-pittsburgh/">event photography process</a>`.
  * From work page → parent category: `Back to <a href="/work/">portfolio</a>`.
* Add **Related Work** blocks or **Further Reading** sections to connect thematically similar content.
* Avoid excessive links; if it feels cluttered, it is.

### 5E) External links

* Link out to trusted sources when relevant; it builds credibility and context.
* Cite your sources or collaborators. Example:

  * `See full coverage on <a href="ppuglobe.com">The Globe</a>.`
* If you were compensated or don't trust the destination, use `rel="nofollow"`, `rel="sponsored"`, or `rel="ugc"` appropriately.
* Don't blanket all external links with `nofollow` — only those that need it.

### 5F) Technical hygiene for links

* Always use absolute or root-relative paths (e.g., `/services/...`), not parent-relative (`../../services/...`).
* Avoid broken relative paths that can loop (especially when copying content between folders).
* Test periodically with Search Console's **URL Inspection Tool** to ensure rendered pages show all internal anchors.

---

## 6) Structured data (copy‑ready JSON‑LD)

### 6.1 Organization & LocalBusiness (Photographer)

> Replace phone if needed. Uses your public business details.

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": ["Organization", "LocalBusiness", "Photographer"],
  "name": "McCal Media",
  "url": "https://www.mcc-cal.com/",
  "logo": "https://www.mcc-cal.com/path/to/logo.png",
  "image": "https://www.mcc-cal.com/path/to/og-image.jpg",
  "email": "business@mcc-cal.com",
  "telephone": "+1-570-299-1214",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "320 Pointview Rd, Apt 2",
    "addressLocality": "Pittsburgh",
    "addressRegion": "PA",
    "postalCode": "15227",
    "addressCountry": "US"
  },
  "areaServed": ["Pittsburgh", "Erie", "Western Pennsylvania"],
  "sameAs": [
    "https://www.instagram.com/mccal.media",
    "https://www.linkedin.com/company/mccal-media"
  ]
}
</script>
```

### 6.2 Service page (Event Photography)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Service",
  "serviceType": "Event Photography",
  "provider": {
    "@type": "LocalBusiness",
    "name": "McCal Media"
  },
  "areaServed": "Pittsburgh, PA",
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Event Packages",
    "itemListElement": [
      {"@type":"Offer", "name":"Half‑day coverage", "priceCurrency":"USD"},
      {"@type":"Offer", "name":"Full‑day coverage", "priceCurrency":"USD"}
    ]
  }
}
</script>
```

### 6.3 ImageObject (for hero or key portfolio image)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "ImageObject",
  "contentUrl": "https://www.mcc-cal.com/work/event-photography/gala-2025-hero.jpg",
  "caption": "Nonprofit gala keynote in Pittsburgh—stage closeup",
  "author": {
    "@type":"Organization",
    "name":"McCal Media"
  }
}
</script>
```

### 6.4 Article (for Journal/editorial pieces)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  "headline": "Businesses vs. Revitalization in Market Square",
  "datePublished": "2025-04-07",
  "dateModified": "2025-04-07",
  "author": {"@type":"Person","name":"Caleb McCartney"},
  "publisher": {"@type":"Organization","name":"McCal Media"},
  "image": [
    "https://www.mcc-cal.com/journal/market-square/hero.jpg"
  ]
}
</script>
```

### 6.5 CreativeWork (for portfolio case studies)

```html
<script type="application/ld+json">
{
  "@context":"https://schema.org",
  "@type":"CreativeWork",
  "name":"Nonprofit Fundraiser — Event Photography",
  "creator":{"@type":"Organization","name":"McCal Media"},
  "contentLocation":"Pittsburgh, PA",
  "about":["Event Photography","Nonprofit"],
  "thumbnailUrl":"https://www.mcc-cal.com/work/event-photography/nonprofit-2025-thumb.jpg"
}
</script>
```

> Squarespace tip: Add JSON‑LD in Page Header Code Injection for that page only. Keep one JSON‑LD block per type to avoid duplication.

---

## 7) Technical hygiene & sitemap strategy

### 7A) Sitemaps — definition & purpose

A **sitemap** is a structured file (usually XML) that lists your website's URLs and provides metadata—like last update date, file type, or media references—to help Google crawl efficiently. It's essentially your site's table of contents for search engines.

**Benefits for McCal Media:**

* Ensures all work, service, and journal pages are indexed, even if not directly linked in menus.
* Helps Google prioritize your latest case studies, event coverage, and updates.
* Supports special content (images, videos, or news articles) via sitemap extensions.

**Squarespace note:** Squarespace automatically generates an XML sitemap at `/sitemap.xml`. Submit that file in **Google Search Console → Indexing → Sitemaps**.

### 7B) When you need a sitemap

You'll want to maintain one if:

* You exceed ~500 indexable URLs (galleries, journals, case studies, etc.).
* The site includes rich media (video/image portfolios) or news/editorial content.
* The site is new or has few backlinks.

Even if your site is small, a clean sitemap still accelerates discovery.

### 7C) Sitemap formats (overview)

| Type            | Best For             | Pros                              | Cons                                 |
| --------------- | -------------------- | --------------------------------- | ------------------------------------ |
| **XML**         | Most sites (default) | Extensible, supports media + news | Harder to edit manually              |
| **RSS / Atom**  | Dynamic feeds        | Auto-generated by CMS             | Limited metadata; mostly recent URLs |
| **Text (.txt)** | Simple static sites  | Easy to build                     | Lists only URLs, no metadata         |

For McCal Media, **XML** is ideal.

### 7D) Sitemap best practices (Google protocol)

* **Size limit:** ≤ 50MB uncompressed or ≤ 50,000 URLs per file.
* **Encoding:** UTF‑8.
* **Location:** Place `/sitemap.xml` in site root. Affects all descendant pages.
* **URLs:** Use absolute URLs (e.g., `https://www.mcc-cal.com/work/event-photography/`). Never use relative paths.
* **Canonical preference:** Include only canonical URLs, not duplicates or redirects.
* **Frequency:** Update automatically when adding new journal posts or work pages.
* **Last modified:** Keep `<lastmod>` accurate (real content updates, not copyright changes).

**Example (basic XML):**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.mcc-cal.com/work/event-photography/</loc>
    <lastmod>2025-10-06</lastmod>
  </url>
</urlset>
```

### 7E) Submitting a sitemap

**Option 1:** Submit in Google Search Console → "Sitemaps" → enter `https://www.mcc-cal.com/sitemap.xml`.

**Option 2:** Add to `robots.txt` (Squarespace Settings → SEO → Advanced):

```
Sitemap: https://www.mcc-cal.com/sitemap.xml
```

**Option 3:** Use the Search Console API (advanced automation).

After submission, check crawl stats and fix warnings for invalid URLs or blocked pages.

### 7F) Large or multi-site cases (future scalability)

If McCal Media expands into multiple domains (for example, a separate news site or photo archive):

* You can host **cross-domain sitemaps** on a central domain (e.g., `https://sitemaps.mcc-cal.com/`).
* Reference each from its own domain's `robots.txt`.
* Verify all properties in Search Console before submitting.

### 7G) Sitemap index files and image sitemaps

When your sitemap grows beyond 50MB or 50,000 URLs, split it and use a **sitemap index file** to keep everything organized.

**How it works:** The index file lists multiple individual sitemap files (for example, one for Work, one for Journal, one for Services). Google treats it as a directory of sitemaps.

**Example:**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://www.mcc-cal.com/sitemap-work.xml</loc>
    <lastmod>2025-10-06</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://www.mcc-cal.com/sitemap-journal.xml</loc>
    <lastmod>2025-10-06</lastmod>
  </sitemap>
</sitemapindex>
```

**Best practices:**

* Host all referenced sitemaps in the same or lower directory as the index file.
* Use absolute URLs only.
* Maintain consistent `lastmod` timestamps to help Google schedule crawling.
* Submit the index file (`/sitemap_index.xml`) instead of each sitemap individually in Search Console.
* You can submit up to **500 sitemap index files** per verified site.

### 7H) Image sitemaps

Image sitemaps help Google discover visuals that JavaScript or galleries might hide. You can either extend your main sitemap or create a separate one.

**Example image sitemap:**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
    xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>https://www.mcc-cal.com/work/event-photography/</loc>
    <image:image>
      <image:loc>https://www.mcc-cal.com/work/event-photography/gala-2025-hero.jpg</image:loc>
    </image:image>
    <image:image>
      <image:loc>https://www.mcc-cal.com/work/event-photography/fundraiser-2025.jpg</image:loc>
    </image:image>
  </url>
  <url>
    <loc>https://www.mcc-cal.com/work/commercial/</loc>
    <image:image>
      <image:loc>https://www.mcc-cal.com/work/commercial/product-lighting.jpg</image:loc>
    </image:image>
  </url>
</urlset>
```

**Guidelines:**

* Each `<url>` can include up to **1,000** `<image:image>` tags.
* Image URLs can be on a CDN, but both domains (main + CDN) must be verified in Search Console.
* Don't block image URLs in `robots.txt`. 

**For McCal Media:** Because Squarespace automatically includes image entries in its sitemap, you generally don't need a separate image sitemap—but adding one can help highlight featured portfolio and press images.

### 7I) Ongoing maintenance

* Re-submit index and sub-sitemaps after major updates.
* Review Search Console's **Sitemaps report** for errors and last crawl times.
* Confirm that all Work, Journal, and Service URLs appear under your index structure.

---

## 8) Content roadmap (12‑week plan)

**Cornerstone updates (Weeks 1–2)**

* Refresh: Event, Commercial, Headshots, Political Work, About.

**Case studies (Weeks 3–10):**

* Nonprofit gala $200k raised — storytelling + outcomes
* Corporate conference — same‑day selects workflow
* Studio team headshots — lighting diagrams & tips
* Editorial: Drag in Pittsburgh — interviews and history
* Market Square revitalization — business impact photo story
* Political trail photojournalism — process + ethics

**Linking:** Each case study links to 1–2 service pages and 2 related stories.

---

## 9) Measurement & iteration

**Search Console:**

* Coverage/Indexing: zero error pages; fix soft‑404s.
* Performance → Queries: track clicks/CTR for `event photography pittsburgh`, `corporate headshots pittsburgh`, `commercial photographer pittsburgh`, `photojournalism pittsburgh`.
* Page Experience → Core Web Vitals: watch LCP offenders; usually image heroes.

**KPIs:**

* 90‑day targets: +40% non‑brand clicks, +25% CTR on service pages, 3 new referring domains from editorial placements.

---

## 10) Page‑level SOP (repeatable)

1. Draft page with intent‑matched H1.
2. Write title/meta using templates.
3. Place optimized hero and 8–15 images; add alt + captions.
4. Add 3 internal links out, 2 internal links in (from related pages).
5. Add matching JSON‑LD.
6. Publish; request indexing in Search Console; annotate in an analytics log.
7. Revisit at 2 weeks and 6 weeks; update with observations/outcomes.

---

## 11) What *not* to chase

* Meta keywords; keyword stuffing; domain hacks for exact‑match.
* Word‑count superstition. Use the words you need; be clear.
* Fear of duplicate content: fix with canonicals/301s; don't panic.

---

## 12) Reusable blocks & snippets

**Contact block (consistent NAP):**

```
McCal Media — Event & Commercial Photography
320 Pointview Rd, Apt 2, Pittsburgh, PA 15227
business@mcc-cal.com • (570) 299‑1214
```

**Booking CTA copy:**

* `Check availability for your date`
* `Get pricing & hold a slot`

**Anchor text examples:**

* `our event photography process`
* `studio headshots with consistent lighting`
* `commercial set builds and on‑location work`

---

### Final advice

Keep shipping useful, well‑labeled stories with fast images, honest titles, and clean links. That's the ballgame. Iterate every 2–4 weeks based on Search Console data, not vibes.

### 7J) Managing faceted navigation (filters) without nuking crawl

**The risk:** Filter UIs (tags, color, date, sort, etc.) can create near‑infinite URL combinations (`?type=event&city=pittsburgh&color=green&size=tiny`). Crawlers will chase them, wasting crawl on low‑value duplicates and delaying discovery of new work.

**If you don't need filtered URLs indexed:**

* **Block with robots.txt** (Squarespace → Settings → SEO → Advanced → robots.txt). Pattern examples:

  ```
  User-agent: Googlebot
  Disallow: /*?*type=
  Disallow: /*?*city=
  Disallow: /*?*size=
  ```

  Tune parameter names to your actual names.
* Prefer **one canonical listing** (unfiltered) linking to item detail pages. All filtered states should point canonical to the base list or be **noindex**.
* You can use **URL fragments** (`#/filter=color:green`) for client‑side filtering; fragments aren't crawled. Only do this if the unfiltered page already exposes links to the actual items.
* `rel="nofollow"` on filter links can help, but it's weaker than robots + canonical.

**If you DO need filtered URLs indexed:**

* Use standard params with `&` separators: `?type=event&city=pittsburgh`.
* Keep a **fixed parameter order**; never duplicate params.
* Return **404** for nonsense or empty result combos (no green fish → 404 on that URL).
* Provide a clean **canonical** to the exact filtered state you want indexed; avoid generating countless near‑duplicates (e.g., sort/view modes).

**Squarespace play:**

* Avoid exposing sort/view toggles as crawlable links (use JS with History API and keep canonical on base).
* For Collections/Tags pages, set **noindex** if they add little value; link to Work/Service pages instead.

### 7K) Crawl‑budget optimization (advanced)

Most photography sites don't hit crawl limits, but if growth accelerates or press coverage explodes, use this checklist:

**Inventory control**

* Consolidate duplicates with canonicals or 301s; eliminate **soft‑404s**.
* Keep **sitemaps** fresh; set accurate `<lastmod>`.
* Block truly unimportant URLs (search results, infinite calendars) in robots.txt; don't rely on temporary blocks to "reallocate" budget.

**Speed & stability**

* Improve server response time and rendering; trim long redirect chains.
* Heavy but non‑critical resources (decorative images) can be blocked for bots via robots.txt to save render time.

**Signals & monitoring**

* Use **Search Console → Crawl stats** to spot availability issues; if host load warnings appear, increase capacity or reduce heavy templates.
* Use **URL Inspection** to verify discovery/indexing dates for key pages.
* If overcrawled in an emergency, temporarily return **503/429** for Googlebot; revert within ~48 hours to avoid drops.

**Do**

* Serve 404/410 for removed pages.
* Reference shared resources from a **single URL** so crawlers cache them.

**Avoid**

* Rotating robots.txt or sitemaps to game crawl allocation.
* Expecting every sitemap URL to be crawled immediately; sitemaps are hints, not commands.

### 7L) Google crawlers, fetchers & protocols (what hits your site)

**Types of Google clients**

* **Common crawlers** (e.g., Googlebot): automatic discovery, obey robots.txt.
* **Special‑case crawlers** (e.g., AdsBot): operate under product agreements; may ignore global `User‑agent: *` rules.
* **User‑triggered fetchers** (e.g., Site Verifier, URL Inspection): run on user request.

**How they connect**

* Distributed across many data centers; most traffic egresses from U.S. IPs, but can appear international.
* Support **HTTP/1.1** and **HTTP/2** (no ranking boost for H2; it’s just efficient). To opt out of H2, respond **421** to Googlebot's H2 attempts.
* Support content encodings: **gzip, deflate, br (Brotli)**.
* Can crawl **FTP/FTPS** rarely.

**Caching they understand**

* **ETag / If‑None‑Match** and **Last‑Modified / If‑Modified‑Since** are supported. Prefer **ETag** to avoid date parsing issues. Returning **304 Not Modified** saves resources.

**Verifying Googlebot** (useful when hardening rate limits)

* Check **User‑Agent**, reverse DNS hostnames, and source IP.

**Crawl rate & host load**

* Goal is "as much as possible without overload." You can reduce crawl rate in Search Console if needed; don't mis‑use HTTP status codes or you may impact indexing.

### 7M) robots.txt — purpose, limits, and a McCal template

**What robots.txt is for**

* Manage crawler **traffic** and exclude **unimportant** or **duplicate** URLs from crawling (not from indexing). For true removal from Search, use **noindex** or authentication.

**Limits to remember**

* Some crawlers ignore robots.txt; disallowed URLs can still be indexed via external links (URL only, no snippet). Use noindex/password for sensitive content.

**McCal Media baseline robots.txt**

```txt
# McCal Media robots.txt
# Allow everything by default; block low‑value parameters and internal search.

User-agent: *
Disallow: /search
Disallow: /*?*sessionid=
Disallow: /*?*sort=
Disallow: /*?*view=
# Example filter params (tune to your actual names)
Disallow: /*?*tag=
Disallow: /*?*filter=

# Don't block essential assets used to render pages.
Allow: /assets/

# Sitemap(s)
Sitemap: https://www.mcc-cal.com/sitemap.xml
# If using a sitemap index:
# Sitemap: https://www.mcc-cal.com/sitemap_index.xml
```

**When to customize**

* If you implement faceted filters, add explicit `Disallow` lines for those params (see §7J).
* Never block CSS/JS required for rendering; it harms understanding and can tank rankings.

**Do vs. Don't with robots.txt**

* **Do:** Block infinite spaces (search results, calendars), duplicate sort orders, and decorative resources for bots (only if truly non‑critical).
* **Don't:** Use robots.txt as a temporary budget lever; don't expect it to hide sensitive content.

**Operational tips**

* Keep robots.txt stable; frequent flips create crawl churn.
* After changes, test in **Search Console → robots.txt Tester** and monitor **Crawl stats**.

### 7N) Writing and submitting robots.txt

**Where it lives:**
A robots.txt file must sit at your **site root**, e.g., `https://www.mcc-cal.com/robots.txt`. It can't live in a folder like `/pages/robots.txt`—Google won't see it there.

**One file per host:** each subdomain or port needs its own (for example, `studio.mcc-cal.com/robots.txt`). The file must be plain text, **UTF-8 encoded**, and named exactly `robots.txt`.

**Basic structure:**
Each section ("group") starts with a `User-agent:` line, followed by `Disallow` and/or `Allow` rules. Comments start with `#`. 

**Example:**

```txt
# Example robots.txt
User-agent: Googlebot
Disallow: /nogooglebot/

User-agent: *
Allow: /

Sitemap: https://www.mcc-cal.com/sitemap.xml
```

This means Googlebot may not crawl `/nogooglebot/`, all others can crawl everything, and the sitemap is declared.

**Rule syntax:**

* `User-agent:` specifies which crawler the rules apply to. `*` = all bots.
* `Disallow:` blocks paths. Start with `/`; use `$` for ends‑with matches, and `*` as wildcards.
* `Allow:` explicitly re‑permits a subpath inside a blocked directory.
* `Sitemap:` declares sitemap URLs (always full URLs; Google doesn't assume alternates like non‑www or http→https).
* Rules are **case‑sensitive**.

**Useful examples:**

```txt
# Block entire site
User-agent: *
Disallow: /

# Block directories
User-agent: *
Disallow: /calendar/
Disallow: /junk/

# Block file types
User-agent: Googlebot
Disallow: /*.gif$

# Allow only /public/
User-agent: *
Disallow: /
Allow: /public/

# Block all images from Google Images
User-agent: Googlebot-Image
Disallow: /

# Disallow entire site except Google Ads crawler
User-agent: *
Disallow: /
User-agent: Mediapartners-Google
Allow: /
```

**Workflow for creating robots.txt:**

1. **Create** a new text file with UTF‑8 encoding (use Notepad, TextEdit, or VS Code—not Word).
2. **Add** your rules (see above). Use `#` comments liberally for clarity.
3. **Upload** to your root directory (Squarespace → Settings → SEO → Advanced → robots.txt editor or hosting root for custom sites).
4. **Test:** Visit `https://www.mcc-cal.com/robots.txt` in an incognito browser tab to confirm visibility.
5. **Validate:**

   * Use **Google Search Console → robots.txt Tester** to check syntax.
   * Or, if developing locally, test via Google's [open‑source robots.txt parser](https://github.com/google/robotstxt).
6. **Submit:** Google finds robots.txt automatically. To refresh cached rules quickly, use the **Submit updated robots.txt** feature in Search Console.

**Tips for McCal Media:**

* Keep one main robots.txt at your root, referencing `/sitemap.xml` (or `/sitemap_index.xml`).
* Update it only when structure changes—frequent edits cause crawl churn.
* Don't use robots.txt to hide private galleries; use **password protection** or **noindex**.
* Maintain simple, stable Disallow patterns for query parameters and search pages.

### 7O) Canonicalization — choosing the one true URL

**What & why**
Canonicalization is Google's process of picking a single, representative URL from a set of duplicates (HTTP/HTTPS, params, filtered/sorted views, device variants, region variants, demo/staging, region variants). Duplicates aren't spam, but too many versions confuse users and dilute signals.

**Signals Google considers** (your hints, not commands):

* **Redirects** (301 from non‑preferred → preferred)
* **HTTPS** vs HTTP (HTTPS preferred)
* **Sitemaps** (include only the preferred URLs)
* **`<link rel="canonical" href="...">`** on every duplicate, pointing to the preferred URL

**McCal playbook**

* Pick lowercase, hyphenated **primary URLs** for each page (see §1A).
* Ensure old slugs 301 to the new canonical.
* On Squarespace, default canonicals are fine for most pages. Override only when you intentionally expose variants (rare).
* For filtered or sorted lists, keep canonical on the **base listing** unless a specific filtered view deserves indexing.
* Localized content: Only treat pages as duplicates if the **primary content language is identical**. If you later add locales, use `hreflang` rather than canonicals between different languages.

**Example canonical tag**

```html
<link rel="canonical" href="https://www.mcc-cal.com/services/event-photography-pittsburgh/" />
```

**QA checklist**

* One canonical per page. No conflicts. No self‑canonicals across different URLs.
* Canonical target is **200 OK**, indexable, not noindexed, not blocked by robots.txt.
* Sitemaps and internal links reference the canonical.

### 7P) JavaScript SEO — make SPAs discoverable

**How Google processes JS**: crawl → render (evergreen Chromium) → index. Rendering can be deferred; server‑side rendering (SSR) or pre‑rendering improves speed and reliability for both users and bots.

**Linking & routing**

* Discoverable links must be real anchors: `<a href="/path">Text</a>`.
* Avoid hash‑routing (`#/route`). Use the **History API** for client‑side navigation and keep proper, crawlable URLs.
* It's fine to inject anchors with JS as long as the final HTML contains `<a href>`. 

**Status codes & SPA errors**

* Return meaningful HTTP codes: `404` for not found, `410` for gone, `301/308` for moves.
* For client‑side routes that fail, either JS‑redirect to a server `/not-found` (404) or inject `<meta name="robots" content="noindex">` on true error views.
* Avoid **soft 404s** (rendering an error message on a 200 page).

**Canonicals via JS**

* Prefer static HTML canonicals. If you must inject with JS, ensure it's the **only** canonical link on the page and resolves to the final preferred URL.

**Robots meta via JS**

* If the initial HTML ships `noindex`, Google may skip rendering and never see your JS change. Only inject `noindex` dynamically when you're sure you don't want that page indexed.

**Structured data**

* You can inject JSON‑LD with JS. Validate with **Rich Results Test** and monitor in Search Console.

**Web components & visibility**

* Google flattens shadow DOM, but only indexes what’s **visible in rendered HTML**. Use `<slot>` where needed and verify rendered output in tools.

**Images & lazy‑loading**

* Implement lazy‑load in a search‑friendly way (native `loading="lazy"` for `<img>`/`<iframe>`) or a well‑supported library.
* Don't lazy‑load content that’s **above the fold**.

**Accessibility & progressive enhancement**

* Pages should communicate meaning with JS **off** (basic content/links present). This helps both users and bots.

**Testing toolkit**

* Search Console: **URL Inspection** (live test), **Crawl stats**, **Page indexing**.
* Validate rendered HTML, links, canonicals, robots meta, and structured data.

**SPA checklist (McCal)**

* [ ] Real `<a href>` links for all internal navigation.
* [ ] History API routing; no `#/` fragments for primary content.
* [ ] Server route for 404 with correct status.
* [ ] One canonical per route; sitemaps list canonical routes only.
* [ ] Critical images/text present without waiting on blocked resources.

### 7Q) Fix Search‑related JavaScript problems (diagnose → fix → verify)

**What to expect from Googlebot & WRS**

* Crawling/rendering focuses on **essential content**; non‑essential endpoints (analytics, error beacons) may be skipped.
* Client‑side analytics won’t reflect full bot behavior. Use **Search Console → Crawl stats** for reality.

**Debug workflow**

1. **Test rendering**: Use **URL Inspection (live test)** or **Rich Results Test** to see rendered DOM, loaded resources, console logs.
2. **Log JS errors** (optional in staging):

```js
window.addEventListener('error', function(e){
  const msg = [e.message, 'URL:'+e.filename, 'Line:'+e.lineno+','+e.colno, 'Stack:'+(e.error&&e.error.stack||'(none)')].join('
');
  // TEMP: surface during active debugging only
  (function(id){
    let el = document.getElementById(id); if(!el){ el=document.createElement('pre'); el.id=id; el.style.whiteSpace='pre-wrap'; document.body.prepend(el);} 
    el.textContent += (el.textContent?''

':'') + msg;
  })('rendering-debug-pre');
  // Remote log
  navigator.sendBeacon && navigator.sendBeacon('https://example.com/logError', msg);
});
```

3. **Fix soft‑404s in SPAs**: error views must not return `200`. 

   * Redirect to a server route that returns **404**:

```js
fetch(`/api/products/${id}`).then(r=>r.json()).then(d=>{ if(!d.exists){ location.href='/not-found'; }});
```

* or dynamically add **noindex** on true error views:

```js
fetch(`/api/products/${id}`).then(r=>r.json()).then(d=>{ if(!d.exists){ const m=document.createElement('meta'); m.name='robots'; m.content='noindex'; document.head.appendChild(m);} });
```

4. **Permissions**: Googlebot declines user permission prompts (camera, mic, geolocation). Provide non‑permission fallbacks.
5. **Fragments**: Don't use `#/route` for primary content. Use **History API** and real paths.
6. **No persistent state**: WRS doesn't retain cookies/localStorage/sessionStorage across loads. Don't rely on them for serving content.
7. **Fingerprint assets**: Use filenames like `main.2bb85551.js` so Googlebot fetches fresh code when you deploy.
8. **Feature‑detect + polyfill**: If a critical API (e.g., WebGL) is missing, degrade gracefully or server‑render.
9. **Protocol limits**: Provide HTTP fallbacks; Googlebot doesn't use WebSockets/WebRTC to retrieve main content.
10. **Verify again**: Re‑run **URL Inspection** / **Rich Results Test** until you get clean output.

### 7R) Lazy‑loading & infinite scroll that Google can index

**Lazy‑loading fundamentals**

* Load content when it enters the **viewport** without requiring user input.
* Prefer native attributes (`loading="lazy"` for `<img>`/`<iframe>`) or **IntersectionObserver** (with polyfill) or a well‑supported library.
* Don't lazy‑load content that’s **above the fold**.

**Checklist**

* [ ] Images/videos have real `src`/`srcset` in **rendered HTML** when visible.
* [ ] No scroll/click required for above‑the‑fold content.
* [ ] Validate in **URL Inspection**: rendered HTML contains the expected `<img src>`/`<video src>`.

**Infinite scroll → paginated, indexable pages**

* Give each chunk a **stable URL** (e.g., `?page=12`).
* Ensure each page’s content is consistent over time.
* Link sequential pages (`rel=next/prev` is deprecated for Google, but internal links still help discovery).
* When a new chunk becomes primary, update the URL via **History API** so users can share/refresh into that state.

### 7S) Valid HTML metadata (head hygiene)

**Use only valid elements inside `<head>`**
Allowed: `title`, `meta`, `link`, `script`, `style`, `base`, `noscript`, `template`.

**Avoid invalid elements in `<head>`**
`iframe`, `img`, etc. If you must include them, place **after** all valid head metadata—Google stops parsing head at the first invalid element.

**Practical tips**

* Keep titles unique and descriptive; meta descriptions succinct and honest.
* Ensure head markup is valid to avoid Google ignoring later tags (canonicals, structured data, etc.).

### 7T) Control what you share with Google

**Why you might want to hide content**

* **Restrict sensitive data:** Some data is for logged‑in or on‑site users only. Block crawling to keep it out of Search.
* **Filter out low‑value pages:** If users can post or auto‑generate low‑quality content, hiding it prevents negative ranking effects.
* **Prioritize crawl budget:** On large sites, blocking duplicates or unimportant pages lets Google focus on key content.

**How to block content**

1. **Remove content entirely**
   Guaranteed removal. If it's not on the internet, it's not indexable.

2. **Password‑protect private files**
   Works for any file type. Stops Google and everyone else unless authorized.

3. **Use `noindex` meta or header**

   ```html
   <meta name="robots" content="noindex"> 
   ```

   Prevents appearance in Search but still allows access via direct link. Ideal for staging, duplicates, or ephemeral pages.

4. **Disallow crawling in `robots.txt` (for media)**
   Useful for **images** and **videos**:

   ```
   User-agent: Googlebot-Image
   Disallow: /private-media/
   ```

   Google only indexes media it can crawl.

5. **Opt out of specific Google properties**
   Use property‑specific exclusion mechanisms (e.g., Google Shopping, Hotels, Vacation Rentals) if you want to stay indexed elsewhere but not in that service.

**McCal guideline**

* Keep confidential client galleries and internal assets password‑protected, not just blocked in robots.txt.
* Use `noindex` for temporary campaign pages or sandboxed prototypes.
* Avoid blocking JavaScript, CSS, and image folders that are essential to rendering public pages.