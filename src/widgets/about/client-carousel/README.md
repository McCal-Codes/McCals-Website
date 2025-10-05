# Client Carousel Widget

A professional client showcase carousel widget for Squarespace that displays trusted brands and partners with smooth animations and fallback systems.

## Features

### v1.2.0 - Enhanced University Branding & Larger Display
- **Specific University Logos**: Updated to exact branded versions (Point Park green, Carnegie Mellon red square)
- **Larger Logo Display**: Increased size from 140x80px to 160x90px for better visibility
- **Enhanced Branding**: Professional university logos matching official institutional identity
- **Better Recognition**: Improved visibility and brand consistency across all 22 clients
- **Maintained Excellence**: All previous functionality preserved (shuffling, seamless loop, reliable loading)

### v1.1.7 - Fixed University Logo Loading
- **Fixed Logo Issues**: Resolved Carnegie Mellon and University of Pittsburgh logo loading problems
- **Reliable Sources**: Updated to stable Logos-World CDN for consistent display
- **Enhanced Reliability**: All 22 client logos now load properly across environments
- **Better Performance**: Faster loading with reliable hosting sources
- **Maintained Excellence**: All v1.1.6 functionality preserved (22 clients, shuffling, seamless loop)

### v1.1.6 - New Clients & Updated Logo
- **New Client Partners**: Added West Hills Gazette and Capo's on Carson restaurant
- **Updated Union Progress**: High-quality retina logo from official website
- **Expanded Showcase**: Now featuring 22 trusted clients (up from 20)
- **Enhanced Animation**: Optimized 50s timing for smooth scrolling with additional clients
- **Maintained Excellence**: All v1.1.5 functionality preserved (shuffling, seamless loop, organization)

### v1.1.5 - Improved Logos & Organized Structure
- **Enhanced Logo Quality**: Updated high-resolution logos for Penn State, The Globe, Watchful Shepherd, and Voyage Visuals
- **Better Branding**: Professional logos with improved contrast and visibility
- **Organized Structure**: Moved to clean `src/widgets/about/client-carousel/` organization
- **Maintained Features**: All v1.1.4 functionality preserved (shuffling, seamless loop, etc.)
- **Simplified Maintenance**: Better file organization for easier updates

### v1.1.4 - Randomized Order & Seamless Loop
- **Random Client Order**: Fisher-Yates shuffle displays clients in different order each visit
- **Seamless Infinite Loop**: Triple client array eliminates animation gaps
- **Enhanced Animation**: 45-second smooth scrolling with optimized timing
- **Dynamic Experience**: Every page load shows unique client arrangement
- **Professional Randomization**: True Fisher-Yates algorithm for unbiased shuffling

### v1.1.3 - Transparent Logos & Larger Containers  
- **High-Quality Logos**: Professional transparent PNG versions for all major clients
- **Better Visibility**: Larger containers (180x110px) and images (140x80px)
- **Dark Theme Optimized**: Transparent backgrounds work perfectly on dark sites
- **Enhanced Readability**: Improved contrast and logo clarity

### v1.1.0 - Enhanced Logo Support
- **Improved Logo Sources**: Better URLs for major brands and organizations
- **Text Fallbacks**: Elegant text-based logos when images fail to load
- **Enhanced Styling**: Improved gradients, shadows, and hover effects
- **Better Error Handling**: Graceful degradation for missing logos
- **Mobile Optimized**: Responsive design for all screen sizes

### v1.0.0 - Base Features
- Infinite horizontal scrolling carousel
- Pause on hover functionality
- Click to visit client websites
- Loading spinner with smooth transitions
- Statistics display (clients, projects, experience)
- Fully self-contained (inline CSS/JS)

## Installation

### Squarespace Code Block
1. Copy the entire HTML content from the latest version file
2. In Squarespace, add a **Code Block**
3. Paste the HTML content
4. Save and publish

### Customization Options

#### Client Data Structure
Each client entry supports:
```javascript
{
  name: "Company Name",
  logo: "https://logo-url.com/logo.png", 
  textFallback: { 
    company: "Display Name", 
    tagline: "Short Description" 
  },
  website: "https://company.com",
  project: "Type of Work"
}
```

#### Statistics Customization
Update the stats in the HTML:
```html
<span class="ss-stat-number" id="ss-client-count">20</span>
<span class="ss-stat-number" id="ss-project-count">65+</span>
<span class="ss-stat-number" id="ss-years-experience">5+</span>
```

