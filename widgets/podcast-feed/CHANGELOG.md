# Changelog — Podcast Feed Widget

## v1.0 (2025-09-16) — Initial Release 🎙️

### ✨ New Features
- **RSS Feed Integration**: Direct parsing of podcast RSS feeds with intelligent caching
- **Liquid Glass Design**: Modern glassmorphism aesthetic matching concert portfolio v2.2 
- **Masonry Layout**: Responsive 3→2→1 column layout with natural card flow
- **Episode Cards**: Clean title, description, podcast branding, and publish dates
- **Progressive Loading**: Smooth staggered animations with intersection observer
- **Performance Optimized**: Built on shared portfolio API backend for caching
- **Debug Mode**: Performance metrics and load time monitoring
- **Share Integration**: Episode sharing with clean share buttons

### 🎨 Design Elements
- **Glassmorphism Cards**: Semi-transparent backgrounds with backdrop blur
- **Liquid Glass Buttons**: Animated share and expand buttons with glass effect
- **Typography**: Clean hierarchy with episode titles and descriptions
- **Responsive Grid**: Mobile-first approach with seamless breakpoints
- **Dark/Light Adaptation**: Automatic theme detection and styling

### 🚀 Performance
- **RSS Caching**: 10-minute TTL reduces redundant feed requests
- **Lazy Loading**: Cards load progressively as they enter viewport
- **Optimized Animations**: Hardware-accelerated transforms and opacity
- **Error Handling**: Graceful fallbacks for failed RSS requests
- **Memory Efficient**: Minimal DOM manipulation with smart updating

### 📱 Platform Support
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

## Development Inspiration

## v1.1 (2025-09-16) — Audio Previews & Platform Integration 🎵

### ✨ New Features
- **30-Second Audio Previews**: Embedded audio player with play/pause and progress controls
- **Platform Integration**: Direct Spotify and Apple Podcasts episode links
- **Enhanced Dark Styling**: Matches your website's dark card aesthetic perfectly
- **Smart Audio Management**: Only one episode plays at a time, auto-stops after 30 seconds
- **Improved Typography**: Better hierarchy with larger titles and refined spacing
- **Platform Icons**: Official Spotify and Apple Music branding with hover effects

### 🎨 Design Enhancements
- **Dark Card Theme**: Rich dark backgrounds with subtle borders and shadows
- **Liquid Glass Audio Player**: Semi-transparent player controls with backdrop blur
- **Enhanced Visual Hierarchy**: Larger episode titles, better metadata layout
- **Smooth Hover Effects**: Cards lift on hover with enhanced shadows
- **Professional Branding**: Podcast avatar, RSS icon, and platform badges

### 🚀 Performance Improvements
- **Audio Lazy Loading**: Audio files only load when play button is clicked
- **Memory Management**: Automatic cleanup when switching between episodes  
- **Enhanced Debug Mode**: Additional metrics for audio player performance
- **CORS Proxy Update**: Better RSS feed fetching with improved error handling

### 📱 Mobile Enhancements
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
