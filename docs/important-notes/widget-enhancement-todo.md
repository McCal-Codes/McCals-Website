# Widget Enhancement TODO Tree

This document tracks the actionable enhancement patterns from `widget-enhancements.md` as a checklist for systematic application across all widgets. Use this as your enhancement TODO tree.

---

## Enhancement Patterns Checklist

### Core Enhancements
- [ ] Close Button: Fixed positioning with safe-area support
- [ ] Filter Logic: Use `display:none` for hidden items
- [ ] Status Indicators: Minimal design, consistent positioning
- [ ] Navigation Hiding: Comprehensive selectors for fullscreen isolation
- [ ] Scrollbar Hiding: Cross-browser scrollbar hiding in galleries
- [ ] Version Indicator: Inline with heading, standardized styling
- [ ] Tag Support: Enhanced categorization beyond simple categories
- [ ] Changelog Modal: Accessible, comprehensive version history

### Testing Requirements
- [ ] Mobile responsiveness (especially close buttons)
- [ ] Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- [ ] Accessibility (keyboard navigation, screen readers)
- [ ] Squarespace integration (no external dependencies)
- [ ] Performance impact (no degradation with enhancements)

---

## Priority Implementation Order

### High Priority
- [ ] Close Button Optimization
- [ ] Navigation Hiding
- [ ] Filter Layout Fix

### Medium Priority
- [ ] Version Indicator Standardization
- [ ] Minimal Status Indicators
- [ ] Scrollbar Hiding

### Low Priority
- [ ] Enhanced Tag Support
- [ ] Changelog Modal

---

## Widget-Specific Application Notes

### Concert Portfolio
- [ ] Close button and navigation hiding (has lightbox)
- [ ] Filter layout improvements for venue/artist categories
- [ ] Status indicators for featured/published concerts

### Event Portfolio
- [ ] Navigation hiding and scrollbar improvements
- [ ] Version indicator standardization

### Featured Portfolio
- [ ] Filter layout critical (shuffled grid)
- [ ] Minimal status indicators for publication status
- [ ] Close button optimization for lightbox

### Hero Slideshow
- [ ] Navigation hiding during fullscreen mode
- [ ] Version indicator integration
- [ ] Scrollbar hiding if applicable

### Site Navigation/Footer
- [ ] Version indicator pattern
- [ ] Consistent hover states
- [ ] Mobile responsiveness patterns

---

## Future/Low Priority
- [ ] Light/dark mode toggle for all widgets (see `widget-ui-colors-and-buttons.md`)

---

**Update this file as enhancements are applied.**
