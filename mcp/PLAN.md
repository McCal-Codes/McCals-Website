# McCal Media MCP Server - Draft Plan

> Draft for a Model Context Protocol server to expose local tools for the McCal Media website workflow.
> Created: April 2026

---

## 1. Quick Overview

**What**: A local MCP server exposing McCal Media's scripts/tools as AI-callable functions  
**Why**: Let AI assistants (Windsurf, Claude Desktop, etc.) run your existing workflows  
**Where**: `mcp/` directory or `src/mcp/`  
**Transport**: Stdio (simple, no ports) or extend existing API

---

## 2. Proposed Tool Inventory

### Tier 1: Essential (Implement First)

| Tool | Purpose | Maps To | Value |
|------|---------|---------|-------|
| `manifest_generate` | Auto-generate portfolio manifests | `npm run manifest:generate` | High - run frequently |
| `widget_list` | See all widgets + versions | `scripts/utils/scan-widget-versions.js` | High - always need visibility |
| `repo_health` | Quick repo status check | `npm run repo:health` | High - sanity check |
| `image_optimize` | Optimize specific folders | `scripts/optimize-images.js` | High - regular task |

### Tier 2: Workflow Helpers

| Tool | Purpose | Maps To | Value |
|------|---------|---------|-------|
| `widget_validate` | Check widget HTML/JS | `scripts/utils/validate-widget-html.js` | Medium - quality gate |
| `manifest_diff` | See what's changed | Custom wrapper around git diff | Medium - before committing |
| `content_stats` | Portfolio photo counts | Parse manifest JSONs | Medium - quick insights |
| `dev_server_status` | Is dev server running? | Port check + process check | Medium - avoid conflicts |

### Tier 3: CMS Tools (Content Management)

| Tool | Purpose | Maps To | Value |
|------|---------|---------|-------|
| `content_edit_metadata` | Edit photo captions, titles, tags | Edit manifest JSONs | High - frequent updates |
| `content_create_post` | Create blog post from template | `src/content/blog/posts/` + manifest | Medium - weekly |
| `content_organize` | Move/rename photos, update manifests | File ops + manifest regen | Medium - after imports |
| `content_publish` | Stage changes, suggest commit | Git status + diff | Medium - workflow |
| `content_search` | Find photos by metadata | Manifest search | Low - occasional |

### Tier 4: Advanced

| Tool | Purpose | Maps To | Value |
|------|---------|---------|-------|
| `image_analyze` | Find large/unoptimized files | `scripts/utils/repo-maintenance.js` | Low - occasional |
| `widget_readme_audit` | Find missing READMEs | `scripts/utils/widget-readme-audit.js` | Low - periodic cleanup |
| `seo_generate` | Generate sitemap/schema | `npm run seo:all` | Low - post-build |
| `concert_organize` | Auto-organize concert photos | `scripts/watchers/auto-concert-organizer.js` | Low - specific workflow |

---

## 3. Architecture: Hybrid Approach

### MCP Server (Primary - AI/You)

```
┌─────────────────┐      ┌──────────────┐      ┌─────────────────┐
│  Windsurf IDE   │ ────▶│  mcp-server  │ ────▶│  Your Scripts   │
│  Claude Desktop │      │  (stdio)     │      │  Manifests      │
│  AI Tools       │◄──── │              │◜──── │  Content        │
└─────────────────┘      └──────────────┘      └─────────────────┘
```

**For**: Developers, AI-assisted workflows, batch operations

### Simple Admin UI (Secondary - Non-technical)

```
┌─────────────────┐      ┌──────────────┐      ┌─────────────────┐
│  Browser        │ ────▶│  admin.html  │ ────▶│  Same manifests │
│  (occasional    │      │  (read-only  │      │  Same content   │
│   editors)      │◄──── │   + forms)   │◜──── │  Git commits    │
└─────────────────┘      └──────────────┘      └─────────────────┘
```

**For**: Occasional non-technical edits (captions, simple blog posts)

### Data Layer (Shared)

Both interfaces work with:
- `src/data/*-manifest.json` - Photo metadata
- `src/content/blog/posts/*.md` - Blog posts
- `src/images/Portfolios/` - Image files

---

## 4. Implementation Structure

### MCP Server

```
mcp/
├── server.js              # MCP server entry
├── package.json           # MCP dependencies
├── tools/
│   ├── manifest.js        # manifest_generate, manifest_diff
│   ├── widget.js          # widget_list, widget_validate
│   ├── image.js           # image_optimize, image_analyze
│   ├── repo.js            # repo_health, content_stats
│   ├── dev.js             # dev_server_status
│   └── content.js         # content_edit_metadata, content_create_post, etc.
├── handlers/
│   └── index.js           # Tool execution logic
├── utils/
│   ├── spawn.js           # Safe script spawning
│   └── paths.js           # Repo path resolution
└── README.md
```

### Simple Admin UI

```
admin/
├── index.html             # Dashboard
├── css/
│   └── admin.css
├── js/
│   ├── app.js             # Main app
│   ├── api-client.js      # Talks to simple backend
│   └── components/
│       ├── photo-editor.js
│       └── post-editor.js
└── README.md
```

