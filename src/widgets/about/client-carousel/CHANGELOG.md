# About Widgets Changelog

## Version 1.5.5 - Improved Logos & Organized Structure (2025-01-14)

### ✨ Client Carousel v1.1.5 Features
- **Updated Logo URLs**: Enhanced quality logos for Penn State, The Globe, Watchful Shepherd, and Voyage Visuals
- **Organized File Structure**: Moved to `src/widgets/about/client-carousel/` for better organization
- **Better Logo Quality**: High-resolution logos with improved visibility and branding
- **Consistent Branding**: Professional logo presentation across all clients
- **Maintained Functionality**: All v1.1.4 features preserved (shuffling, seamless loop, etc.)

### 🖼️ Logo Improvements
- **Penn State**: High-quality FreebieSupply logo with proper branding
- **The Globe**: Updated to latest 2024 Point Park University Globe header logo
- **Watchful Shepherd**: New 2024 official logo from watchful.org
- **Voyage Visuals**: Professional V logo from their website assets
- **Enhanced Visual Appeal**: Better contrast and readability on dark backgrounds

### 📂 Structure Improvements
- **Organized Directory**: Moved from `about-widgets` to `about/client-carousel/` structure
- **Version Control**: Maintained all previous versions in organized `versions/` folder
- **Documentation**: Updated README and CHANGELOG in new location
- **Simplified Access**: Cleaner file organization for easier maintenance

## Version 1.5.4 - Randomized Order & Seamless Loop (2025-01-14)

### ✨ Client Carousel v1.1.4 Features
- **Random Client Order**: Fisher-Yates shuffle algorithm randomizes client display on each page load
- **Seamless Infinite Loop**: Triple client array creates gapless continuous scrolling
- **Enhanced Animation**: Increased duration to 45s for smoother, more relaxed scrolling
- **Dynamic Experience**: Every visitor sees clients in different random order
- **Optimized Performance**: Larger track width (calc(200px * 60)) for seamless triple-loop

### 🎯 Animation Improvements
- **Shuffle Algorithm**: Professional Fisher-Yates implementation for true randomization
- **Triple Array System**: Three complete client copies eliminate animation gaps
- **Smoother Timing**: 45-second animation duration prevents rushed feeling
- **Infinite Precision**: translateX calculation optimized for 60-item track width
- **Hover Interaction**: Maintains pause-on-hover for user engagement

### 📱 Technical Enhancements
- Enhanced JavaScript with shuffleArray() function
- Triple client array generation for seamless looping
- Optimized CSS keyframe calculations for larger track
- Maintained all v1.1.3 logo and container improvements

## Version 1.5.3 - Transparent Logos & Larger Containers (2025-10-05)

### ✨ Client Carousel v1.1.3 Features
- **Transparent Background Logos**: Updated with high-quality transparent PNG versions
- **Larger Logo Containers**: Increased from 160x100px to 180x110px for better visibility
- **Enhanced Image Dimensions**: Logo max size increased to 140x80px from 120x70px
- **University Logos Updated**: Carnegie Mellon and University of Pittsburgh with crisp transparent versions
- **New York Post Enhancement**: Professional transparent logo for better brand recognition

### 🎯 Visual Improvements
- **Carnegie Mellon**: High-quality transparent logo from SeekVectors
- **University of Pittsburgh**: Clean PNG version from PNGMart with transparent background  
- **New York Post**: Professional transparent version from LibLogo
- **Better Proportions**: Larger containers accommodate logos without cramping
- **Mobile Responsive**: Updated mobile sizes (140x90px containers, 100x60px logos)

### 📱 Technical Enhancements
- Animation calculations updated for new container sizes (200px width)
- Improved mobile breakpoints with larger touch targets
- Better logo scaling and aspect ratio preservation
- Enhanced carousel smoothness with larger logo spacing

---

## Version 1.5.2 - Premium Official Logos (2025-10-05)

### ✨ Client Carousel v1.1.2 Features
- **Center for Media Innovation**: Updated to official CMI main logo from Point Park University
- **Next Generation News**: Now using high-quality PMP logo from official website files
- **Point Park University**: Keeping official PPU horizontal white logo for consistency
- **Enhanced Brand Recognition**: All major clients now display with premium official logos

