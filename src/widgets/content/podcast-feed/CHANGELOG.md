# Changelog â€” Podcast Feed Widget

## v2.0.0 (2025-10-25) - Performance Optimization & Accessibility Enhancement

### Performance 🚀
- **Lazy Loading**: Debug panel now loads on-demand, reducing initial HTML size and improving page load times
- **Deferred Initialization**: Debug panel creation moved to user interaction, eliminating unnecessary DOM elements on initial render

### Accessibility ♿
- **Episode Badges**: Added "New" badges for episodes published within the last 7 days to highlight fresh content
- **Enhanced Button Styling**: CTA buttons now use standardized McCal accent color variables for consistent theming
- **Version Indicator**: Added version display in debug panel for better transparency and debugging

### UI/UX 🎨
- **McCal Accent Variables**: All buttons now use `--mc-accent-black`, `--mc-accent-slate`, and `--mc-accent-gold` for brand consistency
- **Badge System**: Date-based episode badges with subtle styling that doesn't interfere with card aesthetics
- **Improved Debug Panel**: Lazy-loaded debug interface with comprehensive performance metrics

### Developer Experience 🛠️
- **Performance Monitoring**: Enhanced debug panel with load times, episode counts, and cache status tracking
- **Lazy Loading Pattern**: Established pattern for deferring non-critical UI elements until needed

## v1.9.5 (2025-10-24) - Auto-Hydrating Episode List

### Data
- Added live RSS hydration with caching so new episodes publish automatically without manual edits.
- Seeded the fallback episode list with Ep 9 (Austin Carns) and refreshed legacy titles to match current show naming.

### UI
- Updated widget subtitle and invite copy to reflect Caffeinated Connections branding refresh.

## v1.9 (2025-09-25) - Calendar Invite Refresh

### UI
- Added a hero description block that mirrors the widget styling and introduces the show before the CTA.
- Enlarged the coffee booking button while keeping gradients and hover treatments consistent with existing widgets.

### Data
- Introduced `data-podcast-description` with an RSS-driven fallback so the intro stays in sync with the feed.
## v1.7 (2025-09-19) â€” Version Archive & Testing Suite ðŸ“‹
### Version Management System ðŸ› ï¸
- **NEW**: Complete version archive system with historical implementations
  - `versions/v1.4.html` - Performance optimized version with audio fixes
  - `versions/v1.5.html` - Enhanced styling and mobile responsiveness  
  - `versions/v1.6.html` - Latest stable with all features integrated
  - `test-v1.6.html` - Testing environment for v1.6 validation
- **IMPROVED**: Development workflow with version tracking and testing capabilities
- **IMPROVED**: Deployment options with multiple stable versions available

## v1.0 (2025-09-16) â€” Initial Release ðŸŽ§

### âœ¨ New Features
- **RSS Feed Integration**: Direct parsing of podcast RSS feeds with intelligent caching
- **Liquid Glass Design**: Modern glassmorphism aesthetic matching concert portfolio v2.2 
- **Masonry Layout**: Responsive 3â†’2â†’1 column layout with natural card flow
- **Episode Cards**: Clean title, description, podcast branding, and publish dates
- **Progressive Loading**: Smooth staggered animations with intersection observer
- **Performance Optimized**: Built on shared portfolio API backend for caching
- **Debug Mode**: Performance metrics and load time monitoring
- **Share Integration**: Episode sharing with clean share buttons

### ðŸŽ¨ Design Elements
- **Glassmorphism Cards**: Semi-transparent backgrounds with backdrop blur
- **Liquid Glass Buttons**: Animated share and expand buttons with glass effect
- **Typography**: Clean hierarchy with episode titles and descriptions
- **Responsive Grid**: Mobile-first approach with seamless breakpoints
- **Dark/Light Adaptation**: Automatic theme detection and styling

### ðŸš€ Performance
- **RSS Caching**: 10-minute TTL reduces redundant feed requests
- **Lazy Loading**: Cards load progressively as they enter viewport
- **Optimized Animations**: Hardware-accelerated transforms and opacity
- **Error Handling**: Graceful fallbacks for failed RSS requests
- **Memory Efficient**: Minimal DOM manipulation with smart updating

### ðŸ“± Platform Support
- **Squarespace Compatible**: Drop-in Code Block implementation
- **Mobile Responsive**: Touch-friendly interface with proper spacing
- **Cross-browser**: Modern browser support with fallbacks
- **RSS Standard**: Compatible with RSS 2.0, Atom, and iTunes extensions

