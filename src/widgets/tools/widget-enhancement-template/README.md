# Widget Enhancement Template

This template serves as a starting point for enhancing widgets in the McCal Media workspace. It incorporates best practices from the `widget-development.md` guide, ensuring consistency, performance, and accessibility.

## Overview

The Widget Enhancement Template provides a structured approach to:
- Optimize performance
- Improve accessibility
- Maintain code quality
- Ensure cross-browser compatibility

## Features

### Performance
- **Critical CSS**: Inline essential styles for faster rendering.
- **Lazy Loading**: Progressive image loading with priorities.
- **JavaScript Optimization**: Async loading and intelligent caching.

### Accessibility
- **ARIA Attributes**: Proper ARIA roles and labels for screen readers.
- **Keyboard Navigation**: Full support for navigating interactive elements.
- **Focus Management**: Clear focus indicators and logical tab order.

### Code Quality
- **Self-Contained Architecture**: All CSS/JS inline, no external dependencies.
- **CSS Variables**: Consistent theming with workspace standards.
- **Error Handling**: Graceful degradation for unsupported features.

## File Structure

```
src/widgets/widget-enhancement-template/
├── README.md              # Documentation for the template
├── CHANGELOG.md           # Version history
├── versions/              # Versioned widget files
│   └── v1.0.html          # Complete template implementation
└── demo/                  # Demo files for testing (optional)
```

## Template Features

The `versions/v1.0.html` file includes:

- **Performance Metrics**: FCP, LCP, CLS, TBT monitoring
- **Advanced Metrics**: Network requests, JS execution time, memory usage
- **Accessibility Checker**: Integration with axe-core for real audits
- **Theme Toggle**: Light/dark mode switching
- **Version Indicator**: Required changelog modal system
- **Responsive Design**: Mobile-first approach with CSS Grid

1. Copy the template directory to create a new widget.
2. Follow the implementation checklist in `widget-development.md`.
3. Customize the widget as needed while adhering to standards.

## Testing Checklist

- [ ] Functional Testing: Verify all interactive elements work as expected.
- [ ] Accessibility Testing: Ensure compliance with WCAG 2.1 AA standards.
- [ ] Performance Testing: Validate with Lighthouse (90+ score).
- [ ] Cross-Browser Testing: Test on Chrome, Firefox, Safari, and Edge.

## Related Documentation

- [Widget Development Guide](../../docs/standards/widget-development.md)
- [Performance Standards](../../docs/standards/performance-standards.md)
- [Widget Standards](../../docs/standards/widget-standards.md)

---

**Maintainer**: McCal Media Widget Team  
**Last Updated**: November 5, 2025