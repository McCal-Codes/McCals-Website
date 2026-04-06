# Vercel Deployment Troubleshooting and Prevention

This runbook captures the deployment failures we hit on April 6, 2026 while launching `sites/mcc-cal-vite` on Vercel. Use it as a pre-deploy checklist and as the first incident-response guide when Vercel fails.

## Fast Triage Order

1. Confirm local Vercel CLI access.
   - `cmd /c vercel whoami`
   - `cmd /c vercel ls mc-cals-website`
2. Reproduce the production build locally from the Vite app.
   - `cd sites/mcc-cal-vite`
   - `cmd /c npm run build`
3. Inspect the current production deployment.
   - `cmd /c vercel inspect <deployment-url>`
   - `cmd /c vercel logs <deployment-id> --no-follow --json`

If step 2 fails locally, fix the repo before looking for a Vercel-side explanation.

## Failure Class 1: Vercel Fails Before the Build Starts

### Symptom

Vercel shows:

```text
Unable to unpack repo: there was at least one filename that was too long
```

### What Actually Happened on April 6, 2026

The failing repo did not still have an overlong tracked path. The real issue was a malformed Git symlink entry:

- path: `scripts/utils/shared-date-parsing.js`
- Git mode: `120000`
- blob contents: full JavaScript source, not a symlink target path

On Vercel's Linux checkout, Git tried to restore that entry as a symlink and hit an invalid path-length condition during unpack.

### How to Detect It

Check for symlinks or submodules in the tracked tree:

```powershell
git ls-tree -r HEAD | Select-String "^120000|^160000"
```

Inspect suspicious entries:

```powershell
git ls-files -s -- scripts/utils/shared-date-parsing.js
git cat-file -p <blob-sha>
```

If the blob prints source code instead of a short link target, the file is incorrectly tracked as a symlink.

### How to Fix It

Convert the tracked entry back to a normal file:

```powershell
git rm --cached -- scripts/utils/shared-date-parsing.js
git add -- scripts/utils/shared-date-parsing.js
```

Then verify the mode changed from `120000` to `100644`:

```powershell
git ls-files -s -- scripts/utils/shared-date-parsing.js
```

### Prevention

- Audit Git modes before pushing if Vercel fails during clone or unpack.
- Be suspicious of any tracked symlink created from a Windows machine unless it was intentional.
- Do not assume Vercel's "filename too long" error always means a real long-path problem.

## Failure Class 2: Vercel Gets Past Clone, Then `tsc -b` Fails

### Symptom

Vercel reaches:

```text
Running "vercel build"
Installing dependencies...
> tsc -b && vite build
```

and then fails on TypeScript errors.

### What We Hit on April 6, 2026

- A stale legacy page at `sites/mcc-cal-vite/src/pages/schedule.tsx` no longer matched the current booking hook API.
- `sites/mcc-cal-vite/src/pages/blog.tsx` was using manifest-only data where `StoryBody` and `buildPostJsonLd` needed a full post document.
- `sites/mcc-cal-vite/src/pages/changelog.tsx` and `sites/mcc-cal-vite/src/components/scheduling/hooks/useBooking.ts` had unused imports.
- `sites/mcc-cal-vite/src/utils/portfolio-ids.test.ts` was being typechecked in the production app build even though `vitest` is not part of the Vite app dependencies.

### Prevention

Always run the exact production build before pushing:

```powershell
cd sites/mcc-cal-vite
cmd /c npm run build
```

Keep these rules in mind:

- Legacy routes should redirect to the current implementation instead of duplicating old flow logic.
- Production `tsconfig` should not include test files unless the test runner dependencies are installed in that app.
- Page components that render full post bodies should narrow to `BlogPostDocument`, not just a manifest entry.

## Failure Class 3: Photojournalism Cards Render Without Images

### Symptom

The Photojournalism page renders card overlays and text, but some cards appear black or empty because the image request fails.

### What Actually Happened on April 6, 2026

The React grid was fine. The source data was stale.

`src/images/Portfolios/Journalism/journalism-manifest.json` contained paths that no longer matched the real filesystem:

- `Historic Society Yard Sale August 2025` used `Events/Historic Society Yard Sale August 2025` instead of `Events/historic-yard-sale-0825`
- `Trump Returns to Butler` still referenced old `trump_butler_cal*.jpg` files that were no longer present
- `The Globe - Political Coverage` still referenced older root filenames instead of the current `231107_The Globe - Political Coverage_*.jpg` files

### How to Check It

Treat blank journalism cards as a manifest-data problem first.

The card image URL is built directly from:

- `src/images/Portfolios/Journalism/journalism-manifest.json`
- `sites/mcc-cal-vite/public-vite/manifests/journalism-manifest.json`

The fastest audit is to verify every manifest image path exists on disk.

### What We Changed

- Fixed the broken `folderPath` and filenames in the source manifest.
- Synced the generated Vite copy in `sites/mcc-cal-vite/public-vite/manifests/journalism-manifest.json`.
- Updated `scripts/manifest/generate-journalism-manifest-v2.js` so virtual category-root events use a real `folderPath` via `folderPathOverride`.

### Prevention

- After renaming journalism folders or moving images, regenerate the journalism manifest before deploying:

```powershell
cmd /c npm run manifest:journalism
```

- Keep the source manifest and generated Vite copy in sync. The Vite app's `prebuild` runs `sites/mcc-cal-vite/scripts/sync-manifests.js`, so `cd sites/mcc-cal-vite && cmd /c npm run build` is the safest verification path before pushing.
- If journalism cards go blank, verify manifest paths before touching the portfolio UI.

## Failure Class 4: Codex Vercel MCP Says `Auth required`

### Symptom

Vercel MCP tools inside Codex fail immediately with:

```text
Auth required
```

### What It Means

This indicates the Codex-side Vercel OAuth session is stale or missing. It does not necessarily mean:

- the repo is mislinked
- the Vercel project is missing
- the local Vercel CLI login is broken

### How to Confirm

Use the local CLI:

```powershell
cmd /c vercel whoami
cmd /c vercel ls mc-cals-website
```

If those work, the fallback path is available and the problem is isolated to the MCP connector session.

### Fix

- Reconnect or reauthorize the Vercel connector in the Codex client.
- If needed, start a new session so the OAuth prompt can reappear.
- Keep using the local `vercel` CLI for deployments, inspection, and logs until the connector is restored.

## Pre-Push Checklist

Run this before a production push:

1. `git status --short`
2. `git ls-tree -r HEAD | Select-String "^120000|^160000"`
3. `cd sites/mcc-cal-vite && cmd /c npm run build`
4. If journalism content changed, verify the journalism manifest matches the actual folder structure.
5. If Codex Vercel MCP is unauthenticated, use the local `vercel` CLI instead of blocking on the connector.

## Local CLI Fallback Commands

These were the most useful commands during the April 6, 2026 incident:

```powershell
cmd /c vercel whoami
cmd /c vercel ls mc-cals-website
cmd /c vercel inspect <deployment-url>
cmd /c vercel logs <deployment-id> --no-follow --json
```

Use the CLI when MCP auth is unavailable or when you need a direct check against the live Vercel account.
