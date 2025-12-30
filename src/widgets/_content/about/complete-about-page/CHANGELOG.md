# Complete About Page Widget Changelog

## Version 2.0.0 - 2026 Freelance & Events Revamp (2025-12-30)

### 🚀 Major Strategic Shift

- **Caleb McCartney First**: Pivoted the narrative to focus on Caleb as a premier freelancer, with McCal Media serving as a supporting figurehead.
- **Niche Focus**: Re-optimized content for **Concert**, **Corporate**, and **Event Photography** while maintaining **Photojournalism** roots.
- **Refined Branding**: Standardized all URLs to `mcc-cal.com` and modernized contact info to `contact@mcc-cal.com`.
- **Modernized Bio**: Streamlined biography to remove outdated internship mentions and project Caleb as an established professional in 2026.
- **Leading Brands Expansion**: Added 7 new prominent clients to the carousel: **OSH360**, **IUP**, **WVU**, **Roxian Theatre**, **Pittsburgh Plays**, **Covalent**, and **OSU**.
- **Visual Excellence**: Implemented **Bio Photo Depth** with a pulsating ambient aura and upgraded the carousel to **True Glassmorphism 2.0** with elastic micro-interactions.
- **SEO & Schema.org**: Complete overhaul of JSON-LD data to prioritize freelance keywords and services.

## Version 1.6.0 - Phase 2 Visual Polish (2025-12-15)

### 🎨 Phase 2 Enhancements

- **Gradient Background**: Added sophisticated diagonal gradient to bio section for depth and premium feel
- **Enhanced Photo Presentation**: Small circular profile picture (150px) centered at top with hover effects
- **Skills/Services Badges**: Added 5 interactive skill badges (Event Photography, Photojournalism, Commercial Work, Brand Storytelling, Content Creation)
- **Improved Typography**: Increased font sizes, better line-height, and first paragraph emphasis
- **Navigation Menu Spacing**: Added 80px top margin to prevent overlap with sticky navigation
- **Simplified Statistics**: Reduced to 3 key metrics (Happy Clients, Projects, Years Experience) with intelligent 4-layer hybrid system
  - **Layer 1**: Loads from `stats-config.json` for manual control
  - **Layer 2a**: Counts from portfolio manifests (photojournalism, concert, event) for accurate project counts
  - **Layer 2b**: Counts from client carousel data as backup
  - **Layer 3**: Falls back to date-based calculations (years × averages)
  - Years always calculated from 2019 start date
  - Never breaks, always shows reasonable numbers
  - Console logs show which source was used (📋 config, 🎠 carousel, 📊 manifests, 🧮 calculated)
- **Layout Optimization**: Changed to vertical layout with centered content for better desktop experience
- **Read More Functionality**: Added expandable bio with smooth animation and toggle button
- **Minimal Header**: Simple "About" header with clean typography

### 🎯 Design Details

- Bio section gradient: Dark to darker diagonal sweep (135deg)
- Photo hover: Lifts 5px, scales 1.02x, adds white glow effect
- Photo border: Subtle white border that brightens on hover
- Skill badges: Glassmorphism style with gradient backgrounds and hover lift
- Typography: 1.05rem base, 1.1rem for opening paragraph, 1.7 line-height
- Enhanced shadows: Deeper box-shadows for better depth perception
- Statistics: Ultra-minimal design (1.8rem numbers, lighter gray #c0c0c0, reduced weight)
- Overall approach: Clean, uncluttered, letting content breathe
- All animations use smooth 0.3-0.4s ease transitions

### 📱 Responsive Features

- Skills badges wrap gracefully on smaller screens
- Photo hover effects work on touch devices
- Spacing adjusts for mobile viewports
- All gradient effects optimized for performance

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

### From Legacy Location

- Old path: `src/widgets/about-widgets/complete-about-squarespace.html`
- New path: `src/widgets/about/complete-about-page/complete-about-squarespace.html`
- Legacy files archived in: `src/widgets/_archived/about-widgets-legacy/`

### Deployment Impact

- No changes to widget functionality or Squarespace integration
- Same HTML content, just organized in cleaner file structure
- All asset URLs and functionality preserved

### Future Development

- Complete about page widget separate from client carousel widget
- Each widget maintains its own versions and documentation
- Cleaner separation of concerns for easier maintenance

---

**Archive Date**: October 5, 2025  
**Current Status**: Production Ready ✅  
**Maintained By**: McCal Media Development Team
