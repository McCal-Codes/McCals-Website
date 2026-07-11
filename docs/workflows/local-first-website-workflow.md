# Local-First Website Workflow

Use this workflow for McCal's Website changes that should be developed, tested, and committed locally before any push, PR, merge, or deployment-adjacent action.

## Defaults

- Work outside Google Drive by default. Use a non-Drive local folder such as `~/Worktrees/mccals-website/<topic-slug>` for clean local checkouts.
- Start from fresh `origin/main` unless the task explicitly names another base.
- Use human-readable branch names that describe the work, never the person or process:
  - `feature/<topic-slug>`
  - `fix/<topic-slug>`
  - `docs/<topic-slug>`
  - `content/<topic-slug>`
  - `ci/<topic-slug>`
- Keep commits small, scoped, and locally reviewable.
- Push, open PRs, merge, or deploy only after explicit user approval.
- Treat the Google Drive checkout as reference-only when it is dirty, stale, or slow.

## Clean Checkout Setup

Preferred path when the current checkout can create a worktree cleanly:

```sh
git fetch --prune origin main
mkdir -p ~/Worktrees/mccals-website
git worktree add -b docs/example-topic \
  ~/Worktrees/mccals-website/example-topic \
  origin/main
```

If the Drive-backed checkout blocks worktree creation, use a fresh non-Drive clone instead:

```sh
mkdir -p ~/Worktrees/mccals-website
git clone --filter=blob:none --single-branch --branch main \
  https://github.com/McCal-Codes/McCals-Website.git \
  ~/Worktrees/mccals-website/example-topic
cd ~/Worktrees/mccals-website/example-topic
git checkout -b docs/example-topic
```

For docs-only changes, a sparse checkout is acceptable:

```sh
git clone --filter=blob:none --sparse --single-branch --branch main \
  https://github.com/McCal-Codes/McCals-Website.git \
  ~/Worktrees/mccals-website/example-topic
cd ~/Worktrees/mccals-website/example-topic
git sparse-checkout set docs
git checkout -b docs/example-topic
```

## Commit Workflow

Before editing:

1. Inspect the existing files, scripts, and docs that define the relevant pattern.
2. Confirm the branch is based on current `origin/main`.
3. Make the smallest safe change that addresses the task.

Before each local commit:

```sh
git status --short
git diff --check
git diff
```

Run targeted checks for touched files before committing. Keep generated artifacts separate from logic or config changes unless the generated files are required to verify the same change.

Use intent-first commit messages:

```sh
git commit -m "docs: add local-first website workflow"
git commit -m "fix: preserve production canonical url"
git commit -m "content: update journalism captions"
git commit -m "ci: align deployment checks"
```

## App Verification Gate

For app-affecting work, run the full local gate from `sites/mcc-cal-vite` before asking for push approval:

```sh
npm ci --no-audit --no-fund
npm run typecheck
npm run typecheck:test
npm run lint
npm run test:run
npm run build
```

If a full build is blocked by the known Drive or public-copy issue, use this only as a fallback and report the limitation:

```sh
PUBLIC_COPY_TIMEOUT_MS=0 npm run build
```

Do not treat the fallback as equivalent to a normal full build unless the skipped public copy is unrelated to the change being tested.

## Local Site Testing

Start the local dev site from `sites/mcc-cal-vite`:

```sh
npm run dev -- --host 127.0.0.1
```

Use the shown Vite URL, normally `http://127.0.0.1:5173/`, for hands-on testing.

For production-like testing after a successful build:

```sh
npm run preview -- --host 127.0.0.1
```

If API-backed behavior is part of the change:

```sh
npm run dev:api
```

Browser smoke checks should cover:

- Homepage renders without a blank screen.
- Primary navigation works.
- Changed routes or pages work directly on refresh.
- Representative images and media load.
- The browser console has no critical errors.
- Mobile width does not show obvious layout breakage.

When sharing verification, include browser evidence when possible, such as Playwright navigation checks, screenshots, or the local URL used for manual review.

## Push And PR Safety

- Confirm Vercel's Production Branch is `main` before the first push under this workflow.
- Push only after explicit user approval.
- Push only the human-named task branch.
- Open a PR rather than pushing directly to `main`.
- Wait for required GitHub checks and Vercel preview results before merging.
- Merge only after checks are green and merge approval is clear.

Vercel creates production deployments from the configured Production Branch and preview deployments from other branches or PRs. GitHub required status checks should remain the merge gate.

## Current Drive Checkout Triage

The Drive-backed `feature/supabase-image-storage` checkout may be stale or dirty. Do not build new work on top of it by default.

Before retiring or ignoring its local edits, compare these files against current `origin/main` and preserve only still-relevant fixes:

- `sites/mcc-cal-vite/scripts/generate-route-meta.js`
- `sites/mcc-cal-vite/vite.config.ts`

## References

- [Vercel Git deployments](https://vercel.com/docs/git)
- [Vercel environments](https://vercel.com/docs/deployments/environments)
- [GitHub protected branches](https://docs.github.com/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [GitHub status checks](https://docs.github.com/articles/about-status-checks)