### Configuration Options
- `data-feed-url`: RSS feed URL (required)
- `data-max-episodes="6"`: Episode display limit
- `data-show-descriptions="true"`: Toggle episode descriptions
- `data-show-dates="true"`: Toggle publication dates
- `?debug=true`: Enable performance monitoring overlay

---

## v1.5 (2025-09-16) â€” Performance Optimized & Audio Fixed ðŸš€

### âš¡ Performance Improvements
- **Instant Loading**: Load time reduced from 16+ seconds to under 200ms
- **Fallback-First Strategy**: Immediately display content while background RSS fetch attempts
- **Smart Caching**: Updated cache key (v6) with better TTL management
- **Single Proxy Attempt**: Streamlined to one fast proxy with 3-second timeout
- **Background Updates**: RSS fetching moved to non-blocking background process

### ðŸŽµ Audio Fixes
- **Working Audio URLs**: Added proper MP3 URLs for all episodes in fallback data
- **CORS Headers**: Added crossOrigin="anonymous" for better audio loading
- **Error Handling**: Improved audio error states and user feedback
- **Audio Status Tracking**: Better debug information for audio player states

### ðŸ› Bug Fixes
- **RSS Feed 403 Error**: Handles blocked RSS feed gracefully with immediate fallback
- **Cache Miss Issue**: Fixed caching mechanism with proper key versioning  
- **Empty Audio URLs**: Fallback data now includes working audio file paths
- **Debug Panel Accuracy**: All debug metrics now reflect actual performance

### ðŸ”§ Technical Optimizations
- **AbortSignal Timeout**: 3-second timeout prevents hanging requests
- **Memory Management**: Better cleanup of audio resources and event listeners
- **Error Resilience**: Graceful degradation when RSS or audio services fail
- **Load Strategy**: Content-first approach prioritizes user experience

### Expected Performance Metrics
```
Load Time: <200ms (vs 16,000ms)
Episodes: 6
Cache Status: MISS â†’ HIT (after first load)
RSS Requests: 0 (background)
Audio Players: 6
Fallback Used: YES (by design)
Active Player: NONE â†’ [episode-id] when playing
Audio Status: idle â†’ loading â†’ playing/error
```

---

## Development Inspiration

## v1.1 (2025-09-16) â€” Audio Previews & Platform Integration ðŸŽµ

### âœ¨ New Features
- **30-Second Audio Previews**: Embedded audio player with play/pause and progress controls
- **Platform Integration**: Direct Spotify and Apple Podcasts episode links
- **Enhanced Dark Styling**: Matches your website's dark card aesthetic perfectly
- **Smart Audio Management**: Only one episode plays at a time, auto-stops after 30 seconds
- **Improved Typography**: Better hierarchy with larger titles and refined spacing
- **Platform Icons**: Official Spotify and Apple Music branding with hover effects

### ðŸŽ¨ Design Enhancements
- **Dark Card Theme**: Rich dark backgrounds with subtle borders and shadows
- **Liquid Glass Audio Player**: Semi-transparent player controls with backdrop blur
- **Enhanced Visual Hierarchy**: Larger episode titles, better metadata layout
- **Smooth Hover Effects**: Cards lift on hover with enhanced shadows
- **Professional Branding**: Podcast avatar, RSS icon, and platform badges

### ðŸš€ Performance Improvements
- **Audio Lazy Loading**: Audio files only load when play button is clicked
- **Memory Management**: Automatic cleanup when switching between episodes  
- **Enhanced Debug Mode**: Additional metrics for audio player performance
- **CORS Proxy Update**: Better RSS feed fetching with improved error handling

### ðŸ“± Mobile Enhancements
- **Touch-Friendly Controls**: Larger audio player buttons for mobile
- **Responsive Platform Links**: Stack vertically on smaller screens
- **Optimized Loading States**: Better skeleton animations for all components

---

## Development Inspiration

Built from analyzing the existing Elfsight RSS feed widget structure, extracting key design patterns:
- Masonry container with positioned cards
- Episode metadata display (title, description, date, podcast branding)
- Share button functionality and RSS source attribution
- Responsive card scaling and smooth transitions

Integrated with McCal Media's performance-first architecture and liquid glass design system for consistent branding and optimal user experience.


