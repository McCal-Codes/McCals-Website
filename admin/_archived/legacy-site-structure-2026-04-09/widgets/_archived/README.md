# Archived Widgets

This directory contains widgets that are no longer actively maintained or have been temporarily archived.

## Currently Archived

### github-portfolio-gallery/
- **Status**: Archived (October 4, 2025)
- **Reason**: Not currently needed for production site
- **Description**: GitHub project showcase widget
- **Restoration**: Can be moved back to active widgets if needed in the future

## Restoration Process

To restore an archived widget:

1. Move the widget directory back to `src/widgets/`
2. Update the main `README.md` to include it in the Available Widgets list
3. Test the widget to ensure it still functions properly
4. Update any documentation references
5. Add entry to the changelog

## Widget Status Management

### Production Ready Criteria
A widget is ready for production when:
- ✅ **Functions correctly**: Widget works as intended without major bugs
- ✅ **Squarespace compatible**: Inline CSS/JS, no external dependencies
- ✅ **Tested**: Basic functionality verified in test environment
- ✅ **Self-contained**: All required assets included or accessible

### Work in Progress Criteria  
Mark a widget as WIP when:
- 🚧 **Under active development**: Core functionality not yet complete
- 🚧 **Has known issues**: Significant bugs or incomplete features
- 🚧 **Not tested**: Hasn't been verified to work properly
- 🚧 **External dependencies**: Relies on incomplete external resources

### Status Workflow
1. **New widget development** → Create in `src/widgets/[name]/`
2. **If working properly** → Add to "Available Widgets" in main README
3. **If not ready** → Add `STATUS.md` file and list in "Work in Progress" 
4. **When WIP becomes ready** → Remove `STATUS.md`, move to "Available Widgets"
5. **If no longer needed** → Move to `_archived/` directory

## Archive Process

To archive a widget:

1. Move widget directory to `src/widgets/_archived/`
2. Update main `README.md` to remove from Available Widgets
3. Add entry to this README documenting the archive
4. Update any documentation that references the widget
5. Add entry to the changelog