# Standards Documentation

Guidelines, conventions, and best practices for the McCal Media workspace.

## Widget Development Standards

### 📋 **widget-reference.md** ⭐ **START HERE**
Quick reference checklist and common patterns for widget development. Essential for daily development.

### ⚡ **performance-standards.md** ⭐ **PERFORMANCE FIRST**
Lighthouse optimization guide using Concert Portfolio v4.6 as case study. **Required reading for all widget development.**

### 📖 **widget-standards.md**
Comprehensive widget standards documentation covering architecture, design patterns, performance, and accessibility requirements.

### � **widget-standards.md**
Comprehensive widget standards, proven UX and technical improvements, and best practices for all widgets. All enhancement patterns are now integrated here.

### 🔄 **widget-development.md**
Systematic methodology for applying enhancement patterns across widgets with implementation checklists and quality standards.

### 🎨 **theming-for-widgets.md**
Practical guidance for implementing light/dark theming across playgrounds and production widgets (tokens, data-theme, THEME_KEY, propagation, and testing).



## Repository Standards

### �️ **workspace-organization.md**
**Single source of truth for scripts folder structure, archival, workspace validation, and preflight/afterflight checklists.**
All contributors must follow this document for any changes to scripts or workspace organization.

### 📅 **date-naming.md**
Naming conventions for photo organization and date parsing in manifest generation.

### 🏷️ **versioning.md**
Semantic versioning guidelines for widgets, manifests, and repository components.

---

## Quick Start Guide

### For New Widget Development
1. **Read**: `widget-reference.md` (quick checklist)
2. **Reference**: `widget-standards.md` (detailed patterns)
3. **Follow**: Repository versioning from `versioning.md`

### For Widget Enhancement  
1. **Review**: `widget-standards.md` (proven improvements)
2. **Apply**: `widget-development.md` (systematic process)
3. **Test**: Validate with existing standards

### For Asset Organization
1. **Follow**: `date-naming.md` (photo naming)
2. **Version**: Use `versioning.md` guidelines

---

## Development Workflow

```mermaid
graph TD
    A[New Widget] --> B[Standards Reference]
    B --> C[Implement Patterns]
    C --> D[Test & Validate]
    D --> E[Document & Version]
    
    F[Enhance Existing] --> G[Enhancement Patterns]
    G --> H[Apply Systematically]
    H --> D
    
    I[Organize Assets] --> J[Date Standards]
    J --> K[Generate Manifests]
```

---

*These standards ensure consistency, maintainability, and quality across all McCal Media widgets and assets.*