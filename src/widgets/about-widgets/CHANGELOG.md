# About Widgets Changelog

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