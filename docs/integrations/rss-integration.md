# RSS Integration Patterns (Podcast & Blog Widgets)

> Purpose: Standardize resilient RSS feed consumption with caching, fallbacks, and accessibility for widgets (e.g., Podcast Feed v1.9.5).
> Status: Active

---
## 1. Flow Overview
```
Remote RSS URL → Fetch & Parse → Normalize Episode Objects → Cache Snapshot → Render Cards → Inject Structured Data (optional)
```

## 2. Normalized Episode Schema
```ts
interface EpisodeMeta {
  id: string;          // Stable (prefer GUID from feed)
  title: string;
  description: string; // Sanitized HTML or plain text
  pubDate: string;     // ISO 8601
  audioUrl?: string;   // Enclosure URL
  image?: string;      // Episode or show artwork
  duration?: string;   // As provided (hh:mm:ss or mm:ss)
  transcript?: string; // Optional transcript text or URL
}
```

## 3. Fetch & Parse Strategy
- Use `fetch()` with `Accept: application/rss+xml, text/xml, */*`.
- Fallback parse: DOMParser → XPath/query selectors.
- Sanitize description (remove script/style, dangerous urls).

## 4. Caching Layers
1. In-memory (session) for immediate repeat renders.
2. `localStorage` time-boxed snapshot (10–30 min TTL).
3. Static embedded fallback (hardcoded HTML list) if network fails.

```js
const KEY='podcast-feed-cache-v1'; const TTL=15*60*1000;
function getCache(){try{const o=JSON.parse(localStorage.getItem(KEY)||'null'); if(o && Date.now()-o.t<TTL) return o.d;}catch{} return null;}
function setCache(d){try{localStorage.setItem(KEY,JSON.stringify({t:Date.now(),d}));}catch{}}
```

## 5. Error Resilience
| Scenario | Recovery |
|----------|----------|
| Network error | Use cached snapshot → else static fallback |
| Parse error | Log diagnostic + show simplified list |
| Missing audio | Render without audio controls (graceful degradation) |
| CORS block | Use proxy (document requirement) |

## 6. Accessibility Patterns
- Each episode rendered as `article` with `tabindex="0"` if interactive.
- Use `aria-label` or visually hidden headings for screen reader clarity.
- Transcript toggle: `button[aria-pressed]` controlling a collapsible region.

## 7. Structured Data (Optional)
Inject PodcastEpisode schema (limit count to reduce size):
```js
function injectPodcastSchema(episodes){
  if(document.getElementById('structured-data')) return;
  const script=document.createElement('script');
  script.type='application/ld+json'; script.id='structured-data';
  script.textContent=JSON.stringify({
    '@context':'https://schema.org', '@graph': episodes.slice(0,10).map(ep=>({
      '@type':'PodcastEpisode', name:ep.title, datePublished:ep.pubDate, description:ep.description?.slice(0,160)
    }))
  });
  document.head.appendChild(script);
}
```

## 8. Security & Sanitization
- Strip inline event handlers from descriptions.
- Remove `<script>` / `<style>` tags.
- Whitelist only safe attributes (`href`, `src`, `alt`, `title`, `aria-*`).

## 9. Performance Tips
- Defer transcript hydration until user expands.
- Use single IntersectionObserver for reveal.
- Batch DOM creation with document fragments.

## 10. Fallback Embedding Template
```html
<ul class="podcast-fallback" aria-label="Recent Episodes">
  <li>Episode 9 (Fallback) — Description summary…</li>
  <li>Episode 8 (Fallback) — Description summary…</li>
</ul>
```

## 11. TODO / Future Enhancements
- TODO: Add server-side snapshot endpoint for feed proxying (reduces client parse cost).
- TODO: Implement transcript fetch with caching & diff detection.
- TODO: Add performance metrics logging (episodes count, parse time).

---
*Last updated: 2025-11-19*
