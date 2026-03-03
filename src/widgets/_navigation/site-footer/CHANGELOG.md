# Footer Widget Changelog

## v1.4.1 (2026-03-02)

- ⚡ **Performance**: Reworked back-to-top logic to avoid layout reads on every scroll tick.
- 🧠 **Runtime Optimization**: Added `requestAnimationFrame` scroll throttling for smoother mobile behavior.
- 👀 **Footer Proximity Handling**: Switched to `IntersectionObserver` for near-footer visibility instead of repeated `getBoundingClientRect()` calls.
- 🧹 **JavaScript Cleanup**: Removed simulated submit timers and simplified newsletter submit enhancement to reduce main-thread work.

## v1.3.0 (2025-12-31)

- 🚀 **Back to Top Button**: Circular floating button with scroll progress ring indicator
- 📊 Smart positioning that hides when approaching footer to prevent overlap
- ✨ Animated underline effects on all footer links for enhanced interactivity
- 💬 Social icon tooltips with smooth fade-in animations
- 📧 Newsletter form states: loading spinner, success message, and validation feedback
- 🔢 Dynamic copyright year range (e.g., "2019-2025")
- 🎯 Clickable version badge (prepared for future changelog modal)
- ♿ Enhanced accessibility: keyboard navigation, ARIA live regions, improved focus states
- 🎨 Smooth scroll behavior with optimized animations
- ⚡ Performance improvements with reduced-motion support

## v1.2.0 (2025-10-05)

- ✨ Enhanced blur effects and backdrop filtering for better visual depth
- 🎨 Improved hover animations with cubic-bezier transitions
- 📱 Better responsive design and mobile optimizations
- ♿ Enhanced accessibility with proper ARIA labels and focus states
- 🎯 CSS custom properties for better theming and dark mode support
- 🚀 Performance optimizations and code organization
- 🔧 Fixed cookies link and improved legal section layout
- ⚡ Added reduced motion support for accessibility
- 🗑️ Removed modal functionality for simplified UX

## v1.1.0 (2025-10-04)

- 🔗 Fixed broken links in footer navigation
- 📝 Updated link structure and organization
- ✨ Added changelog modal for version tracking

## v1.0.0 (2025-09-26)

- 🎉 Initial release with glass footer layout and Mailchimp newsletter form
- 🎨 Adaptive social icons, legal links, and focus-visible outlines
- 📝 Added version badge for deployment tracking
