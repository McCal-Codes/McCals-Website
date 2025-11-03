# Hire to Unlock Résumé Widget Changelog

All notable changes to the Hire to Unlock Résumé widget will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-11-03

### Added
- Complete self-contained widget implementation with inline CSS and JavaScript
- Redacted résumé content with professional black bar effects
- Mock unlock functionality with smooth reveal animations
- Easter egg keyboard shortcut (Ctrl+Shift+U) for content peek
- Responsive design with mobile-first approach
- Accessibility features including ARIA labels and keyboard navigation
- LinkedIn OAuth placeholder with proper state management
- Privacy policy and fallback download links
- Theme variable integration matching workspace standards
- Event tracking system for analytics integration

### Changed
- Converted from separate HTML/CSS/JS files to self-contained widget format
- Updated class names to use `hire-to-unlock-` prefix for namespacing
- Replaced generic button classes with widget-specific styling
- Improved animation timing and easing functions

### Technical
- Implemented ES6 class-based JavaScript architecture
- Added CSS custom properties for theme consistency
- Optimized for Squarespace Code Block integration
- Reduced motion preferences respected
- Print-friendly styles included

### Performance
- Inline assets eliminate external HTTP requests
- Efficient DOM queries and event handling
- Optimized CSS with minimal specificity conflicts
- Lightweight JavaScript with no external dependencies

## Development Roadmap

### Planned for v1.1.0
- LinkedIn OAuth app registration and configuration
- Backend authentication endpoints implementation
- Intent micro-form for post-authentication data collection
- Analytics integration with Google Analytics 4
- Email notification system for unlock events

### Future Enhancements
- Multiple résumé templates/themes
- A/B testing framework for unlock rates
- Advanced analytics dashboard
- Integration with applicant tracking systems
- Multi-language support

## Compatibility

- **Squarespace**: Compatible with all Code Block implementations
- **Browsers**: Modern browsers with ES6 support
- **Mobile**: Responsive design tested on iOS/Android
- **Accessibility**: WCAG 2.1 AA compliant

## Migration Notes

### From v0.x (Prototype)
- Widget is now self-contained - no external CSS/JS files needed
- Class names updated with `hire-to-unlock-` prefix
- Theme variables now use workspace standard naming
- Event tracking system implemented for future analytics

---

*Widget follows [McCal Media Widget Standards](../standards/widget-standards.md)*</content>
<parameter name="filePath">/Users/mccal/Coding Shenanigans/McCals-Website/src/site/prototypes/hire-to-unlock/CHANGELOG.md