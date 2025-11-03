# Hire to Unlock Résumé Widget v1.0.0

A playful résumé widget that requires LinkedIn authentication to reveal full content, critiquing entry-level gatekeeping while collecting genuine hiring leads.

## Overview

This widget displays a professional résumé with redacted content that can only be revealed through LinkedIn authentication. It serves as both a demonstration of skills and a filter for serious hiring inquiries.

## Features

- **Redacted Content**: Professional résumé with black bar redaction effects
- **LinkedIn Authentication**: OAuth integration for genuine interest verification
- **Mock Unlock**: Demo functionality for testing reveal animations
- **Easter Egg**: Keyboard shortcut (Ctrl+Shift+U) for temporary content peek
- **Responsive Design**: Mobile-friendly layout with accessibility features
- **Self-Contained**: Inline CSS and JavaScript, no external dependencies

## Usage

### Basic Implementation

```html
<!-- Include the widget HTML -->
<div class="hire-to-unlock-widget" data-widget-version="1.0.0">
  <!-- Widget content here -->
</div>
```

### Squarespace Integration

1. Copy the complete widget HTML from `index.html`
2. Paste into a Code Block in Squarespace
3. The widget will automatically initialize when the page loads

## Customization

### Theme Variables

The widget uses CSS custom properties that match the workspace theme:

```css
--mc-bg: #050506;           /* Background */
--mc-text: #f3f5f8;         /* Primary text */
--mc-line: #272423;         /* Borders/dividers */
--mc-accent: #5fd4f0;       /* Accent color */
--mc-accent-black: #272423; /* Dark accent */
--mc-accent-taupe: #B8B0AA; /* Secondary accent */
```

### Content Modification

To update the résumé content:

1. Edit the HTML structure within the widget
2. Replace redacted spans (`<span class="hire-to-unlock-redacted">██████████</span>`) with actual content
3. Maintain the `hire-to-unlock-redacted` class for proper styling

## Technical Details

### File Structure

```
hire-to-unlock/
├── index.html          # Complete widget implementation
├── hire-to-unlock.css  # (Removed - now inline)
└── hire-to-unlock.js   # (Removed - now inline)
```

### JavaScript Classes

- `HireToUnlockWidget`: Main widget controller
  - Handles authentication flow
  - Manages unlock animations
  - Tracks user interactions

### Events

- `mock_unlock`: Demo unlock button clicked
- `linkedin_unlock`: Successful LinkedIn authentication
- `linkedin_auth_start`: Authentication flow initiated

## Development Status

### Completed Features ✅

- HTML structure with redacted résumé content
- CSS styling with blur/redaction effects and animations
- JavaScript with mock unlock functionality
- Easter egg keyboard shortcut
- Responsive design and accessibility features
- Self-contained widget format

### Planned Features 🔄

- LinkedIn OAuth app registration and configuration
- Backend endpoints for authentication
- Intent micro-form after authentication
- Analytics tracking integration
- Email notifications for unlocks

## Browser Support

- Modern browsers with ES6 support
- Mobile browsers (iOS Safari, Chrome Mobile)
- Accessibility: Screen readers, keyboard navigation
- Reduced motion preferences respected

## Performance

- Inline CSS/JS eliminates external requests
- Optimized animations with `prefers-reduced-motion`
- Minimal DOM manipulation
- Efficient event handling

## Security Considerations

- OAuth state parameter for CSRF protection
- Minimal data collection (name, email, LinkedIn URL)
- No data storage without explicit consent
- Privacy policy link included

## Testing

### Manual Testing

1. Load widget in browser
2. Verify redaction effects display correctly
3. Test mock unlock animation
4. Test Easter egg (Ctrl+Shift+U)
5. Verify responsive behavior on mobile

### Validation

```bash
npm run validate:widgets
```

## Deployment

1. Copy complete widget HTML
2. Paste into Squarespace Code Block
3. Test functionality in published site
4. Monitor analytics for unlock events

## Changelog

### v1.0.0 (Current)
- Initial release with complete mock functionality
- Self-contained widget format
- Responsive design and accessibility
- Easter egg peek feature

## Related Documentation

- [Widget Standards](../standards/widget-standards.md)
- [Widget Development Guide](../standards/widget-development.md)
- [Performance Standards](../standards/performance-standards.md)

## Support

For issues or feature requests, please create an issue in the main repository.</content>
<parameter name="filePath">/Users/mccal/Coding Shenanigans/McCals-Website/src/site/prototypes/hire-to-unlock/README.md