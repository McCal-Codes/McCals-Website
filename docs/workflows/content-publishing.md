# Content Publishing Workflow

This workflow defines boundaries between authored content and generated outputs.

## Source of Truth

- **Authored content**: files intentionally edited by humans.
  - Example: `src/images/Portfolios/Journalism/**/tags.json`
  - Example: `src/images/Portfolios/Journalism/**/captions.json`
  - Example: `src/content/blog/posts/**/post.md`
- **Generated output**: files produced by scripts and build tooling.
  - Example: `src/images/Portfolios/Journalism/journalism-manifest.json`
  - Example: `sites/mcc-cal-vite/public-vite/manifests/journalism-manifest.json`
  - Example: `sites/mcc-cal-vite/public-vite/sitemap.xml`

## Required Publishing Sequence

1. Edit authored source files first.
2. Regenerate derived artifacts.
3. Validate generated output.
4. Commit with clear scope:
   - Logic/config changes separate from generated artifacts.
   - Generated artifacts can be grouped in a dedicated `content(manifests): ...` commit.

## Journalism Manifest Flow

From repo root:

`node scripts/manifest/generate-journalism-manifest-v2.js --force`

From `sites/mcc-cal-vite`:

`node scripts/sync-manifests.js`

Validation:

`node scripts/validate-manifests.js`

## Blog Content Flow

From repo root:

- Compile markdown: `npm run blog:compile`
- Validate content: `npm run blog:validate`
- Regenerate manifest/feed: `npm run manifest:blog && npm run blog:feed`

## Commit Hygiene Rules

- Do not mix local AI/tooling artifacts (`.cursor/`, temp files, transcript outputs) into content commits.
- Keep generated files in their own commit unless they are required to verify a same-commit code change.
- Re-run validation commands before committing generated outputs.
