# Shared widget assets

This folder contains shared, opt-in assets for widgets. The repo's canonical widget pattern is to keep widgets self-contained; however, there are valid cases for including a small, carefully-scoped site-wide stylesheet for Squarespace hosts.

Usage recommendations
- Prefer including `src/widgets/_shared/site-widgets.css` via a pinned CDN tag (jsDelivr/GitHub releases) in Squarespace header injection or via a `link` tag in the site header.
- Widgets should continue to provide local fallbacks using the `var(--token, fallback)` pattern. This file only provides defaults.
- To scope globally but safely, this stylesheet targets classes beginning with `mcc-` and provides utility classes under the `.mcc-` namespace.

Compatibility notes
- Many existing widgets use short variable names like `--fg`, `--bg`, `--line`, `--accent`, `--panel-bg`, `--panel-border`, and `--panel-blur` inside the widget HTML. To make the global stylesheet useful without requiring widget edits, `site-widgets.css` provides sensible defaults for these common names and maps them to the `--mcc-*` tokens.
- Widgets must still keep local fallbacks (e.g., `var(--accent, #ff4d6d)`) and may override the site defaults by defining their own `:root` variables inside the widget HTML (the widget-level variables take precedence).

Example: the Accessibility Statement widget uses variables like `--panel-bg`, `--panel-border`, and `--panel-blur` inside its `:root` — these will now inherit site defaults unless the widget sets them locally.

Squarespace inclusion (recommended)
1. Create a release tag (e.g. `site-widgets@0.1.0`) and push it.
2. Use a pinned jsDelivr URL in Squarespace Header Injection or Code Injection (Site-wide) such as:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/McCal-Codes/McCals-Website@site-widgets@0.1.0/src/widgets/_shared/site-widgets.css" integrity="" crossorigin="anonymous">
```

Or paste the compiled/minified contents of `site-widgets.css` directly into the Squarespace header if you prefer not to rely on CDN.

Opt-out / local scoping
- If a widget author doesn't want the global file, continue to ship self-contained CSS in the widget HTML. The global file is deliberately minimal and additive; widgets using full overrides should keep their local CSS.

Notes
- Keep this file small — it's intended as a tiny, stable set of defaults and utilities. Complex component styles should remain inside each widget's versioned file.
- Update `updates/todo.md` with changes to this file when making edits (workspace policy).
