# Admin Dashboard Widget

Comprehensive admin monitoring dashboard for McCal Media workspace health, API status, manifest management, widget validation, and system diagnostics.

**⚠️ IMPORTANT:** Changelogs and versioning are mandatory for this widget. See [CHANGELOG.md](CHANGELOG.md) for complete version history and development guidelines.

## Current Version

**v1.3.0** (Latest) ⭐

## Features

### Core Metrics (6-Card Status Grid)
- **🔌 API Health**: Real-time API endpoint status, cache hit rates
- **📦 Manifests**: Portfolio counts (Concert, Events, Journalism)
- **🎨 Widgets**: Total widget count, valid HTML validation, active versions
- **💻 System**: Environment detection (dev/prod), page URL, timestamp
- **⚡ Cache**: Cache TTL, stale window, rate limiting configuration
- **🔨 Build**: Dashboard version, build date, Node environment

### Expandable Sections
1. **📂 Portfolio Status**: Quick view of all portfolio types with item counts
2. **📊 Analytics & Performance**: Detailed metrics on API performance, cache performance, request volume, resource usage, deployment info, and traffic sources
3. **📈 Manifest Analytics**: Per-portfolio breakdown (bands, images, last updated, size)
4. **🐛 Diagnostics & Logs**: Recent events and system health checks
5. **🔗 Quick Links**: Buttons linking to reports, widgets, manifests, CI/CD, and GitHub

## Versions

### v1.3.0 (Current) ⭐
**Released:** 2025-12-06

**Improvements - Portfolio Widget Styling:**
- Dark theme with system-ui font stack matching concert/journalism portfolio widgets
- Glass-like cards with backdrop blur and subtle borders for depth
- Masonry-inspired grid layout for better visual organization
- Portfolio widget color scheme with accent colors and smooth gradients
- Refined status badges with portfolio-style gradient backgrounds
- Improved hover states and interactive feedback patterns
- Critical CSS optimization for performance
- Better typography hierarchy and improved readability
- Enhanced responsive design with mobile-first approach
- Modal changelog system with full accessibility support

**Note:** When adding new features to admin dashboard, create a new version (v1.4.0, etc.) rather than modifying v1.3.0. Follow the versioning convention in `src/widgets/*/versions/` directory.

### v1.2.0
**Released:** 2025-12-06

**Improvements:**
- Complete CSS reorganization with semantic sections
- Improved visual hierarchy with gradients
- Enhanced header layout
- Modernized status badges
- Better metric rows with hover effects

**Copy for Squarespace (v1.3.0):**
```html
<div class="mccal-widget" data-src="https://cdn.jsdelivr.net/gh/McCal-Codes/McCals-Website@admin-dashboard@1.3.0/src/widgets/_admin/admin-dashboard/versions/v1.3.0-admin-dashboard.html"></div>
<script>
  (function(){
    var c = document.querySelector('.mccal-widget');
    if(!c) return;
    var s = c.getAttribute('data-src');
    if(!s) return;
    fetch(s,{mode:'cors'}).then(r=>r.ok?r.text():Promise.reject()).then(t=>c.innerHTML=t).catch(()=>{});
  })();
</script>
```

### v1.0.0
**Released:** 2025-12-06

Initial release with basic 3-card dashboard, expandable analytics sections, and comprehensive monitoring features.

## Development

### Local Preview
1. Start dev server: `npm run dev`
2. Navigate to: `http://localhost:3000`
3. Test dashboard functionality at: `/src/widgets/_admin/admin-dashboard/versions/v1.2.0-admin-dashboard.html`

### Features

**Demo Mode:** Automatically enables in development (localhost) to avoid CORS issues. Shows "Demo Mode" status for API health.

**Environment Detection:**
- Development: localhost or 127.0.0.1 → Shows demo mode, simulated data
- Production: Public domain → Attempts real API connections

**Dynamic Metrics:**
- Timestamp updates every minute
- API health checks with fallback to demo mode
- Manifest loading from local JSON files
- Analytics population with simulated realistic data

## Configuration

All configuration is done via data attributes in HTML. No backend required.

## Accessibility

- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation for expandable sections
- Sufficient color contrast (WCAG AA)
- Responsive design for all screen sizes

## Performance

- **File Size:** ~15KB (HTML + CSS + JS)
- **No External Dependencies:** All CSS and JavaScript inline
- **Self-Contained:** Works in Squarespace Code Blocks
- **Responsive:** Mobile-first design with breakpoints at 1200px, 768px, 480px

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Android)

## Notes

- Admin-use only (not for public deployment)
- Consider password protection in production
- Cache TTL and rate limiting values are informational
- Manifest counts update dynamically based on actual files

## See Also

- Main README: `/README.md`
- Widget Standards: `/docs/standards/widget-standards.md`
- Performance Standards: `/docs/standards/performance-standards.md`