#### Styling Variables
Key CSS customization points:
- `--carousel-speed`: Animation duration (default: 30s)
- `--logo-size`: Logo container dimensions
- `--hover-lift`: Hover transform distance
- Color scheme variables in the CSS

## Logo Requirements

### Optimal Specifications
- **Format**: PNG with transparent background or SVG
- **Dimensions**: 200x80px display ratio (can be higher resolution)
- **File Size**: Under 100KB for fast loading
- **Background**: Transparent or designed for dark backgrounds

### Logo Sources Priority
1. **Official brand assets** from company websites
2. **Wikipedia Commons** for public organizations
3. **Logo databases** (logos-world.net, etc.)
4. **Text fallbacks** for unavailable/unclear logos

### Current Logo Status
- ✅ **Good Quality**: New York Post, Carnegie Mellon, University of Pittsburgh, Penn State
- ⚠️ **Need Improvement**: Pittsburgh Magazine, Point Park University logos
- 📝 **Text Fallback Ready**: All clients have professional text alternatives

## Performance Features

- **Lazy Loading**: Images load only when needed
- **Error Resilience**: Automatic fallback to text logos
- **Smooth Animations**: CSS-only animations for performance
- **Hover States**: Interactive feedback without JavaScript overhead
- **Mobile Optimized**: Responsive breakpoints for all devices

## Browser Support

- Chrome/Edge 60+
- Firefox 55+
- Safari 12+
- Mobile browsers (iOS Safari, Android Chrome)

## Accessibility

- Proper ARIA labels and semantic HTML
- Keyboard navigation support
- High contrast text fallbacks
- Screen reader friendly content
- Focus indicators for interactive elements

## Version History

### v1.1.8 (2025-01-14)
- Enhanced University of Pittsburgh logo with optimized 500x281 version
- Updated Point Park University logo to professional green branding
- Improved university logo quality and institutional identity representation
- Maintained Carnegie Mellon and all other client logos
- Preserved all carousel functionality and reliability

### v1.1.7 (2025-01-14)
- Fixed Carnegie Mellon University logo loading issue
- Fixed University of Pittsburgh logo loading issue  
- Updated both universities to reliable Logos-World CDN sources
- Improved overall logo loading reliability and performance
- Maintained all 22 client showcase functionality

### v1.1.6 (2025-01-14)
- Added West Hills Gazette (local news publication)
- Added Capo's on Carson (Italian restaurant with elegant branding)
- Updated Pittsburgh Union Progress logo to official retina version
- Expanded client count from 20 to 22 partners
- Optimized animation timing to 50s for enhanced user experience
- Maintained all shuffling and seamless loop functionality

### v1.1.5 (2025-01-14)
- Updated high-quality logos for Penn State, The Globe, Watchful Shepherd, and Voyage Visuals
- Reorganized file structure to `src/widgets/about/client-carousel/`
- Improved logo contrast and branding consistency
- Maintained all v1.1.4 functionality and features
- Enhanced maintainability with cleaner organization

### v1.1.4 (2025-01-14)
- Added Fisher-Yates shuffle for random client order
- Implemented seamless infinite loop with triple arrays
- Enhanced animation timing to 45 seconds
- Improved user experience with dynamic client arrangement
- Optimized CSS calculations for smooth scrolling

### v1.1.3 (2025-01-14)
- High-quality transparent PNG logos for all major clients
- Larger logo containers (180x110px) for better visibility
- Enhanced image dimensions (140x80px max size)
- Improved dark theme compatibility
- Better logo readability and contrast

### v1.1.0 (2025-10-05)
- Enhanced logo sources with better URLs
- Added text fallback system for all clients
- Improved styling with gradients and shadows
- Better error handling and graceful degradation
- Mobile responsiveness improvements

### v1.0.0 (2025-10-04)
- Initial release with basic carousel functionality
- GitHub-hosted logo system
- Statistics display
- Basic responsive design

## Troubleshooting

### Logos Not Loading
1. Check network connectivity
2. Verify logo URLs are accessible
3. Text fallbacks will automatically display
4. Consider using different logo sources

### Animation Issues
- Ensure CSS animations are enabled in browser
- Check for conflicting CSS on the page
- Verify the widget has enough horizontal space

### Mobile Display Problems
- Test on actual devices, not just browser dev tools
- Check for theme CSS conflicts
- Verify viewport meta tag is present

## Development Notes

This widget follows McCal Media's widget standards:
- Self-contained architecture (no external dependencies)
- Progressive enhancement patterns
- Comprehensive error handling
- Mobile-first responsive design
- Accessibility best practices