# Image SEO Standards for Portfolio Widgets

## Overview
This document outlines best practices for optimizing images in portfolio widgets (concert, event, journalism, etc.) for search engine optimization (SEO). Proper image SEO improves discoverability, accessibility, and user experience while helping search engines understand and index your visual content.

## Core SEO Principles for Images

### 1. Alt Text (Alternative Text)
- **Purpose**: Provides text descriptions for screen readers and search engines when images can't be displayed
- **Implementation**: Add descriptive, keyword-rich alt attributes to all `<img>` tags
- **Best Practices**:
  - Be descriptive but concise (under 125 characters)
  - Include relevant keywords naturally
  - Describe the image content, not just filename
  - Use empty alt (`alt=""`) for decorative images only
- **Example**: `<img src="concert-20231015-001.jpg" alt="Funky Lamp performing live at The Fillmore, October 2023">`

### 2. Image File Naming
- **Purpose**: Helps search engines understand image content through filenames
- **Implementation**: Use descriptive, keyword-rich filenames before upload
- **Best Practices**:
  - Use hyphens to separate words (not underscores or spaces)
  - Include relevant keywords, dates, and context
  - Keep filenames under 50 characters when possible
  - Avoid generic names like "IMG_001.jpg"
- **Example**: `funky-lamp-fillmore-concert-october-2023-001.jpg` instead of `IMG_1234.jpg`

### 3. Image Optimization
- **Purpose**: Faster loading speeds improve user experience and SEO rankings
- **Implementation**: Compress images without quality loss
- **Best Practices**:
  - Use WebP format when supported, fallback to JPEG/PNG
  - Compress to 80-90% quality for JPEGs
  - Resize images appropriately (max width 1920px for portfolios)
  - Use responsive images with `srcset` for different screen sizes
- **Tools**: ImageOptim, TinyPNG, or automated compression in build process

### 4. Structured Data (Schema.org)
- **Purpose**: Helps search engines understand image context and display rich snippets
- **Implementation**: Add JSON-LD structured data to widget HTML
- **Best Practices**:
  - Use `ImageObject` schema for individual images
  - Include `name`, `description`, `url`, `datePublished`
  - Link to parent portfolio/event context
- **Example**:
```json
{
  "@context": "https://schema.org",
  "@type": "ImageObject",
  "name": "Funky Lamp Live Performance",
  "description": "Concert photography of Funky Lamp at The Fillmore",
  "url": "https://example.com/images/concert-20231015-001.jpg",
  "datePublished": "2023-10-15",
  "author": {
    "@type": "Person",
    "name": "Caleb McCartney"
  }
}
```

### 5. Image Sitemaps
- **Purpose**: Explicitly tells search engines about all images on your site
- **Implementation**: Generate and submit image sitemaps to Google Search Console
- **Best Practices**:
  - Include all portfolio images with metadata
  - Update automatically when manifests regenerate
  - Submit to search engines via their webmaster tools

### 6. Lazy Loading
- **Purpose**: Improves page load speed by loading images only when needed
- **Implementation**: Use `loading="lazy"` attribute on `<img>` tags
- **Best Practices**:
  - Combine with intersection observers for better control
  - Set appropriate `loading` values (lazy for below-fold, eager for above-fold)
  - Test loading performance with debug mode

### 7. Image Metadata Preservation
- **Purpose**: Maintains EXIF data for search engines and users
- **Implementation**: Preserve relevant EXIF during processing
- **Best Practices**:
  - Keep creation date, camera info, location (if public)
  - Strip sensitive metadata (GPS coordinates for privacy)
  - Use EXIF data in alt text generation when appropriate

## Widget-Specific Implementation

### Portfolio Widgets (Concert/Event/Journalism)
- Generate alt text from manifest data (band names, event details, dates)
- Include structured data in widget HTML head or body
- Use consistent naming patterns across all portfolio types
- Implement lazy loading for masonry layouts

### Lightbox Galleries
- Ensure lightbox images have proper alt text
- Add structured data for gallery context
- Optimize lightbox loading for SEO (preload critical images)

## Technical Implementation in Widgets

### HTML Structure
```html
<!-- Optimized image with all SEO elements -->
<img 
  src="funky-lamp-concert-20231015-001.webp" 
  alt="Funky Lamp performing energetic rock concert at The Fillmore, San Francisco"
  loading="lazy"
  width="800"
  height="600"
  data-date="2023-10-15"
  data-event="The Fillmore"
  data-band="Funky Lamp"
>
```

### JavaScript Enhancement
```javascript
// Generate alt text from manifest data
function generateAltText(imageData) {
  const { band, event, date, description } = imageData;
  return `${band} performing at ${event}, ${new Date(date).toLocaleDateString()}. ${description || ''}`;
}

// Add structured data
function addStructuredData(images) {
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": images.map(img => ({
      "@type": "ImageObject",
      "name": img.title,
      "description": img.alt,
      "url": img.src,
      "datePublished": img.date
    }))
  });
  document.head.appendChild(script);
}
```

## Monitoring and Maintenance

### SEO Metrics to Track
- Image search impressions in Google Search Console
- Page load speed improvements
- Accessibility scores (Lighthouse)
- Rich snippet appearances

### Regular Tasks
- Audit alt text completeness quarterly
- Review and update structured data with new content
- Monitor image compression effectiveness
- Update sitemaps after major portfolio additions

## Tools and Resources
- Google Search Console (Image reports)
- Google PageSpeed Insights
- Schema.org ImageObject documentation
- WAVE accessibility evaluator
- Lighthouse SEO audits

## Future Enhancements
- AI-generated alt text from image analysis
- Automatic image captioning
- Advanced image search within portfolios
- Integration with Google Images search features

---

*Last updated: October 6, 2025*
*Document created for future reference on portfolio image SEO optimization*