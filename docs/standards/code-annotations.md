# Code Annotations Standard

_Last updated: 2025-12-27_

This document defines the standard annotation keywords used throughout the McCals-Website repository for tracking work items, issues, and areas requiring attention.

**For AI Agents:** Use these annotations consistently when writing code. When you encounter these keywords while reading code, treat them as actionable items or important context depending on the keyword type.

---

## Annotation Keywords

Use these keywords in code comments to flag items for future attention. Always use **UPPERCASE** for consistency and easier `grep`/search.

### 🔴 Critical Keywords (Action Required)

| Keyword    | Purpose                                                    | Priority | When to Use                                           |
| ---------- | ---------------------------------------------------------- | -------- | ----------------------------------------------------- |
| `SECURITY` | Security-sensitive code requiring review before production | Critical | Authentication, authorization, data handling, secrets |
| `FIXME`    | Broken code that needs immediate repair                    | High     | Runtime errors, incorrect behavior, crashes           |
| `BUG`      | Known bug that hasn't been fixed yet                       | High     | Documented issues, edge cases, regressions            |

### 🟡 Work Item Keywords (Tracked Tasks)

| Keyword      | Purpose                            | Priority | When to Use                                         |
| ------------ | ---------------------------------- | -------- | --------------------------------------------------- |
| `TODO`       | Work that needs to be done         | Medium   | Features, improvements, follow-up tasks             |
| `HACK`       | Workaround that should be replaced | Medium   | Temporary fixes, CSS overrides, compatibility shims |
| `DEPRECATED` | Code scheduled for removal         | Medium   | Legacy functions, old patterns, migration targets   |
| `WIP`        | Work in progress, incomplete       | Medium   | Partial implementations, experimental code          |

### 🟢 Information Keywords (Context Only)

| Keyword    | Purpose                                    | Priority | When to Use                                         |
| ---------- | ------------------------------------------ | -------- | --------------------------------------------------- |
| `NOTE`     | Important context or explanation           | Info     | Non-obvious behavior, design decisions, constraints |
| `REVIEW`   | Needs code review or second opinion        | Medium   | Uncertain approaches, complex logic, edge cases     |
| `OPTIMIZE` | Performance improvement opportunity        | Low      | Slow operations, memory usage, render performance   |
| `REFACTOR` | Code that works but should be restructured | Low      | Duplicate code, poor organization, tech debt        |

### 🔵 Documentation Keywords

| Keyword   | Purpose                          | Priority | When to Use                                    |
| --------- | -------------------------------- | -------- | ---------------------------------------------- |
| `DOCS`    | Documentation needed or outdated | Low      | Missing README, outdated examples, API changes |
| `EXAMPLE` | Example code for reference       | Info     | Usage patterns, integration samples            |
| `SEE`     | Reference to related code/docs   | Info     | Cross-references, related implementations      |

### ⚡ Testing & Quality Keywords

| Keyword | Purpose                                | Priority | When to Use                             |
| ------- | -------------------------------------- | -------- | --------------------------------------- |
| `TEST`  | Test coverage needed                   | Medium   | Untested code paths, edge cases         |
| `MOCK`  | Mock data or stub implementation       | Info     | Placeholder data, fake API responses    |
| `DEBUG` | Debug code to remove before production | High     | Console logs, test flags, dev-only code |

### 🎨 UI/UX Keywords

| Keyword      | Purpose                                 | Priority | When to Use                                      |
| ------------ | --------------------------------------- | -------- | ------------------------------------------------ |
| `A11Y`       | Accessibility improvement needed        | Medium   | ARIA labels, keyboard nav, screen reader support |
| `RESPONSIVE` | Responsive design adjustment needed     | Medium   | Mobile layouts, breakpoints, touch targets       |
| `UX`         | User experience improvement opportunity | Low      | Flow improvements, feedback, micro-interactions  |

---

## Comment Format

### Basic Format

```javascript
// KEYWORD: Brief description of the issue
```

### Extended Format (Recommended for complex items)

```javascript
// KEYWORD: Brief description
// - Additional context line 1
// - Additional context line 2
// See: reference/link/file
```

### With Date (Recommended for critical items)

```javascript
// SECURITY (2025-12-27): Brief description
// Owner: @username or team responsible
```

### Example

