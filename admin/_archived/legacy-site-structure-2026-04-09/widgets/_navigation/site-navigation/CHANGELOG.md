# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.6] - 2026-03-05

### Added 🧭

- **Dedicated Projects top-level navigation** with its own submenu, separated from photography `Work`.
- **Projects submenu links** for correlated systems surfaces:
  - `/projects`
  - `/projects/design-systems`
  - `/projects/terranova-editor`
  - `/abridged`
  - `/roadmap`

### Changed ✨

- Updated top-level IA sequence to better reflect multidisciplinary identity:
  - `Work` → `Projects` → `Podcast` → `Blog` → `About`

### Retained ♿

- Mobile/desktop submenu behavior, keyboard escape handling, outside-click close behavior, and crawl-friendly anchor links from v2.0.5.

## [2.0.6] - 2026-03-05

### Added ✨

- **Projects top-level menu**: Added a new `Projects` navigation item with dedicated desktop/mobile submenu behavior.
- **Projects submenu links**:
  - TerraNova Editor
  - Hytale Biome Portfolio
  - McCal Website System
  - Abridged App

### Changed

- Preserved existing `Work` submenu and interaction model while extending the nav to support multiple submenu groups.

## [2.0.5] - 2026-03-05

### Fixed 🛠️

- **Desktop Work dropdown reliability**: Prevented desktop submenu from getting stuck hidden after route changes, outside-click handling, or resize events by clearing inline `display` styles on desktop.
- **Mobile/desktop submenu state separation**: Kept explicit `display` toggling for mobile only while preserving CSS hover-driven desktop behavior.

### Changed ♿

- **A11y/crawl hardening baseline**: Added ARIA relationship attributes for menu controls and kept the primary Work anchor crawlable (`/featured`) while preserving mobile submenu toggle behavior.

## [2.0.0] - 2025-12-30

### Added 💎

- **"The Refined Lens" Architecture**: A high-efficiency evolution of the v1.6.3 layout, restoring the full-width desktop bar and right-aligned mobile menu.
- **Focus Flow Interaction**: A sophisticated "Neighbor Dimming" effect where non-hovered items subtly fade, creating a unique cinematic focus on the user's active path.
- **Ultra-Minimalist Tokens**: Implemented 0.5px "Air" borders and refined tracking (0.05em) for a high-end editorial aesthetic.
- **Cinematic Motion**: Upgraded all transitions to a custom `cubic-bezier(0.16, 1, 0.3, 1)` for silky-smooth, premium interactions.
- **Asymmetrical Mobile chic**: Restored the right-aligned mobile overlay (mimicking v1.6.3) with localized text alignment for a more sophisticated look.

## [1.9.9] - 2025-12-30

### Changed 📱

- **Centered Mobile UI (Restored)**: Reverted from side-aligned experiments (v1.9.5 - v1.9.8) to a focused, centered navigation overlay.
- **Uniform Spacing**: Implemented strict uniform padding (`32px`) on all sides of the mobile container for a perfectly balanced visual frame.
- **Adaptive Width**: Updated the container to `fit-content` (min `240px`) to gracefully accommodate centered text while maintaining a tight footprint.
- **Micro-Refined Typography**: Standardized on `1.1rem` uppercase links with increased letter-spacing (`0.04em`) for a premium centered aesthetic.

## [1.9.8] - 2025-12-30 (Scrapped)

### Refinement 💎

- **Ultra-Minimal Design Tokens**: Switched to `0.5px` borders and removed heavy text shadows for a cleaner, modern editorial feel.
- **Editorial Typography**: Implemented airy letter-spacing (`0.06em`) and switched mobile links to uppercase for a high-fashion aesthetic.
- **Cine-Motion**: Upgraded all transitions to a custom `cubic-bezier(0.16, 1, 0.3, 1)` for buttery smooth, "expensive" feeling movement.
- **Enhanced Glassmorphism**: Boosted backdrop saturation (`160%`) and blur (`32px`) while softening background opacities.

## [1.9.7] - 2025-12-30

### Changed - Left-Aligned Flow

- **Expanded Mobile Profile**: Widened the mobile menu container to `250px` for a more open feel.
- **Left-Aligned Flow**: Switched all mobile navigation text and internal components to left-alignment.
- **Tight Interaction**: Positioned the toggle arrow immediately to the right of the "Work" label (`10px` gap) to maintain a cohesive link group.

## [1.9.6] - 2025-12-30

### Changed - Narrow Profile

- **Narrower Mobile Profile**: Reduced the mobile menu width to `185px` for a more streamlined, focused overlay.
- **Micro-Scaled Typography**: Scaled down mobile text (Links to `1.25rem`, Submenu to `1.05rem`) for a more proportional and elegant look.
- **Uniform Padding**: Applied a consistent `24px` padding across all sides of the mobile navigation box.

## [1.9.5] - 2025-12-30

### Changed - Right-Aligned Flow

- **Right-Aligned Mobile Experience**: Switched mobile menu items and the container itself back to right-aligned for a more sophisticated, asymmetric look.
- **Larger Mobile Typography**: Increased the font size of primary links to `1.45rem` and submenu items to `1.15rem` for better readability and presence.
- **Internal Alignment**: Updated all mobile containers and submenu blocks to follow the new right-leaning alignment with tight arrow placement.

## [1.9.4] - 2025-12-30

### Added ✨

- **Minimalist Quote CTA**: Integrated a "Ghost" style "Request a Quote" button with refined uppercase typography and hover reveals.
- **Floating Lens Submenus**: Reimagined desktop submenus with a clear vertical gap, unified rounding, and left-aligned text for better editorial scannability.
- **Centered Mobile UI**: Redesigned the mobile menu to be a compact, centered "Lens" overlay (`220px` width) with centered items.
- **Glassmorphism 2.0**: Enhanced blur, shadow depth, and "soft chip" hover interactions across all menu elements.

### Changed 📐

- **Consolidated Release**: Bundled all navigation refinements from the v1.9.x series into a stable v1.9.4 release.
- **Spacing Optimization**: Reduced global bar padding and tightened link clustering for a more premium, minimal layout.

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

### Added - Submenu logic

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
