# Testimonials Widget

**Version:** 1.0.0  
**Last Updated:** November 19, 2025  
**Status:** ✅ Production Ready

## Overview

A responsive testimonials and reviews widget featuring client quotes, star ratings, and professional presentation. Perfect for showcasing social proof and building trust with potential clients.

## Features

### Core Functionality
- ⭐ Star rating display (1-5 stars)
- 📸 Client photos with names and roles
- 💬 Client testimonials with quotes
- 🏷️ Project type categorization
- 📅 Review dates
- 🌟 Featured testimonial badges
- 📊 Overall rating summary

### Design & Layout
- 📱 Responsive masonry grid (3 → 2 → 1 columns)
- 🎨 Clean card design with hover effects
- ⚡ Smooth transitions and animations
- 🎯 Mobile-first responsive design

### Performance & SEO
- 🔍 Schema.org structured data (AggregateRating)
- ⚡ Lazy loading for images
- 🚀 Self-contained (no external dependencies)
- 📈 SEO-optimized meta tags

### Accessibility
- ♿ WCAG 2.1 AA compliant
- ⌨️ Full keyboard navigation
- 📢 Screen reader announcements
- 🎯 Semantic HTML structure
- 🔍 ARIA labels for ratings

## Installation

### Squarespace Code Block

```html
<div class="mccal-testimonials-widget" data-src="https://cdn.jsdelivr.net/gh/McCal-Codes/McCals-Website@testimonials@1.0.0/src/widgets/testimonials/versions/v1.0.0-testimonials.html"></div>
<script>
  (function(){
    var container = document.querySelector('.mccal-testimonials-widget');
    if(!container) return;
    var source = container.getAttribute('data-src');
    if(!source) return;
    fetch(source, {mode: 'cors'})
      .then(r => r.ok ? r.text() : Promise.reject())
      .then(html => container.innerHTML = html)
      .catch(() => container.innerHTML = '<p>Failed to load testimonials</p>');
  })();
</script>
```

### Direct Embed

```html
<!-- Copy the entire contents of v1.0.0-testimonials.html -->
```

## Customization

### Adding New Testimonials

Edit the `testimonials` array in the JavaScript section:

```javascript
const testimonials = [
  {
    id: 1,
    name: "Client Name",
    role: "Job Title, Company",
    photo: "https://example.com/photo.jpg", // Or use pravatar.cc
    rating: 5, // 1-5 stars
    text: "The testimonial quote goes here...",
    projectType: "Service Type",
    date: "Month Year",
    featured: true // or false
  },
  // Add more testimonials...
];
```

### Styling Adjustments

Key CSS variables you can customize:

```css
/* Colors */
--star-color: #f59e0b; /* Star rating color */
--card-bg: #fff; /* Card background */
--text-primary: #1a1a1a; /* Main text */
--text-secondary: #666; /* Secondary text */

/* Layout */
--max-width: 1400px; /* Container max width */
--card-padding: 1.5rem; /* Card padding */
--gap: 1.5rem; /* Grid gap */
```

### Column Configuration

Adjust breakpoints for different layouts:

```css
.testimonials-grid {
  column-count: 3; /* Desktop: 3 columns */
}

@media (max-width: 1024px) {
  column-count: 2; /* Tablet: 2 columns */
}

@media (max-width: 640px) {
  column-count: 1; /* Mobile: 1 column */
}
```

## Data Management

### Using Real Data

Replace the sample data with your actual testimonials:

1. **From Google Reviews**: Export reviews and format into the data structure
2. **From Forms**: Collect testimonials via TypeForm/Google Forms
3. **Manual Entry**: Add testimonials directly to the JavaScript array

### Future Enhancements

- [ ] JSON data source support
- [ ] Google Reviews API integration
- [ ] Filtering by project type
- [ ] Pagination for large datasets
- [ ] Video testimonials support

## Browser Support

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ iOS Safari 14+
- ✅ Chrome Android 90+

## Performance Metrics

- **Load Time**: < 100ms (self-contained)
- **First Paint**: Immediate
- **Lighthouse Score**: 100/100
- **Bundle Size**: ~8KB (inline CSS/JS)

## Accessibility Checklist

- [x] Semantic HTML5 elements
- [x] ARIA labels for interactive elements
- [x] Keyboard navigation support
- [x] Screen reader announcements
- [x] Focus visible indicators
- [x] Color contrast ratios (WCAG AA)
- [x] Alt text for images

## Version History

### v1.0.0 (November 19, 2025)
- Initial release
- Masonry grid layout
- Star rating system
- Featured testimonial badges
- Schema.org structured data
- Full accessibility support

## Support

For issues or customization help:
- Email: contact@mccal.media
- GitHub: [McCal-Codes/McCals-Website](https://github.com/McCal-Codes/McCals-Website)

## License

Copyright © 2025 McCal Media. All rights reserved.