### 🎯 Logo Source Improvements
- **CMI Logo**: Direct from Point Park's official media assets for authentic branding
- **PMP/Next Gen**: 200x200px optimized logo from production website files
- **Maintained Quality**: Pittsburgh Magazine and previous improvements retained
- **Professional Standards**: All logos now meet premium quality standards

---

## Version 1.5.1 - High-Quality Logos Update (2025-10-05)

### ✨ Client Carousel v1.1.1 Features
- **Premium Logo Sources**: Updated key client logos with high-quality official images
- **Western PA Press Club**: Now using official Squarespace-hosted transparent logo  
- **Yinzers Meet**: High-resolution Wix-hosted logo with better brand recognition
- **Terrible Tailgate**: Official yellow logo from Steeler Nation for authentic branding
- **Improved Recognition**: Better logo quality makes client partnerships more prominent

### 🎯 Logo Quality Enhancements
- **Official Sources**: Direct links to organization-hosted logos for authenticity
- **Higher Resolution**: Crisp, clear logos that scale perfectly on all devices
- **Brand Consistency**: Official colors and typography maintained
- **Professional Appearance**: Enhanced credibility through quality brand representation

---

## Version 1.5.0 - Enhanced Client Carousel (2025-10-05)

### ✨ Client Carousel v1.1.0 Features
- **Better Logo Sources**: Improved URLs for major brands and publications with higher quality images
- **Text Fallback System**: Professional text-based logos automatically display when images fail to load
- **Enhanced Visual Design**: Gradient backgrounds, improved hover effects, and better typography
- **Improved Error Handling**: Graceful degradation with automatic fallback activation
- **Mobile Optimization**: Better scaling and spacing on smaller screens

### 🎯 Logo Quality Improvements
- **New York Post**: High-quality official logo from logos-world.net
- **Pittsburgh Magazine**: Official logo from company website
- **Universities**: Wikipedia Commons SVG logos for Carnegie Mellon, University of Pittsburgh, Penn State
- **Text Alternatives**: All clients now have professional text-based fallbacks

### 📱 Enhanced User Experience
- **Smoother Animations**: Increased carousel speed to 30s for better readability
- **Better Hover Effects**: Combined transform and filter effects for premium feel
- **Progressive Loading**: Images fade in smoothly when loaded
- **Error Recovery**: Automatic switch to text logos maintains professional appearance

### 🔧 Technical Improvements
- Enhanced CSS architecture with better organization
- Improved JavaScript error handling and recovery
- Better cross-browser compatibility
- Comprehensive documentation and README

---

## Version 1.4.1 - Universal Versioning System (2025-01-23)

### ✨ Universal Widget Features
- **Clickable Version Indicator**: Fixed bottom-right corner shows current version
- **Interactive Changelog**: Click version to view complete changelog history
- **Standardized Versioning**: Following concert widget pattern for consistency
- **Professional UI**: Smooth animations and backdrop blur effects

### 🎯 Versioning Standards
- **Version Format**: `v1.4.1` following semantic versioning
- **Position**: Bottom-right corner, subtle gray text
- **Interaction**: Click to toggle changelog panel
- **Mobile Responsive**: Adapts to different screen sizes

### 📱 Changelog Panel Features
- **Complete History**: All versions from v1.0.0 to current
- **Feature Highlights**: Key improvements and additions per version
- **Professional Design**: Dark backdrop with blur effects
- **Easy Navigation**: Close button and click-outside to dismiss

---

## Version 1.4.0 - Advanced Debugging System (2025-01-23)

### ✨ Major Features
- **GitHub Asset Hosting**: All client logos now load directly from GitHub repository
- **Photo Integration**: Profile photo loads from GitHub (no Squarespace upload needed)
- **Simplified Deployment**: No need to upload 20+ logo files individually to Squarespace

### 🔗 Asset URLs Updated
- **Client Logos**: Now use `https://raw.githubusercontent.com/McCal-Codes/McCals-Website/main/assets/images/logos/`
- **Profile Photo**: Uses `https://raw.githubusercontent.com/McCal-Codes/McCals-Website/main/assets/images/caleb-mccartney-photo.jpg`
- **Resume**: Still requires Squarespace upload (PDF hosting limitation)

### 🎯 Benefits
- ✅ **Instant Loading**: Logos display immediately, no more blank spaces
- ✅ **Auto-Updates**: Change logos in GitHub, automatically updates everywhere
- ✅ **No Upload Limits**: Bypass Squarespace file restrictions
- ✅ **Easier Maintenance**: Single source of truth for all assets

