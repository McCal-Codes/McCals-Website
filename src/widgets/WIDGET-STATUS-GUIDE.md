# Widget Development Guide

## Widget Status System

This workspace uses a clear status system for organizing widgets based on their readiness for production use.

### Status Categories

#### 🟢 **Production Ready** (Available Widgets)
Widgets listed in the main README under "Available Widgets" are:
- Fully functional for Squarespace deployment
- Self-contained (inline CSS/JS, no external dependencies)
- Tested and verified to work properly
- Ready for use in production Squarespace site

#### 🟡 **Work in Progress** (In Development)
Widgets with `STATUS.md` files and listed under "Work in Progress":
- Currently under active development
- May have incomplete functionality or known issues
- **Do not use in production** until moved to Available Widgets
- Marked with 🚧 icon in documentation

#### 🔴 **Archived** (Temporarily Inactive)
Widgets in `_archived/` directory:
- No longer actively maintained or temporarily not needed
- May be restored to active development if needed
- Not recommended for new implementations

### Development Workflow

#### Starting a New Widget
1. Create directory: `src/widgets/[widget-name]/`
2. Follow the widget template structure
3. Develop core functionality

#### Widget Status Decision
When development reaches a checkpoint:

**✅ If widget works properly:**
- Add to "Available Widgets" section in main README
- Widget is ready for Squarespace deployment
- Include in production widget count

**🚧 If widget needs more work:**
- Create `STATUS.md` file in widget directory
- Add to "Work in Progress" section in main README  
- Continue development until ready

#### Promoting from WIP to Production
When a WIP widget becomes functional:
1. Remove the `STATUS.md` file
2. Move from "Work in Progress" to "Available Widgets" in README
3. Test in Squarespace environment if possible
4. Update any relevant documentation

#### Archiving a Widget
If a widget is no longer needed:
1. Move entire directory to `src/widgets/_archived/`
2. Remove from README widget lists
3. Document reason for archival

### Widget Requirements

#### Technical Requirements
- **Self-contained**: All CSS and JavaScript inline
- **No external dependencies**: Avoid external fonts, libraries
- **Squarespace compatible**: Works in Code Block environment
- **Responsive**: Functions on mobile and desktop
- **Performance**: Optimized for web delivery

#### Documentation Requirements
- **README.md**: Usage instructions and embedding guide
- **CHANGELOG.md**: Version history (if versioned)
- **Versioned files**: Keep in `versions/` subdirectory
- **Clear examples**: Demo or test files when helpful

### File Structure Template
```
src/widgets/[widget-name]/
├── README.md              # Usage instructions
├── CHANGELOG.md           # Version history (optional)
├── STATUS.md              # WIP status (if applicable)
├── versions/              # Versioned widget files
│   ├── v1.0.html
│   └── v1.1.html
├── demo/                  # Demo files (optional)
└── tests/                 # Test files (optional)
```

### Quality Guidelines

#### Before Moving to Production
- [ ] Widget functions without errors
- [ ] Responsive design works on mobile/desktop
- [ ] Code is clean and well-commented
- [ ] No console errors or warnings
- [ ] Tested in isolation (not just in test site)
- [ ] Documentation is complete and accurate

#### Code Quality
- Use semantic HTML structure
- Follow consistent CSS naming conventions
- Keep JavaScript minimal and efficient
- Handle error cases gracefully
- Optimize for performance