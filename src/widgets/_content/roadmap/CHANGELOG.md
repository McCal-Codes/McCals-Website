# Roadmap Widget Changelog

All notable changes to the Roadmap Widget will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [v1.0.0] - 2024-12-17

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
