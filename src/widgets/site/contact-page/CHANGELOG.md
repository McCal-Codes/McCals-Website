# Contact Page Widget — Changelog (Internal)

All notable changes to this widget will be documented in this file.

## v0.2.0 (2025-11-12)

**Major Enhancements:**
- ✨ Dynamic provider adapters: Formspree, EmailJS, Custom API support
- 🎨 Improved spacing and visual hierarchy throughout form
- 🌐 Full online functionality with real backend services
- 📚 Comprehensive PROVIDERS.md configuration guide
- 🔒 Enhanced security notes and best practices
- ♿ Better ARIA support with required field indicators
- 🎯 Improved error messages and validation feedback
- 🐛 Better CORS and network error handling
- 📱 Enhanced mobile responsiveness
- 🎭 Refined theme toggle with better visual feedback

**Technical:**
- Added CSS custom properties for consistent spacing (--spacing-xs through --spacing-xl)
- Implemented provider detection from data attributes or global config
- Added provider-specific error handling and messaging
- Improved form field focus states and transitions
- Enhanced button hover states and disabled styling
- Added character count validation (min 10 chars for message)
- Better honeypot and timing heuristics logging
- Optional success redirect support via data-success-redirect
- Debug mode shows provider configuration and state

**Breaking Changes:**
- None (backward compatible with v0.1.0 mock provider)

## v0.1.0 (2025-11-12)
- Initial scaffold created: README, STATUS, CHANGELOG, and `versions/v0.1.0-contact-page.html`
- Implemented: container-scoped theming foundation, form structure with ARIA hooks, client-side validation skeleton, honeypot and basic spam heuristics, mock provider adapter, debug panel hook
- Local preview planned via `src/site/` demo harness (not public)