```javascript
// SECURITY: Plaintext password comparison. This is DEVELOPMENT ONLY.
// Before production deployment:
//   1. Install bcrypt: npm install bcrypt
//   2. Hash passwords on author creation/update
//   3. Replace this check with: await bcrypt.compare(password, author.passwordHash)
// See: updates/todo.md "Cloudflare Worker Deployment" for production checklist.
if (author.password !== password) {
```

---

## File-Level Annotations

For widget HTML files and other documents, use HTML comment blocks at the top:

```html
<!--
Widget: Concert Portfolio v4.7.0
Author: Caleb McCartney

TODO: Add random song preview feature
FIXME: Close button z-index on mobile Safari
NOTE: Requires Spotify artist map for preview functionality
A11Y: Add focus trap to lightbox modal
-->
```

---

## CSS Annotations

```css
/* HACK: Override Squarespace default padding */
.widget-container {
  padding: 0 !important;
}

/* RESPONSIVE: Adjust grid for tablets */
@media (max-width: 768px) {
  /* TODO: Test on iPad Pro */
}
```

---

## Tracking in updates/todo.md

For significant items, also add them to the central tracking file:

1. **Open** `updates/todo.md`
2. **Find** the appropriate section
3. **Add** a checkbox item: `- [ ] TODO: Brief description`
4. **Reference** the file/location if helpful

### When to Add to todo.md

| Add to todo.md              | Keep as inline comment only |
| --------------------------- | --------------------------- |
| Takes >30 min to fix        | Quick 5-minute fix          |
| Blocks other work           | Nice-to-have improvement    |
| Security-related            | Context/explanation notes   |
| User-facing bug             | Internal code clarity       |
| Requires external resources | Self-contained refactor     |
| Multiple files affected     | Single file scope           |

---

## Searching for Annotations

### Find all TODOs in the repo

```bash
grep -rn "TODO:" --include="*.js" --include="*.html" --include="*.css" src/
```

### Find high-priority items (Critical)

```bash
grep -rn "FIXME:\|BUG:\|SECURITY:\|DEBUG:" --include="*.js" --include="*.html" src/
```

### Find all work items

```bash
grep -rn "TODO:\|FIXME:\|BUG:\|HACK:\|WIP:\|DEPRECATED:" src/
```

### Find accessibility issues

```bash
grep -rn "A11Y:\|ARIA\|keyboard\|focus" --include="*.js" --include="*.html" src/
```

### Find all annotations (comprehensive)

```bash
grep -rn "TODO:\|FIXME:\|BUG:\|HACK:\|SECURITY:\|OPTIMIZE:\|DEPRECATED:\|NOTE:\|REVIEW:\|WIP:\|A11Y:\|DEBUG:" src/
```

### VS Code Users

Install the **Todo Tree** extension for visual tracking of annotations across the workspace. Configure it to recognize all keywords above.

---

## AI Agent Guidelines

When working in this repository:

1. **Reading code**: Pay attention to annotations as context for understanding intent
2. **Writing code**: Add appropriate annotations for incomplete work, workarounds, or important context
3. **Fixing issues**: Remove the annotation when the issue is resolved
4. **Adding features**: Use `TODO` for follow-up work, `NOTE` for design decisions
5. **Security-sensitive code**: Always use `SECURITY` tag with clear mitigation steps
6. **Never ignore**: `SECURITY`, `FIXME`, `BUG` annotations - flag these to the user

### Annotation Decision Tree

```text
Is it broken? → FIXME or BUG
Is it a security risk? → SECURITY
Is it incomplete? → TODO or WIP
Is it a workaround? → HACK
Is it context-only? → NOTE
Does it need review? → REVIEW
Is it slow? → OPTIMIZE
Does it need tests? → TEST
Is it for accessibility? → A11Y
Should it be removed? → DEPRECATED or DEBUG
```

---

## Quick Reference

| Searching for...      | Use keyword... |
| --------------------- | -------------- |
| Missing features      | `TODO`         |
| Broken things         | `FIXME`, `BUG` |
| Temporary workarounds | `HACK`         |
| Security concerns     | `SECURITY`     |
| Performance issues    | `OPTIMIZE`     |
| Important context     | `NOTE`         |
| Accessibility gaps    | `A11Y`         |
| Old code to remove    | `DEPRECATED`   |
| Dev-only code         | `DEBUG`        |
| Incomplete work       | `WIP`          |
| Needs testing         | `TEST`         |

---

_See also: [widget-standards.md](./widget-standards.md), [widget-changelog-standard.md](./widget-changelog-standard.md), [workspace-organization.md](./workspace-organization.md)_