### 📁 Files Reorganized
- Moved all about-related widgets to dedicated `about-widgets/` folder
- Better organization and easier navigation
- Dedicated changelog for about widget evolution

---

## Version 1.2.0 - Complete About Section (2025-01-22)

### ✨ New Features
- **Complete About Widget**: Combined bio, photo, reviews, and client carousel in one widget
- **Reviews Section**: Added LinkedIn and Google testimonials
- **Enhanced Mobile**: Improved responsive design for all screen sizes

### 🎨 Design Improvements
- **Dark Liquid Glass**: Consistent professional aesthetic
- **Smooth Animations**: Enhanced hover effects and transitions
- **Better Typography**: Improved readability and hierarchy

### 📱 Mobile Optimization
- Responsive grid layouts for reviews
- Optimized carousel for touch devices
- Improved button layouts on small screens

---

## Version 1.1.0 - Client Carousel Integration (2025-01-21)

### ✨ Major Features
- **Client Logo Carousel**: Infinite scrolling showcase of client logos
- **Interactive Elements**: Hover effects and clickable logos
- **Statistics Display**: Client count, projects, and experience metrics

### 🎨 Visual Features
- **Smooth Scrolling**: 25-second infinite loop animation
- **Hover Effects**: Logos transition from grayscale to full color
- **Glass Morphism**: Professional backdrop blur effects

### 🔧 Technical Implementation
- **Fallback System**: Placeholder images if logos fail to load
- **Lazy Loading**: Performance optimization for images
- **Error Handling**: Graceful degradation for missing assets

### 📊 Client Showcase
- 20+ professional clients including:
  - New York Post
  - Pittsburgh Magazine
  - Point Park University
  - Carnegie Mellon University
  - University of Pittsburgh
  - And many more...

---

## Version 1.0.0 - Initial About Section (2025-01-20)

### ✨ Core Features
- **Professional Bio**: Comprehensive about section with current status
- **Photo Integration**: Professional headshot display
- **Call-to-Action Buttons**: Resume download and contact links
- **Squarespace Ready**: Optimized for Squarespace Code Block embedding

### 🎨 Design System
- **Dark Theme**: Professional dark color scheme
- **Glass Effects**: Modern backdrop blur and transparency
- **Responsive Layout**: Mobile-first design approach

### 📋 Content Structure
- Professional photography background
- Current education status (Point Park University)
- Work experience highlights
- Skills and expertise areas
- Contact information and links

### 🛠️ Technical Foundation
- **Self-Contained CSS**: No external dependencies
- **Unique Class Names**: `ss-` prefix to avoid conflicts
- **Cross-Browser Support**: Works in all modern browsers
- **Performance Optimized**: Minimal load impact

---

## File Structure

```
about-widgets/
├── complete-about-squarespace.html      # ⭐ RECOMMENDED - Full about section
├── about-section-squarespace.html       # Bio and photo only
├── client-carousel-squarespace.html     # Standalone client carousel
├── client-carousel-test.html            # Local testing version
├── CHANGELOG.md                         # This changelog
└── README.md                           # Setup and usage guide
```

---

## Upcoming Features (Roadmap)

### Version 1.4.0 - Advanced Features
- [ ] **Dynamic Statistics**: Real-time project count updates
- [ ] **Client Testimonials**: Integration with client reviews
- [ ] **Portfolio Preview**: Mini gallery integration
- [ ] **Contact Form**: Direct contact widget integration

### Version 1.5.0 - Performance & SEO
- [ ] **Schema Markup**: Structured data for better SEO
- [ ] **WebP Support**: Next-gen image format optimization
- [ ] **Preloading**: Strategic resource preloading
- [ ] **Analytics**: Built-in interaction tracking

---

## Support & Documentation

- **Setup Guide**: See `README.md` for detailed installation instructions
- **Customization**: All widgets support easy color and sizing modifications
- **Compatibility**: Tested with Squarespace 7.1+ and all major browsers
- **Updates**: Monitor this changelog for new features and improvements

---

**Maintainer**: Caleb McCartney  
**Repository**: https://github.com/McCal-Codes/McCals-Website  
**License**: MIT  
**Last Updated**: January 23, 2025