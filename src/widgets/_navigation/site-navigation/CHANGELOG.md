# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.8.5-WIP] - 2025-12-27

### Resilience & WIP 🧱

- **UPDATED**: Version markers changed to WIP to reflect ongoing development
- **ENHANCED**: Improved navigation header isolation logic during route changes

## [1.8.4] - 2025-12-14

### Changed

- Reduced submenu item horizontal padding from 12px to 8px for a tighter fit.

## [1.8.3] - 2025-12-14

### Changed

- Made submenu item padding uniform (12px horizontal) for a balanced, symmetrical appearance.

## [1.8.2] - 2025-12-14

### Changed

- Submenu items now span the full width of the dropdown with proper padding for better click targets.

## [1.8.1] - 2025-12-14

### Changed

- Reordered Work submenu: Featured is now at the top, followed by Photojournalism, Concert, Event, Nature, Portraits.

## [1.8.0] - 2025-09-29

### Added

- “Work” submenu with: Photojournalism, Concert, Event, Nature, Corporate.
- Mobile submenu toggle with ARIA; closes on outside-click and Escape.
- Desktop submenu: hover/focus activation with invisible hover bridge.
- Route-change handler to collapse menus and refresh highlights.

### Changed

- Restored gradient background on main bar; kept blur disabled on main bar; blur enabled for desktop submenu only.
- Updated scrolled-state styles; threshold set to 35% of nav height.
- Simplified submenu link state: removed “current” highlight; underline on hover only.
- Refined mobile layout to one row: [text | arrow]; consistent spacing/indent.

### Fixed

- Hide default Squarespace header when widget is active.
- Prevent horizontal overflow; update CSS var --mcc-nav-height on load/resize.
- Close mobile menu and submenus on resize and route change.
- Prevent submenu hover flicker when moving cursor into submenu.

## [1.6.1] - 2024-12-19

### Changed

- **Navigation Widget**: Improved gradient spread for better text contrast with background
  - Extended gradient coverage from 50% to 85% with improved opacity stops
  - Enhanced readability of navigation text over varied background content
  - Gradient now transitions: `rgba(0, 0, 0, 0.55) 0%` → `rgba(0, 0, 0, 0.35) 60%` → `rgba(0, 0, 0, 0.15) 85%` → `transparent 100%`

## [1.6.0] - Previous Release

- Initial navigation widget implementation with responsive design
- Fixed positioning and mobile menu functionality
- Scroll-based styling transitions
