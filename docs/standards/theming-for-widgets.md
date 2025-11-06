## Theming for Widgets — Patterns & Guidance

This document captures the theming conventions and integration patterns used across the workspace so future contributors can implement and test light/dark themes consistently for both the playground and production widgets.

Key goals
- Use neutral palettes (black/white shades) for global theme tokens unless a widget specifically requires an accent color.
- Keep theme plumbing consistent across playgrounds, widgets, and CI visual tests.
- Provide safe propagation methods so embedded widgets (Squarespace Code Blocks or iframes) can reflect the host page theme.

Core concepts
- Theme tokens: define colors and related tokens using CSS custom properties in a single canonical place. Example tokens used in the playground:

  --bg, --surface, --elev-1, --text, --muted, --glass, --focus

- data-theme attribute: widgets and the playground switch theme by adding `data-theme="dark"` on the `:root`/`html` element. When absent, the UI should respect `prefers-color-scheme`.

- Theme key (persisted preference): store user preference under THEME_KEY = `mcc-theme` (localStorage). Valid values: `dark`, `light`, or no key (means follow system until user chooses).

JS contract (small, portable API)
- getSavedPreference() -> 'dark' | 'light' | null
- savePreference(theme: 'dark' | 'light' | null) -> void
- applyTheme(theme: 'dark' | 'light' | null) -> void  // sets/clears `data-theme` on documentElement

Propagation strategies (same-origin / cross-origin)
- Same-origin embed (recommended when possible): widget iframe or inline HTML can directly read `document.documentElement.getAttribute('data-theme')` from the parent and apply the same attribute locally on the widget host.
- Cross-origin or unknown origin: use postMessage. Host page should post a JSON message like `{ type: 'mcc-theme', theme: 'dark' }` and widgets should listen for messages and apply the theme when received.

Playground specifics (static safe-edit `v1.3.html`)
- The playground implements the following patterns used by tests and CI:
  - URL override: `?theme=dark` or `?theme=light` — useful for deterministic Playwright visual tests.
  - LocalStorage persistence: THEME_KEY = `mcc-theme` to remember explicit user choice.
  - System change listener: if no explicit user preference, the playground reacts to `prefers-color-scheme` changes.

Testing & Visual regression
- Use a URL query param in Playwright tests to force theme (e.g., `v1.3.html?theme=dark`) so snapshots are deterministic.
- When the playground is intentionally aligned to production (visual parity), update snapshots purposefully and commit them with a clear message (e.g., `chore(playground): update visual baselines to production nav head`).

Accessibility notes
- Ensure focus-visible outlines are expressed using tokens (e.g., `--focus`) and are sufficiently distinct in both light/dark themes.
- Respect `prefers-reduced-motion` and avoid heavy motion by default for theme transitions.

Developer operational guidance
- When copying production parts into the playground, keep CSS-critical rules in the document head and markup + behavioral scripts in the body — this mirrors how production widgets are authored and simplifies extraction/sync tooling.
- For automation/syncing, prefer an HTML parser (cheerio) over brittle regex heuristics when extracting or patching sections between `BEGIN_COPY` markers.
- If you change token names or semantic tokens, update: playground `v1.3.html`, `docs/standards/theming-for-widgets.md`, and any manifest/generator scripts that consume colors.

Migration tips
- If you need to introduce accents later, create a small accent layer (e.g., `--accent-1`, `--accent-2`) and keep defaults neutral; document the rationale in this file.

Where to look next
- Playground: `src/widgets/css-playground/versions/v1.3.html`
- Production nav example: `src/widgets/site/navigation/versions/v1.7.0-performance-optimized.html`
- Theme-aware tests: `tests/playwright/nav-theme.spec.js`

If you want, I can add an example widget snippet showing how to listen for `postMessage` theme changes and apply them safely (small 40–60 line example) — say the word and I'll add it to this file.

***
Last updated: 2025-11-05
