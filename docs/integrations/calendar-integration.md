# Calendar / Scheduling Integration Patterns (Events & Admin Tools)

> Purpose: Provide a blueprint for integrating external calendar/scheduling data (Google Calendar, ICS feeds) into widgets (e.g., future Events calendar widget, admin importer).
> Status: Draft

---
## 1. Data Sources
| Source | Format | Auth | Notes |
|--------|--------|------|-------|
| Google Calendar API | JSON | OAuth / API Key | Rich metadata; requires quota management |
| Public ICS Feed | .ics (text) | None | Lightweight; limited structured fields |
| Custom Admin Backend | JSON | Token | Can enrich with manifest metadata |

## 2. Normalized Event Schema
```ts
interface CalendarEvent {
  id: string;          // Stable identifier
  title: string;       // Display name
  description?: string;// Optional rich text / markdown
  start: string;       // ISO datetime
  end?: string;        // ISO datetime
  location?: string;   // Freeform or structured
  url?: string;        // External link (ticketing, details)
  tags?: string[];     // Categorization / filtering
  image?: string;      // Cover image (portfolio aligned)
  status?: 'confirmed'|'tentative'|'cancelled';
}
```

## 3. Parsing ICS (Minimal)
```js
function parseICS(raw){
  const events=[]; const lines=raw.split(/\r?\n/); let current={};
  for(const line of lines){
    if(line==='BEGIN:VEVENT'){current={};}
    else if(line==='END:VEVENT'){if(current.uid && current.dtstart){
      events.push({ id: current.uid, title: current.summary||'Untitled', start: iso(current.dtstart), end: iso(current.dtend), location: current.location });
    }}
    else {
      const [k,v]=line.split(/:(.+)/); if(!k) continue;
      switch(k){
        case 'UID': current.uid=v; break;
        case 'DTSTART': current.dtstart=v; break;
        case 'DTEND': current.dtend=v; break;
        case 'SUMMARY': current.summary=v; break;
        case 'LOCATION': current.location=v; break;
      }
    }
  }
  return events;
  function iso(val){/* TODO: Convert YYYYMMDDThhmmssZ → ISO */ return val;}
}
```

## 4. Caching & Refresh
- Use `localStorage` TTL (e.g., 30–60 minutes) for calendar JSON.
- Provide manual refresh button in debug panel.
- Stale-while-revalidate pattern: render cached events immediately, fetch updates, then patch UI.

## 5. Filtering & Categorization
- Accept dynamic tag list discovered from events (`tags` array).
- Provide accessible tablist for filtering with roving `aria-pressed` states.

## 6. Accessibility Considerations
- Each event: `article` element with `aria-labelledby` for the title.
- Date/time formatting: include machine-readable `<time datetime="ISO">Human Format</time>`.
- Keyboard navigation: arrow traversal in calendar grid; Enter opens detail/lightbox.

## 7. Performance Patterns
- Virtualize long lists (month view) — render visible range only.
- Batch DOM: use document fragment for initial render.
- Lazy load images only when events scrolled into view.

## 8. Integration with Existing Manifests
- Map portfolio event images by slug matching or explicit mapping JSON.
- TODO: Create `scripts/utils/calendar-image-map.js` helper.

## 9. Structured Data (Optional)
Inject `Event` schema for upcoming events (limit count to avoid oversized payload):
```js
function injectEventSchema(events){
  if(document.getElementById('structured-data')) return;
  const script=document.createElement('script'); script.type='application/ld+json'; script.id='structured-data';
  script.textContent=JSON.stringify({ '@context':'https://schema.org', '@graph': events.slice(0,15).map(e=>({
    '@type':'Event', name:e.title, startDate:e.start, endDate:e.end, eventStatus:'https://schema.org/EventScheduled'
  })) });
  document.head.appendChild(script);
}
```

## 10. Admin Importer Synergy
- Admin widget can push new events to backend; backend updates canonical JSON.
- Manifest watchers react to image folder changes; calendar refresh picks up new mapping.
- Provide REST endpoint `/api/calendar` returning normalized schema.

## 11. Monitoring & Logging
- Track parse/transform time; log anomalies (e.g., missing UID).
- TODO: Add debug panel metrics (event count, last refresh age).

## 12. TODO / Future Enhancements
- TODO: Implement ICS timezone normalization.
- TODO: Add recurrence rule expansion (RRULE) support.
- TODO: Build calendar lightbox with detailed view & accessibility pattern.
- TODO: Integrate optional ticketing link analytics.

---
*Last updated: 2025-11-19*
