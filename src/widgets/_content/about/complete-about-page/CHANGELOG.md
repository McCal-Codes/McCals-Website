# Complete About Page Widget Changelog

## Version 1.5.0 - Phase 1 Enhancements (2025-12-15)

### ✨ Visual Improvements

- **Removed Heading**: Removed "About Caleb McCartney" h1 heading for cleaner, more streamlined design
- **Statistics Section**: Added professional stats grid showcasing 500+ events, 30+ clients, 5.0 rating, and 6+ years experience
- **Button Icons**: Added camera icon (📸) to "View Portfolio" button for visual interest
- **Enhanced Hover Effects**: Improved button hover states with subtle glow effect using dual box-shadows

### 🎨 Design Details

- Statistics feature gradient text effects for premium feel
- Stats section has glassmorphism background with subtle border
- Button hover now includes white glow effect for better feedback
- Mobile-responsive statistics with adjusted sizing
- Cleaner header area with direct focus on content

## Version 1.4.6 - Portfolio Link Update (2025-12-15)

### 🔗 Navigation Improvement

- **Updated Portfolio Link**: Changed "View Portfolio" button from `/featured-work` to `/featured` for consistency with site navigation
- **Better User Flow**: Aligns with the featured portfolio page routing used throughout the site
- **No Visual Changes**: Button styling and placement remain unchanged

## Version 1.4.5 - Button & Dropdown Refinements (2025-10-24)

### 🎨 Button Polish

- **Unified Styling**: Rebuilt Get In Touch, Documents, and View Portfolio buttons with matching typography, spacing, and glass borders.
- **Minimal Footprint**: Reduced padding and min-width for a lighter, more refined CTA row on desktop and mobile.
- **Consistent Palette**: Standardized text color and hover states to match current widget standards.

### 📂 Documents & Contact Menus

- **Shared Dropdown Styling**: Consolidated contact and documents menus around a single glassmorphism pattern with flex row items.
- **Mutual Exclusivity**: Opening one menu now closes the other for predictable behavior.
- **Disabled State Enhancements**: Updated CV (Coming Soon) item with clearer visual affordances.

### 📱 Mobile Experience

- **Stacked CTA Layout**: Buttons now expand to full width on small screens with even spacing.
- **Inline Dropdowns**: Menus switch to in-flow positioning on mobile to prevent overlap with the Client Testimonials section.
- **Additional Spacing**: Added bio-section margin to preserve breathing room around expanded menus.

## Version 1.4.4 - Client Carousel v1.2.3 Integration (2025-10-05)

### 🚀 Carousel Upgrade

- **Integrated v1.2.3 Client Carousel**: Replaced previous carousel logic with triple-array infinite loop, Fisher-Yates shuffle, and robust error handling
- **Branding Fixes**: Pittsburgh Union Progress logo always white; Pittsburgh Magazine logo filter for visibility
- **Performance Enhancements**: All carousel optimizations and workspace standards applied
- **Changelog Panel**: Updated to document carousel integration and improvements

### 🗂️ Structure Reorganization

- **New Location**: Moved to `src/widgets/about/complete-about-page/`
- **Separated Concerns**: Distinguished from client carousel widget
- **Clean Organization**: Dedicated directory for complete about page functionality
- **Preserved Functionality**: All v1.4.1 features maintained

### ✨ Complete About Page Features

- **Integrated Design**: Bio, photo, client carousel, and reviews in one widget
- **Professional Layout**: GitHub-hosted photo with detailed biography
- **Client Showcase**: Built-in rotating carousel of 20+ trusted brands
- **Social Proof**: LinkedIn and Google reviews display system
- **Debug System**: Interactive troubleshooting tools for development

### 🎯 Component Breakdown

- **Hero Section**: Professional headshot and introduction
- **Biography Section**: Detailed background and expertise showcase
- **Client Carousel**: Smooth rotating showcase of trusted partners
- **Reviews Section**: Social proof with testimonials
- **Debug Panel**: Development tools for troubleshooting

### 📱 Technical Features

- **Self-Contained**: All CSS and JavaScript inline for Squarespace
- **Responsive Design**: Mobile-optimized layout and interactions
- **Asset Management**: GitHub repository integration for reliable hosting
- **Error Handling**: Graceful fallbacks for failed asset loads
- **Performance Optimized**: Lazy loading and CSS animations

### 🔧 Debug Capabilities

- **Interactive Panel**: Click 🔧 button for debug status
- **Console Logging**: Detailed initialization and error reporting
- **Asset Testing**: Real-time logo loading verification
- **Performance Metrics**: Load times and error diagnostics
- **Toggle Option**: Enable/disable debug mode via `DEBUG` variable

### 📋 Available Variants

- **`complete-about-squarespace.html`**: Full-featured about page with all components
- **`about-section-squarespace.html`**: Simplified bio-focused version without carousel/reviews

## Version History (Legacy)

### v1.4.1 (2025-01-14)

- Structure reorganization and documentation
- All v1.4.1 features maintained

### v1.4.0 (2025-10-05)

- Added comprehensive debug system
- Enhanced client carousel integration
- Improved error handling and logging
- LinkedIn and Google reviews support

### v1.3.x (2025-10-04)

- Initial complete about page implementation
- Client logo carousel integration
- Professional bio layout
- GitHub asset hosting setup

### v1.2.x (2025-10-03)

- Bio section enhancements
- Photo integration improvements
- Mobile responsiveness updates

### v1.1.x (2025-10-02)

- Initial about section widget
- Basic biography and photo display
- Squarespace compatibility

### v1.0.0 (2025-10-01)

- First release of about section widget
- Simple bio and contact information
- Basic responsive design

## Migration Notes

### From Legacy Location:

- Old path: `src/widgets/about-widgets/complete-about-squarespace.html`
- New path: `src/widgets/about/complete-about-page/complete-about-squarespace.html`
- Legacy files archived in: `src/widgets/_archived/about-widgets-legacy/`

### Deployment Impact:

- No changes to widget functionality or Squarespace integration
- Same HTML content, just organized in cleaner file structure
- All asset URLs and functionality preserved

### Future Development:

- Complete about page widget separate from client carousel widget
- Each widget maintains its own versions and documentation
- Cleaner separation of concerns for easier maintenance

---

**Archive Date**: October 5, 2025  
**Current Status**: Production Ready ✅  
**Maintained By**: McCal Media Development Team
