# About Page Widget v1.0.0

A self-contained about page widget for Squarespace featuring professional bio, photo, and call-to-action buttons.

## Overview

This widget provides a complete about page section with Caleb McCartney's professional biography, headshot photo, and navigation buttons. Designed for Squarespace Code Block integration with full responsive design and accessibility features.

## Features

- **Professional Bio**: Comprehensive biography with career highlights and current projects
- **Headshot Photo**: GitHub-hosted professional photograph with hover effects
- **Call-to-Action Buttons**: Primary and secondary buttons for portfolio and contact
- **Responsive Design**: Mobile-first layout that adapts to all screen sizes
- **Accessibility**: WCAG compliant with proper ARIA labels and keyboard navigation
- **Self-Contained**: Inline CSS and JavaScript, no external dependencies

## Usage

### Basic Implementation

```html
<!-- Include the widget HTML -->
<div class="about-page-widget" data-widget-version="1.0.0">
  <!-- Widget content here -->
</div>
```

### Squarespace Integration

1. Copy the complete widget HTML from `v1.0.0-about-page.html`
2. Paste into a Code Block in Squarespace
3. The widget will automatically initialize when the page loads

## Customization

### Content Modification

To update the biography content:

1. Edit the HTML structure within the widget
2. Replace text in the `.about-page-text` paragraphs
3. Update image source if needed
4. Modify button links and text

### Theme Variables

The widget uses CSS custom properties that match the workspace theme:

```css
--mc-bg: #050506;           /* Background */
--mc-text: #f3f5f8;         /* Primary text */
--mc-line: #272423;         /* Borders/dividers */
--mc-accent: #5fd4f0;       /* Accent color */
--mc-accent-taupe: #B8B0AA; /* Secondary accent */
```

### Styling Customization

The widget includes comprehensive CSS that can be modified:

- **Layout**: Flexbox-based responsive layout
- **Typography**: System font stack with proper line heights
- **Colors**: Theme variable-based color scheme
- **Effects**: Subtle backdrop blur and hover animations

## Technical Details

### File Structure

```
about-page/
├── versions/
│   └── v1.0.0-about-page.html    # Complete widget implementation
├── README.md                     # This documentation
└── CHANGELOG.md                  # Version history
```

### JavaScript Classes

- `AboutPageWidget`: Main widget controller
  - Handles event tracking and analytics
  - Manages accessibility features
  - Sets up external link security

### Events

- `about_button_click`: Tracks clicks on CTA buttons
  - Includes button text and timestamp
  - Ready for analytics integration

## Browser Support

- Modern browsers with CSS Grid and Flexbox support
- Mobile browsers (iOS Safari, Chrome Mobile)
- Accessibility: Screen readers, keyboard navigation
- Reduced motion preferences respected

## Performance

- Inline CSS/JS eliminates external HTTP requests
- Optimized images with proper alt text
- Efficient DOM queries and event handling
- Minimal JavaScript footprint

## SEO Considerations

The widget includes semantic HTML structure but for full SEO optimization, add these meta tags to your Squarespace page:

```html
<meta name="description" content="About Caleb McCartney - Professional photographer, photojournalist, and storyteller based in Pittsburgh.">
<meta name="keywords" content="photojournalist, photographer, Pittsburgh, commercial photography, event coverage">
<meta name="author" content="Caleb McCartney">
```

## Analytics Integration

The widget includes placeholder analytics tracking. To enable:

1. Uncomment the gtag lines in the JavaScript
2. Ensure Google Analytics 4 is installed on your site
3. Events will automatically track button clicks

## Related Documentation

- [Widget Standards](../standards/widget-standards.md)
- [Widget Development Guide](../standards/widget-development.md)
- [Performance Standards](../standards/performance-standards.md)

## Support

For issues or feature requests, please create an issue in the main repository.