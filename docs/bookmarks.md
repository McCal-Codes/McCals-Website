# Workspace Bookmarks (VS Code)

This is a curated “jump list” for the most important files in this repo.

## Start here

- [Onboarding](./ONBOARDING.md)
- [Copilot/agent guardrails](../.github/copilot-instructions.md)
- [Workspace organization + scripts standards](./standards/workspace-organization.md)
- [Docs index](./README.md)

## Daily driver

- [Welcome dashboard](../updates/welcome.md)
- [Active TODOs (tracked)](../updates/todo.md)
- [Completed work log](../updates/completed.md)
- [Repository changelog](../CHANGELOG.md)

## Widget development

- [Widgets directory](../src/widgets/)
- [Widgets documentation index](./widgets/index.md)
- [Widget status workflow guide](../src/widgets/widget-status-guide.md)
- [Widget standards (full)](./standards/widget-standards.md)
- [Widget quick checklist](./standards/widget-reference.md)
- [Widget development methodology](./standards/widget-development.md)
- [Performance standards (Lighthouse reference)](./standards/performance-standards.md)
- [Accessibility patterns (WCAG 2.1 AA reference)](./standards/accessibility-patterns.md)
- [Image SEO standards](./standards/image-seo-standards.md)

## Manifests + portfolios

- [Images + portfolio manifests](../src/images/Portfolios/)
- [Manifest publishing/CDN notes](./manifest-cdn.md)
- [Manifest scripts](../scripts/manifest/)
- [Manifest watchers](../scripts/watchers/)

## API / Worker / auth

- [API source](../src/api/)
- [API docs](../src/api/README.md)
- [API deployment guide](./deployment/API-DEPLOYMENT-GUIDE.md)
- [Auth setup guide (JWT/webhooks)](./integrations/AUTH-SETUP-GUIDE.md)

## Dev sites

- [Next.js dev site (dev.mcc-cal.com)](../sites/dev.mcc-cal.com/)
- [Dev site deployment guide](../sites/dev.mcc-cal.com/DEPLOYMENT-GUIDE.md)

## CI / automation

- [GitHub workflows](../.github/workflows/)
- [Prepublish widget release workflow](../.github/workflows/prepublish-widget-release.yml)
- [Manifest automation action](../.github/actions/notify-manifest-webhook/)

## VS Code: bookmarking important spots (extension)

This repo pairs well with the **Bookmarks** extension by Alessandro Fragnani:

- Upstream README (full feature list + settings): https://github.com/alefragnani/vscode-bookmarks/blob/master/README.md

### Repo integration

- This repo recommends the extension via `.vscode/extensions.json`.
- This repo also includes sensible defaults in `.vscode/settings.json` (sidebar + navigation).
- If you want your bookmarks to persist _with the repo_ across machines, enable:
  - `"bookmarks.saveBookmarksInProject": true`
  - (It’s intentionally commented out by default so personal bookmarks don’t accidentally become shared repo data.)

When `saveBookmarksInProject` is enabled, the extension reads/writes:

- `.vscode/bookmarks.json`

This repo includes a small starter `.vscode/bookmarks.json` so you can opt in and immediately get a baseline set of “jump points”.

If you prefer bookmarks to be **personal** (not shared/committed), keep `saveBookmarksInProject` off — or add `.vscode/bookmarks.json` to your local ignore rules.

### Quick-open helpers

- `npm run bookmarks:open`
- `npm run onboarding:open`
- `npm run todo:open`

There are also matching VS Code tasks (search `Docs: Open` / `Updates: Open`).

### Commands (Command Palette)

- `Bookmarks: Toggle` — Mark/unmark positions with bookmarks
- `Bookmarks: Toggle Labeled` — Mark labeled bookmarks
- `Bookmarks: Jump to Next` — Move the cursor forward, to the bookmark below
- `Bookmarks: Jump to Previous` — Move the cursor backward, to the bookmark above
- `Bookmarks: List` — List all bookmarks in the current file
- `Bookmarks: List from All Files` — List all bookmarks from all files
- `Bookmarks: Clear` — Remove all bookmarks in the current file
- `Bookmarks: Clear from All Files` — Remove all bookmarks from all files

### Selection helpers (great for log analysis)

- `Bookmarks (Selection): Select Lines` — Select all lines that contains bookmarks
- `Bookmarks (Selection): Expand Selection to Next` — Expand the selected text to the next bookmark
- `Bookmarks (Selection): Expand Selection to Previous` — Expand the selected text to the previous bookmark
- `Bookmarks (Selection): Shrink Selection` — Shrink the selection to the Previous/Next bookmark

### Optional settings

Nice for multi-root workspaces / remote dev / sharing across machines:

```jsonc
"bookmarks.saveBookmarksInProject": true,
"bookmarks.navigateThroughAllFiles": true,
"bookmarks.wrapNavigation": true
```

> Note: enabling `saveBookmarksInProject` stores bookmarks in the repo (so you can share/sync them). If you’d rather keep bookmarks personal, leave it off.

### Tip: set your own hotkeys

Open **Keyboard Shortcuts** and search for `Bookmarks:` to bind your favorites (typically Toggle + List from All Files + Next/Previous).
