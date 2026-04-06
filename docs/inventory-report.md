# McCal Media Documentation Inventory

**Generated:** April 6, 2026  
**Purpose:** Full catalog of all docs with outdated content flagged for cleanup

---

## Summary

| Category | Count | Outdated | Action Required |
|----------|-------|----------|-----------------|
| Root docs | 11 | 5 | Major updates needed |
| standards/ | 18 | 0 | ✅ Cleaned |
| workflows/ | 6 | 2 | Review for Vite relevance |
| deployment/ | 5 | 0 | Current |
| integrations/ | 14 | 0 | Current |
| runbooks/ | 3 | 0 | Current |
| agents/ | 4 | 2 | Review git scripts |
| widgets/ | 2 | 2 | Archive |
| archive/ | 30 | — | Already archived |
| Other | 4 | 2 | Review |
| **Total** | **97** | **13** | **13 docs need attention** |

---

## Root-Level Documents (docs/)

| File | Status | Size | Issues |
|------|--------|------|--------|
| **README.md** | ⚠️ **OUTDATED** | 5,933 B | References `automation/` (doesn't exist), lists 4 missing widget docs, Squarespace architecture description, broken links |
| **ONBOARDING.md** | ⚠️ **OUTDATED** | 2,508 B | Squarespace widget workflow, copy/paste widget HTML instructions, widget manifest generation |
| **CHANGELOG.md** | ⚠️ **STALE** | 7,277 B | Stops at 2025-11-19, no Vite migration mentioned, entirely widget-focused history |
| **repo-improvement-plan.md** | ⚠️ **MIXED** | 4,255 B | Widget CSS/JS modernization goals — may be partially superseded by Vite work |
| **PRE-2026-CHECKLIST.md** | ✅ **CURRENT** | 7,341 B | Pre-Vite checklist — historical reference value |
| **IMAGE-OPTIMIZATION.md** | ✅ **CURRENT** | 2,336 B | Image optimization guide — still relevant |
| **manifest-cdn.md** | ✅ **CURRENT** | 3,982 B | Manifest CDN documentation — still relevant |
| **README-MISSING-SECTIONS-TEMPLATES.md** | ✅ **CURRENT** | 6,824 B | Templates for documentation |
| **bookmarks.md** | ✅ **CURRENT** | 4,856 B | Resource bookmarks |
| **.DS_Store** | 🗑️ **DELETE** | 10,244 B | macOS metadata — remove |

### Root Doc Actions

1. **README.md** — Complete rewrite needed:
   - Remove `automation/` references
   - Update to Vite architecture
   - Fix 4 broken widget doc links
   - Remove Squarespace copy/paste workflow
   - Update quick links to actual standards

2. **ONBOARDING.md** — Update for Vite:
   - Replace "Squarespace widgets" with "Vite site"
   - Update commands (remove widget validation)
   - Update file paths (`src/widgets/` → `src/`)
   - Replace manifest generation with Vite build

3. **CHANGELOG.md** — Add Vite migration entry:
   - Add 2026 entry for Vite site launch
   - Add widget-to-Vite migration note

---

## standards/ — ✅ CLEANED

| File | Status | Size | Notes |
|------|--------|------|-------|
| README.md | ✅ **CURRENT** | 3,665 B | Just updated — accurate TOC and links |
| widget-to-vite.md | ✅ **NEW** | 3,505 B | Migration guide created |
| ui-patterns.md | ✅ **CURRENT** | 3,499 B | Legacy reference removed |
| accessibility-patterns.md | ✅ **CURRENT** | 17,430 B | Detailed a11y guidelines |
| performance-standards.md | ✅ **CURRENT** | 5,532 B | Performance optimization |
| image-seo-standards.md | ✅ **CURRENT** | 4,210 B | Image SEO |
| seo-starter-guide.md | ✅ **CURRENT** | 39,478 B | Comprehensive SEO |
| seo-testing-guide.md | ✅ **CURRENT** | 7,948 B | SEO validation |
| workspace-organization.md | ✅ **CURRENT** | 11,414 B | File structure |
| date-naming.md | ✅ **CURRENT** | 1,884 B | Naming conventions |
| scripts-folder-organization.md | ✅ **CURRENT** | 2,276 B | Scripts structure |
| preflight-afterflight.md | ✅ **CURRENT** | 1,775 B | Validation checklists |
| code-annotations.md | ✅ **CURRENT** | 9,553 B | Code annotation standards |
| debugging.md | ✅ **CURRENT** | 731 B | Debugging guide |
| dark-mode-audit.md | ✅ **CURRENT** | 1,817 B | Dark mode standards |
| security-organization-checklist.md | ✅ **CURRENT** | 1,732 B | Security checklist |
| security-organization-prompt.md | ✅ **CURRENT** | 2,182 B | Security prompt |
| archive/ | ✅ **ARCHIVED** | — | legacy-standards/ moved here |

---

## workflows/ — Review for Vite Relevance

| File | Status | Size | Issues |
|------|--------|------|--------|
| **portfolio-image-import.md** | ⚠️ **REVIEW** | 3,581 B | Likely still relevant but may reference old paths |
| **journalism-import-workflow.md** | ⚠️ **REVIEW** | 4,415 B | Check for widget references |
| **event-portfolio-ingest.md** | ⚠️ **REVIEW** | 4,458 B | Check for widget references |
| **CONCERT-AUTO-READER.md** | ✅ **CURRENT** | 6,491 B | Automation docs — still relevant |
| **GITHUB-ACTIONS-CLOUDFLARE-INTEGRATION.md** | ✅ **CURRENT** | 9,756 B | CI/CD docs — still relevant |
| **PERFORMANCE-MONITORING.md** | ✅ **CURRENT** | 8,343 B | Performance monitoring — still relevant |

### workflows/ Actions

- [ ] Review `portfolio-image-import.md` for path references
- [ ] Review `journalism-import-workflow.md` for widget references
- [ ] Review `event-portfolio-ingest.md` for widget references

---

## deployment/ — ✅ CURRENT

| File | Status | Size | Notes |
|------|--------|------|-------|
| DEPLOYMENT.md | ✅ **CURRENT** | 6,801 B | Main deployment docs |
| DEPLOY-CHEATSHEET.md | ✅ **CURRENT** | 1,718 B | Quick reference |
| PACKAGE-DEPLOYMENT.md | ✅ **CURRENT** | 7,588 B | Package-based deployment |
| SETUP-GITHUB-HOSTING.md | ✅ **CURRENT** | 3,718 B | GitHub Pages setup |
| API-DEPLOYMENT-GUIDE.md | ✅ **CURRENT** | 6,678 B | API deployment |

---

## integrations/ — ✅ CURRENT

| File | Status | Size | Notes |
|------|--------|------|-------|
| api-integration-guide.md | ✅ **CURRENT** | 9,563 B | API integration |
| AUTH-SETUP-GUIDE.md | ✅ **CURRENT** | 10,559 B | Auth setup |
| AUTH-TOKEN-QUICK-REFERENCE.md | ✅ **CURRENT** | 3,353 B | Auth quick ref |
| CLOUDFLARE-SUBDOMAIN-SETUP.md | ✅ **CURRENT** | 7,020 B | Cloudflare setup |
| google-reviews-extraction.md | ✅ **CURRENT** | 3,853 B | Google reviews |
| google-reviews-integration-options.md | ✅ **CURRENT** | 4,505 B | Reviews integration |
| logo-sources.md | ✅ **CURRENT** | 4,762 B | Logo resources |
| manifest-webhook-worker.md | ✅ **CURRENT** | 3,130 B | Webhook worker |
| API-QUICKREF.md | ✅ **CURRENT** | 2,052 B | API quick reference |
| blog-system-integration.md | ✅ **CURRENT** | 13,506 B | Blog integration |
| calendar-integration.md | ✅ **CURRENT** | 4,455 B | Calendar integration |
| rss-integration.md | ✅ **CURRENT** | 3,586 B | RSS integration |
| seo-automation-guide.md | ✅ **CURRENT** | 9,359 B | SEO automation |
| api-seo-benefits.md | ✅ **CURRENT** | 11,276 B | SEO benefits |

---

## runbooks/ — ✅ CURRENT

| File | Status | Size | Notes |
|------|--------|------|-------|
| vercel-admin-console.md | ✅ **CURRENT** | 3,402 B | Vercel admin app |
| vercel-production-launch.md | ✅ **CURRENT** | 4,128 B | Production launch |
| vercel-deployment-troubleshooting.md | ✅ **CURRENT** | 7,712 B | Troubleshooting |

---

## agents/ — Review for Current Use

| File | Status | Size | Issues |
|------|--------|------|--------|
| **reorganizing-agent.md** | ⚠️ **REVIEW** | 3,453 B | Git hygiene scripts — may be outdated |
| **reorganize-check.sh** | ⚠️ **REVIEW** | 5,573 B | Shell script — verify if still used |
| git-hygiene.md | ✅ **CURRENT** | 1,625 B | Git hygiene guide |
| git-hygiene.sh | ✅ **CURRENT** | 1,466 B | Git hygiene script |

---

## widgets/ — 🗑️ ARCHIVE

| File | Status | Size | Issues |
|------|--------|------|--------|
| **index.md** | 🗑️ **ARCHIVE** | 1,635 B | Widget index — superseded by Vite |
| **registry.json** | 🗑️ **ARCHIVE** | 3,041 B | Widget registry — no longer needed |

### widgets/ Action

- [ ] Move entire `widgets/` directory to `archive/widgets-registry/`

---

## Other Directories

| Directory | Items | Status | Notes |
|-----------|-------|--------|-------|
| **learned/** | 1 | ✅ **CURRENT** | `manifest-webhook-integration.md` — lessons learned doc |
| **case-studies/** | 1 | ✅ **CURRENT** | `performance-seo-case-studies.md` — still relevant |
| **development/** | 1 | ⚠️ **REVIEW** | `WIDGET-OPTIMIZATION-LEARNINGS.md` — widget-focused, may archive |
| **archive/** | 30 | ✅ **ARCHIVED** | Already archived content |
| **_archived/** | 0 | ✅ **EMPTY** | Can remove empty directory |
| **legacy/** | 0 | ✅ **EMPTY** | Successfully moved to `archive/legacy-standards/` |

---

## Archive Directory Structure

```
docs/archive/
├── legacy-standards/          (18 items) — ✅ Moved from standards/legacy/
│   ├── widget-reference.md
│   ├── widget-standards.md
│   ├── widget-development.md
│   └── ... (14 more legacy docs)
├── widget-unification-todo.md
├── REORGANIZATION-2025-10-04.md
└── (16 other archived items)
```

---

## Priority Action List

### Critical (Update Immediately)

1. **[ ] docs/README.md** — Rewrite for Vite (remove Squarespace, fix links)
2. **[ ] docs/ONBOARDING.md** — Update for Vite workflow
3. **[ ] docs/CHANGELOG.md** — Add Vite migration entry

### High Priority (This Week)

4. **[ ] docs/widgets/** — Move to archive/widgets-registry/
5. **[ ] docs/development/WIDGET-OPTIMIZATION-LEARNINGS.md** — Review and potentially archive
6. **[ ] docs/workflows/portfolio-image-import.md** — Review for path references
7. **[ ] docs/workflows/journalism-import-workflow.md** — Check for widget references
8. **[ ] docs/workflows/event-portfolio-ingest.md** — Check for widget references

### Medium Priority (Review When Convenient)

9. **[ ] docs/agents/reorganizing-agent.md** — Verify if still used
10. **[ ] docs/agents/reorganize-check.sh** — Verify if still used
11. **[ ] docs/repo-improvement-plan.md** — Update progress/status

### Cleanup

12. **[ ] docs/.DS_Store** — Delete macOS metadata file
13. **[ ] docs/_archived/** — Remove empty directory

---

## Statistics

- **Total documents inventoried:** 97
- **Active and current:** 73 (75%)
- **Outdated and needs attention:** 13 (13%)
- **Already archived:** 30 (31%)
- **Missing directory (referenced in README):** `docs/automation/` — create or remove references

---

## Notes

- The `standards/` directory has been successfully cleaned and modernized
- Most deployment, integration, and runbook documentation is current
- Main gaps are in root-level docs that still describe the widget/Squarespace workflow
- The Vite site architecture needs to be documented as the primary approach
