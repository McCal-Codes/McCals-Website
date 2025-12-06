# Widget Hot Reload - Architecture Diagram

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                     WIDGET HOT RELOAD SYSTEM                        │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                     DEVELOPER'S WORKFLOW                             │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. Start Dev Site                    2. Edit Widget                │
│     npm run dev                       src/widgets/*/versions/*.html  │
│     ↓                                 ↓                              │
│  http://localhost:3000                Save file                     │
│     ↓                                 ↓                              │
│  3. Press Ctrl+Shift+W ←──────────────┘                             │
│     (or click reload button)                                        │
│     ↓                                                               │
│  4. See changes instantly!                                          │
│     (no rebuild, no commit, no deploy needed)                       │
│                                                                    │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                     DEVELOPMENT MODE (localhost)                    │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────┐         ┌──────────────────┐                   │
│  │  Browser Page  │         │  React Component │                   │
│  │  (localhost)   │         │  WidgetEmbed.tsx │                   │
│  └────────┬───────┘         └────────┬─────────┘                   │
│           │                          │                             │
│           │ isDev = true            │                             │
│           ├──────────────────────────┤                             │
│           │                          │                             │
│           │ fetch('/api/widgets/...') │                            │
│           ↓                          ↓                             │
│  ┌──────────────────────────────────────────┐                     │
│  │      Next.js API Route                   │                     │
│  │  pages/api/widgets/[...slug].ts          │                     │
│  │                                          │                     │
│  │  1. Parse request path                   │                     │
│  │  2. Validate path (security check)       │                     │
│  │  3. Read file from filesystem            │                     │
│  │  4. Return HTML (no cache)               │                     │
│  └────────────┬─────────────────────────────┘                     │
│               │                                                   │
│               ↓                                                   │
│  ┌──────────────────────────────────────────┐                     │
│  │      Local Filesystem                    │                     │
│  │  src/widgets/concert-portfolio/          │                     │
│  │    versions/v4.7.1-api-optional.html    │                     │
│  └──────────────────────────────────────────┘                     │
│               │                                                   │
│               ↓                                                   │
│  HTML response (fresh, no cache)                                  │
│               │                                                   │
│               ↓                                                   │
│  ┌──────────────────────────────────────────┐                     │
│  │  WidgetEmbed Component                   │                     │
│  │  1. Inject HTML into container           │                     │
│  │  2. Re-execute <script> tags             │                     │
│  │  3. Update DOM                           │                     │
│  └──────────────────────────────────────────┘                     │
│               │                                                   │
│               ↓                                                   │
│      ✨ Changes visible instantly! ✨                              │
│                                                                    │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                     PRODUCTION MODE (deployed)                      │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────┐         ┌──────────────────┐                   │
│  │  Browser Page  │         │  React Component │                   │
│  │  (production)  │         │  WidgetEmbed.tsx │                   │
│  └────────┬───────┘         └────────┬─────────┘                   │
│           │                          │                             │
│           │ isDev = false           │                             │
│           ├──────────────────────────┤                             │
│           │                          │                             │
│           │ fetch('https://raw...')  │                            │
│           ↓                          ↓                             │
│  ┌──────────────────────────────────────────┐                     │
│  │      GitHub Raw Content CDN              │                     │
│  │  https://raw.githubusercontent.com/      │                     │
│  │    McCal-Codes/McCals-Website/main/      │                     │
│  │    src/widgets/.../versions/*.html       │                     │
│  │                                          │                     │
│  │  ✓ Caching enabled (stable versions)     │                     │
│  │  ✓ CDN distributed (fast global access)  │                     │
│  │  ✓ Frozen on commit (consistent deploys) │                     │
│  └────────────┬─────────────────────────────┘                     │
│               │                                                   │
│               ↓                                                   │
│      HTML response (cached, stable)                               │
│               │                                                   │
│               ↓                                                   │
│  ┌──────────────────────────────────────────┐                     │
│  │  WidgetEmbed Component                   │                     │
│  │  1. Inject HTML into container           │                     │
│  │  2. Re-execute <script> tags             │                     │
│  │  3. Update DOM                           │                     │
│  └──────────────────────────────────────────┘                     │
│               │                                                   │
│               ↓                                                   │
│      ✓ Production widget rendered                                 │
│        (stable, cached version)                                   │
│                                                                    │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                   REQUEST ROUTING LOGIC                              │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  WidgetEmbed.tsx checks: window.location.hostname                  │
│                                                                    │
│  ┌─────────────────┬──────────────────────────────────────────┐   │
│  │ Environment     │ Widget URL                               │   │
│  ├─────────────────┼──────────────────────────────────────────┤   │
│  │ localhost       │ /api/widgets/[widget]/[version]          │   │
│  │ (development)   │ Cache: DISABLED                          │   │
│  │                 │ Source: Local filesystem                 │   │
│  ├─────────────────┼──────────────────────────────────────────┤   │
│  │ production.com  │ https://raw.githubusercontent.com/...    │   │
│  │ (deployed)      │ Cache: ENABLED                           │   │
│  │                 │ Source: GitHub CDN                       │   │
│  └─────────────────┴──────────────────────────────────────────┘   │
│                                                                    │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                   RELOAD METHODS                                     │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Method 1: Keyboard Shortcut (Fastest ⚡)                            │
│  ────────────────────────────────────────                            │
│  Press: Ctrl+Shift+W (Windows/Linux)                                │
│  Press: Cmd+Shift+W (macOS)                                         │
│  Action: Calls reloadWidget() → Fetches fresh HTML → Updates DOM   │
│                                                                      │
│  Method 2: Click Button (Easiest 🖱️)                                 │
│  ──────────────────────────────────────                              │
│  Click: "🔄 Widget Reloader" (top-right corner)                     │
│  Click: "Reload Widget" button                                      │
│  Action: Same as keyboard shortcut                                  │
│                                                                      │
│  Method 3: Full Page Refresh (Traditional 🔃)                       │
│  ─────────────────────────────────────────────                      │
│  Press: F5 (Windows/Linux)                                          │
│  Press: Cmd+R (macOS)                                               │
│  Action: Browser reloads entire page (slower)                       │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                   COMPONENT HIERARCHY                                │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Page Component (e.g., pages/concerts.tsx)                          │
│  └─ WidgetEmbed (renders widget HTML)                              │
│     └─ [Widget HTML injected here]                                 │
│  └─ WidgetReloader (dev-only UI button)                            │
│     └─ Click → reloadWidget() → WidgetEmbed updates               │
│                                                                    │
│  Utilities:                                                        │
│  ├─ widgetHotReload.ts                                            │
│  │  ├─ reloadWidget() - Main reload function                     │
│  │  ├─ setupWidgetReloadShortcut() - Setup Ctrl+Shift+W          │
│  │  └─ showReloadNotification() - Toast message                  │
│  │                                                                 │
│  └─ widgetConfig.ts (unchanged)                                  │
│     └─ Maps page names to widget versions                        │
│                                                                    │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                   SECURITY & VALIDATION                              │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  API Route Security (/api/widgets/[...slug].ts):                   │
│                                                                    │
│  1. Parse request path                                             │
│     Input: /api/widgets/concert-portfolio/v4.7.1-api-optional.html│
│                                                                    │
│  2. Validate parameters                                            │
│     ✓ Check widget and version not empty                          │
│     ✓ Check parameters are strings                                │
│                                                                    │
│  3. Security check                                                 │
│     ✓ Prevent ".." in path (directory traversal)                  │
│     ✓ Prevent null bytes                                          │
│     ✓ Prevent double slashes                                      │
│                                                                    │
│  4. Path resolution                                                │
│     ✓ Resolve full path: /src/widgets/.../versions/[file]        │
│     ✓ Verify path stays within /src/widgets/ (no escape)         │
│                                                                    │
│  5. File access                                                    │
│     ✓ Check file exists (404 if not)                             │
│     ✓ Read file content (error handling)                         │
│     ✓ Return HTML with dev-mode headers                          │
│                                                                    │
│  Result: Safe, confined access to widget files only               │
│                                                                    │
└──────────────────────────────────────────────────────────────────────┘
```

## File Structure

```
sites/dev.mcc-cal.com/
├── pages/
│   ├── api/
│   │   └── widgets/
│   │       ├── [...slug].ts               ← NEW: Catch-all widget API
│   │       └── [widget]/
│   │           └── [version].ts           ← OLD: Removed
│   │
│   ├── concerts.tsx                       ← UPDATED: Added WidgetReloader
│   ├── journalism.tsx                     ← UPDATED: Added WidgetReloader
│   └── ... (other pages)
│
├── components/
│   └── widgets/
│       ├── WidgetEmbed.tsx                ← UPDATED: Added dev/prod routing
│       ├── WidgetReloader.tsx             ← NEW: Optional reload UI
│       └── ... (other components)
│
├── utils/
│   ├── widgetHotReload.ts                 ← NEW: Reload utilities
│   ├── widgetConfig.ts                    ← UNCHANGED
│   └── ... (other utils)
│
├── WIDGET-HOT-RELOAD-GUIDE.md             ← NEW: Full guide
├── WIDGET-HOT-RELOAD-IMPLEMENTATION.md    ← NEW: Technical details
├── WIDGET-HOT-RELOAD-QUICK-START.md       ← NEW: Quick reference
├── README.md                              ← UPDATED: Feature info
└── ... (other files unchanged)
```

## State Transitions

```
┌─────────────────────────────────────────┐
│  Widget File Edited                     │
│  src/widgets/*/versions/*.html          │
└──────────────┬──────────────────────────┘
               │
               ↓
        ┌──────────────┐
        │   User       │
        │   Presses    │
        │   Ctrl+Shift+W    │
        └──────┬───────┘
               │
               ↓
     ┌─────────────────────────┐
     │ reloadWidget() called    │
     │ (widgetHotReload.ts)    │
     └──────────┬──────────────┘
                │
                ↓
     ┌─────────────────────────┐
     │ Fetch /api/widgets/...  │
     │ cache: 'no-store'       │
     └──────────┬──────────────┘
                │
                ↓
     ┌─────────────────────────┐
     │ API Route Handler       │
     │ [...slug].ts            │
     │ - Validate path         │
     │ - Read file             │
     │ - Return HTML           │
     └──────────┬──────────────┘
                │
                ↓
     ┌─────────────────────────┐
     │ Widget HTML Content     │
     │ (Fresh from filesystem) │
     └──────────┬──────────────┘
                │
                ↓
     ┌─────────────────────────┐
     │ WidgetEmbed Component   │
     │ - Clear container       │
     │ - Inject HTML           │
     │ - Re-execute scripts    │
     └──────────┬──────────────┘
                │
                ↓
        ┌──────────────┐
        │ ✨ Widget    │
        │ Updated with │
        │ changes! ✨  │
        └──────────────┘
```

---

This architecture provides **instant feedback during development** while maintaining **production stability** through automatic environment-based routing.
