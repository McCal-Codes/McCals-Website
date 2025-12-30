# Quote Request Widget - Changelog

## [1.1.0] - 2025-12-30

- **Multi-Step Flow**: Refactored the form into 3 logical steps to reduce cognitive load and improve conversion.
- **Micro-Interactions**: Added a progress bar and smooth "fade-up" transitions between steps.
- **Celebration**: Integrated `canvas-confetti` to provide a premium visual confirmation upon successful submission.
- **Draft Persistence**: Implemented `localStorage` field persistence so users don't lose progress on refresh.
- **UX Polish**: Added `autocomplete` attributes and standardized success/error scroll-to-view logic.

## [1.0.0] - 2025-12-30

- Initial release of the conversion-focused Quote Request widget.
- Features:
  - 12+ fields covering contact, project details, deliverables, and licensing.
  - Conditional logic for event-specific fields (Times, Attendees).
  - EmailJS integration for direct-to-inbox submissions.
  - Responsive, monochrome-friendly design.
  - Honeypot spam protection.
  - Built-in version indicator and changelog system.
