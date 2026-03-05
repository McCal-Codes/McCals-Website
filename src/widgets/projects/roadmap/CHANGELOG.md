# Roadmap Widget Changelog

All notable changes to the Roadmap Widget will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [v1.3.0] - 2025-12-27

### Added

- 🚀 **Coming in 2026 Section**: Added a glassmorphic preview area for major 2026 goals (Next.js infrastructure migration, Admin ecosystem v2.0, Content pipeline).
- 📅 **Summarized December**: Consolidated all December progress into a single cohesive milestone.
- 🎨 **Restored Glassmorphism**: Reverted back to the highly-refined "Glassmorphism 2.0" aesthetic while integrating new 2026 elements.
- 🎯 **Jan 2026 Kickoff**: Added January 2026 as the active phase of the roadmap.
- 🧹 **UI Cleanup**: Removed the fixed version indicator and changelog modal for a cleaner minimalist look.

---

## [v1.2.0] - 2025-12-17

### Added

- 🎨 **Visual Horizontal Roadmap**: Desktop view now shows horizontal timeline with milestone markers
- 📖 **Personal Journey Story**: Added narrative explaining self-teaching web development from scratch
- 💪 **Real Struggles Documented**: Each month shows actual challenges faced (from git commit analysis):
  - Sept: Package.json version mismatches, CI failures
  - Oct: Image stretching, CSP/DOMPurify conflicts
  - Nov: Merge conflicts, PowerShell quoting issues
  - Dec: Race conditions, ESLint errors, lint-staged configuration
- 🎯 **Learning Milestones**: Explicitly documents what was learned each month
- 📊 **Enhanced Stats**: Added "498 Git Commits" and "4 Months of Learning" cards
- 🗺️ **Timeline Design**: Gradient progress line showing completed → current → future states

### Changed

- **Narrative Focus**: Shifted from task list to personal development story
- **Desktop Layout**: Horizontal timeline with 7 milestone cards (previously vertical)
- **Mobile Layout**: Improved vertical timeline with better spacing
- **Highlight Format**: Now includes "Struggled with:" and "Learned:" entries
- **Tone**: More personal and reflective, less technical/corporate

### Technical

- Responsive design: Horizontal on desktop (≥1024px), vertical on mobile
- CSS Grid for milestone layout (7 columns on desktop)
- Animated timeline with gradient progress indicator
- Milestone markers change color based on status (green → blue → gray)
- Enhanced hover effects on desktop, touch-friendly on mobile

---

## [v1.1.0] - 2025-12-17

### Changed

- 🔄 **Real Data Integration**: Replaced generic example data with actual development history from repository CHANGELOG
- 📅 **Month-by-Month Timeline**: Reorganized from phases to chronological month view (September 2025 - Q2 2025)
- 🏷️ **Task Categories**: Added category labels (Widget, Infrastructure, Documentation, Tool, Design, Feature)
- 📊 **Accurate Statistics**: Now shows real numbers - 40+ completed tasks, 2 in-progress, 9 planned
- ✨ **Enhanced Realism**: Tasks pulled from actual work including:
  - Blog System evolution (v1.0 → v3.0)
  - About Page development (v1.0 → v1.6)
  - Widget standardization and monochrome conversion
  - Infrastructure improvements (manifest systems, SEO automation, CI/CD)
  - Documentation efforts throughout 2025

### Added

- 📖 Month status badges (completed, current, future)
- 🎯 Real accomplishments from September-December 2025
- 🗓️ Planned work for 2025 Q1 and Q2
- 📋 Detailed descriptions based on actual CHANGELOG entries

### Technical

- Updated data structure to month-based instead of phase-based
- Task descriptions now match actual CHANGELOG wording
- Proper historical accuracy for completed vs in-progress items

---

## [v1.0.0] - 2025-12-17

### Added

- ✨ Initial roadmap widget implementation
- 🎨 Monochrome glassmorphism design with dark mode support
- 📊 Summary statistics showing completed, in-progress, and planned tasks
- 📋 Phase-based organization with visual status indicators
- ✅ Task cards with completion checkboxes and status highlighting
- 🎯 Priority system (high/medium/low) for task management
- 📅 Timeline information showing target dates or quarters
- 🎭 Smooth animations and hover effects
- 📱 Responsive design for mobile, tablet, and desktop
- ♿ Accessible color contrasts and semantic HTML
- 📖 Version indicator with changelog modal (required for all widgets)
- 🔤 Inter and Outfit font families for professional typography

### Design Features

- Glassmorphism effects with backdrop blur
- Gradient text for main heading
- Color-coded status badges (completed, in-progress, future)
- Left border accent on task cards based on status
- Animated fade-in for phase sections
- Hover lift effect on cards
- Statistics cards with hover animations

### Data Structure

- 4 default phases: Foundation, Content & Features, Enhancement & Polish, Future Expansion
- Task schema with title, description, status, priority, and date
- Auto-calculated statistics from task data
- Hardcoded data array (future: external JSON manifest)

### Technical Details

- Pure HTML/CSS/JavaScript (no dependencies)
- CSS custom properties for theming
- Semantic HTML5 structure
- Mobile-first responsive design
- Inline styles and scripts (widget standard)

---

## [Unreleased]

### Planned for Future Versions

- [ ] External JSON data source for roadmap
- [ ] Filter and search functionality
- [ ] Export to PDF/CSV
- [ ] Historical archive view
- [ ] Completion percentage per phase
- [ ] Admin edit mode for inline updates

---

**Legend:**

- ✨ New Feature
- 🎨 Design/UI
- 📊 Data/Analytics
- 🐛 Bug Fix
- ⚡ Performance
- 📱 Mobile
- ♿ Accessibility
- 🔧 Technical/Refactor