### Backend for Admin

Extend existing Express API with `/admin/*` endpoints.

---

## 5. Sample Tool Definitions

### `widget_list`

```javascript
{
  name: "widget_list",
  description: "List all widgets in src/widgets/ with their versions",
  inputSchema: {
    type: "object",
    properties: {
      filter: {
        type: "string",
        description: "Filter by name pattern (optional)",
        enum: ["all", "terra", "nova", "navigation", "shared"]
      }
    }
  },
  returns: {
    widgets: [
      { name: "gallery", version: "v1", path: "src/widgets/gallery/v1/", hasReadme: true }
    ]
  }
}
```

### `manifest_generate`

```javascript
{
  name: "manifest_generate",
  description: "Generate portfolio manifests for specified targets",
  inputSchema: {
    type: "object",
    properties: {
      target: {
        type: "string",
        enum: ["all", "concert", "events", "journalism", "nature", "portrait", "blog"]
      },
      dryRun: { type: "boolean", default: false }
    },
    required: ["target"]
  }
}
```

### `image_optimize`

```javascript
{
  name: "image_optimize",
  description: "Optimize images in specified portfolio folder",
  inputSchema: {
    type: "object",
    properties: {
      portfolio: {
        type: "string",
        enum: ["Concert", "Events", "Journalism", "Nature", "Portrait"]
      },
      format: { type: "string", enum: ["webp", "avif"], default: "webp" },
      quality: { type: "number", default: 85 }
    },
    required: ["portfolio"]
  }
}
```

### `content_edit_metadata`

```javascript
{
  name: "content_edit_metadata",
  description: "Edit metadata for photos in a portfolio",
  inputSchema: {
    type: "object",
    properties: {
      portfolio: {
        type: "string",
        enum: ["concert", "events", "journalism", "nature", "portrait"]
      },
      photoId: { type: "string" },
      updates: {
        type: "object",
        properties: {
          title: { type: "string" },
          caption: { type: "string" },
          tags: { type: "array", items: { type: "string" } },
          featured: { type: "boolean" }
        }
      }
    },
    required: ["portfolio", "photoId", "updates"]
  }
}
```

### `content_create_post`

```javascript
{
  name: "content_create_post",
  description: "Create a new blog post from template",
  inputSchema: {
    type: "object",
    properties: {
      title: { type: "string" },
      slug: { type: "string" },
      author: { type: "string" },
      category: { type: "string", enum: ["photo", "tech", "workflow"] },
      draft: { type: "boolean", default: true }
    },
    required: ["title", "slug"]
  }
}
```

### `repo_health`

```javascript
{
  name: "repo_health",
  description: "Run repository health checks",
  inputSchema: {
    type: "object",
    properties: {
      checks: {
        type: "array",
        items: { enum: ["clean", "large-files", "lint", "manifests"] },
        default: ["clean", "large-files"]
      }
    }
  }
}
```

---

## 6. Windsurf Configuration

Add to `.windsurf/mcp-config.json`:

```json
{
  "mcpServers": {
    "mccal-local": {
      "command": "node",
      "args": ["mcp/server.js"],
      "cwd": "i:/Programing/Projects/McCals-Website"
    }
  }
}
```

---

## 7. Development Phases

### Phase 1: MCP MVP (2-3 hours)
- [ ] Scaffold MCP server with `@modelcontextprotocol/sdk`
- [ ] Implement `widget_list` (simplest - reads directories)
- [ ] Implement `repo_health` (wraps npm script)
- [ ] Test with Windsurf

### Phase 2: MCP Core Tools (3-4 hours)
- [ ] `manifest_generate` (wraps manifest generator)
- [ ] `image_optimize` (wraps optimize-images.js)
- [ ] `content_edit_metadata` (edit manifest JSONs)
- [ ] Error handling & logging

### Phase 3: MCP CMS Tools (2-3 hours)
- [ ] `content_create_post` (blog post template)
- [ ] `content_organize` (file operations)
- [ ] `content_publish` (git workflow)
- [ ] Progress notifications for long-running tools

### Phase 4: Simple Admin UI (3-4 hours)
- [ ] Static HTML admin dashboard
- [ ] Photo metadata editor (forms)
- [ ] Blog post creator (markdown editor)
- [ ] Read-only preview of manifests

### Phase 5: Integration (1-2 hours)
- [ ] Extend API with `/admin/*` endpoints
- [ ] Connect admin UI to backend
- [ ] Documentation & README

---

## 8. Open Questions

1. **First tools**: Which 2-3 MCP tools would you use immediately?
2. **Admin users**: Who are the occasional editors? (need names/emails for simple auth)
3. **Admin scope**: What should they edit? (captions only, or also blog posts?)
4. **Dependencies**: OK to add `@modelcontextprotocol/sdk` to package.json?
5. **Admin auth**: Simple password, or just localhost-only for now?

---

## 9. Next Steps

Once you decide:
1. I'll create the server scaffold
2. Implement your chosen Tier 1 tools
3. Add Windsurf configuration
4. Test it works in your IDE

**Which tools from Tier 1 are most important to you?**
