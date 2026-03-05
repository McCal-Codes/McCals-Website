# 🗺️ Roadmap Widget

A public todo list widget that displays website development progress and future plans in an elegant, interactive interface.

## Purpose

This widget serves as a transparent view into the website's development roadmap, showing:

- ✅ Completed features and improvements
- 🔄 Currently in-progress work
- 📋 Future planned enhancements

It acts as both a project tracker and a public commitment device, keeping development organized and visible.

## Features

### Core Functionality

- **Phase-Based Organization**: Tasks grouped into logical development phases
- **Status Tracking**: Visual indicators for completed, in-progress, and planned tasks
- **Priority System**: High/medium/low priority labels for task importance
- **Timeline Information**: Target dates or quarters for each task
- **Progress Summary**: Real-time statistics showing completion status

### Design

- **Monochrome Glassmorphism**: Consistent with site-wide design system
- **Interactive Cards**: Hover effects and smooth animations
- **Responsive Layout**: Adapts gracefully to mobile, tablet, and desktop
- **Dark Mode Support**: Automatic theme switching based on system preferences

### User Experience

- ✨ Smooth animations and micro-interactions
- 📱 Mobile-friendly touch targets
- ⚡ Lightweight and performant
- ♿ Accessible color contrasts and markup

## Usage

### Standalone HTML

```html
<!-- Include the widget HTML file -->
<iframe src="path/to/v1.0.0-roadmap.html" width="100%" height="800px"></iframe>
```

### Embedded in Site

```html
<!-- Copy the widget content into your page -->
<div class="mcc-roadmap-widget">
  <!-- Widget content -->
</div>
```

## Data Structure

The roadmap data is currently hardcoded in the widget's JavaScript, based on the actual repository CHANGELOG. To update the roadmap:

1. Open the widget HTML file
2. Find the `roadmapData` array in the `<script>` section
3. Add, edit, or remove months and tasks

### Month Schema

```javascript
{
  month: 'December 2025',      // Month and year
  status: 'current',           // 'completed' | 'current' | 'future'
  tasks: [...]                 // Array of task objects
}
```

### Task Schema

```javascript
{
  title: 'Task Title',                    // Short, descriptive name
  description: 'Task description...',     // Brief explanation
  status: 'completed',                    // 'completed' | 'in-progress' | 'future'
  category: 'Widget'                      // Category: Widget, Infrastructure, Documentation, Tool, Design, Feature
}
```

## Future Enhancements

Potential improvements not yet implemented:

- [ ] **External Data Source**: Load roadmap from JSON manifest file
- [ ] **Filter & Search**: Filter tasks by status, priority, or search text
- [ ] **Sorting Options**: Sort by date, priority, or status
- [ ] **Completion Tracking**: Show percentage complete for each phase
- [ ] **Historical View**: Archive of completed phases and tasks
- [ ] **Export Functionality**: Download roadmap as PDF or CSV
- [ ] **Admin Edit Mode**: In-line editing for authorized users

## Version History

See [CHANGELOG.md](./CHANGELOG.md) for detailed version history.

## Design System

This widget follows the McCals-Website design system:

- **CSS Prefix**: `mcc-` for all classes
- **Color Tokens**: Uses CSS variables for theming
- **Typography**: Inter (body) and Outfit (headings)
- **Glassmorphism**: Backdrop blur with subtle borders
- **Animations**: Smooth transitions with thoughtful timing

## 🔄 Monthly Roadmap Updates

**Schedule**: Update at the end of each month (or start of new month)

### Monthly Update Checklist:

1. **Review Git Commits**

   ```bash
   # Get commits for the past month
   git log --pretty=format:"%ai %s" --since="YYYY-MM-01" --until="YYYY-MM-31" | head -50

   # Look for patterns - what did you build? What broke? What did you fix?
   git log --pretty=format:"%s" --since="YYYY-MM-01" | grep -iE "feat|fix|refactor"
   ```

2. **Update Current Month in Roadmap Data**
   - Open `versions/v1.2.0-roadmap.html` (or latest version)
   - Find the `roadmapData` array in the `<script>` section
   - Update the current month's highlights array with:
     - **What you built**: New features, widgets, tools
     - **What you struggled with**: From commit messages (fix:, bug:, etc.)
     - **What you learned**: New technologies, techniques, patterns
3. **Move Current → Completed**
   - Change `status: 'current'` to `status: 'completed'`
   - Update the `count` with actual number of achievements
4. **Create New Current Month**

   ```javascript
   {
     month: 'Jan 2026',  // New current month
     status: 'current',
     count: 0,           // Will update as month progresses
     highlights: [
       'Starting: [describe what you\'re working on]',
       'Goal: [what you want to accomplish]'
     ]
   }
   ```

5. **Sync with TODO List**
   - Review `updates/todo.md`
   - Move completed TODOs to future roadmap milestones
   - Update Q1/Q2 highlights with new priorities

6. **Update Stats**
   The stats are now dynamic, but verify:
   - Commit count looks right
   - Widget count is accurate
   - Months of learning updated (if crossing into new quarter)

7. **Test & Commit**

   ```bash
  # Open preview to verify
  open src/widgets/projects/roadmap/preview.html

   # Commit changes
  git add src/widgets/projects/roadmap/
   git commit -m "chore: update roadmap for [Month Year] - [brief summary]"
   git push
   ```

### Example Monthly Entry:

```javascript
{
  month: 'Dec 17-31',
  status: 'completed',
  count: 3,
  highlights: [
    'Built personal development roadmap widget with dynamic stats',
    'Integrated GitHub API for live commit/widget counts',
    'Struggled with: IntersectionObserver timing, API rate limits',
    'Learned: GitHub API pagination, animated counters, Buy Me a Coffee integration',
    'Achievement: First widget with scroll-triggered animations'
  ]
}
```

### Automation Ideas (Future):

- **GitHub Action**: Auto-generate monthly summary from commits
- **Script**: Parse git log and suggest highlights
- **Reminder**: Calendar reminder on 1st of each month

---

## Maintenance

### Adding New Tasks

1. Determine which month the task belongs to
2. Add task object to the appropriate month's `tasks` array
3. Set status and category
4. Preview the widget to verify appearance

### Updating Status

1. Find the task in the `roadmapData` array
2. Change the `status` field to reflect current state ('completed', 'in-progress', or 'future')
3. Update the `description` if details have changed

### Creating New Months

1. Add a new month object to the `roadmapData` array
2. Set the month name and status ('completed', 'current', or 'future')
3. Add initial tasks for the month
4. Statistics will update automatically

## File Structure

```
roadmap/
├── README.md                      # This file
├── CHANGELOG.md                   # Version history
├── preview.html                   # Preview page
└── versions/
    ├── v1.0.0-roadmap.html       # Initial version (example data)
    ├── v1.1.0-roadmap.html       # Month-by-month (real data)
    └── v1.2.0-roadmap.html       # Current version (personal journey + visual timeline)
```

---

**Created**: 2025-12-17  
**Current Version**: v1.3.0  
**Status**: ✅ Production Ready
