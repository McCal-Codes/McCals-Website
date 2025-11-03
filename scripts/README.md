# scripts/

This folder contains repository helper scripts used by the project. The goal of this README is to document conventions, canonical folders, dry-run flags, how to run validators and smoke tests, and the archive policy.

Canonical layout
- `scripts/manifest/` - canonical manifest generators (concert, events, journalism, universal, etc.). Use flags like `--dry` or `--auto --dry` when available to avoid writing files in CI.
- `scripts/watchers/` - file watchers and watcher controllers (chokidar-based watchers, control scripts).
- `scripts/utils/` - small utility scripts used by CI and local workflows (validators, scanners, smoke tests).
- `scripts/admin/` - admin helpers intended for interactive use (uploads, imports).
- `scripts/_archived/` - archived legacy scripts. DO NOT run these in CI. They are kept for historical reference.

- Prefer Node.js scripts under `scripts/manifest` and `scripts/utils` to accept a `--dry` flag to run non-destructively in CI.
- Keep one canonical implementation of a script. If a duplicate is found, move the non-canonical copy to `scripts/_archived/` with a timestamped suffix.
- Use clear exit codes (0 success, non-zero error) and friendly logs. CI relies on exit codes to detect failures.
- Use `#!/usr/bin/env node` for Node CLI scripts that may be executed directly.

Conventions
- Prefer Node.js scripts under `scripts/manifest` and `scripts/utils` to accept a `--dry` flag to run non-destructively in CI.
- Keep one canonical implementation of a script. If a duplicate is found, move the non-canonical copy to `scripts/_archived/` with a timestamped suffix.
- Use clear exit codes (0 success, non-zero error) and friendly logs. CI relies on exit codes to detect failures.
- Use `#!/usr/bin/env node` for Node CLI scripts that may be executed directly.

Reorganization placeholders
- We added lightweight placeholder folders to help future reorganization without moving files automatically:
  - `scripts/cli/` — for standalone CLI entrypoints
  - `scripts/maintenance/` — for maintenance and cleanup utilities
  - `scripts/tools/` — helper tools used by other scripts

Linting & automation
- ESLint is configured to lint `scripts/` (except `scripts/_archived` and `scripts/watchers`) with a permissive rule set to avoid breaking legacy patterns. Run:
  - `npm run lint:scripts`

Playwright & CI caching
- The Playwright smoke test workflow caches node modules and Playwright browser downloads to speed runs. In CI we cache `~/.npm` and `~/.cache/ms-playwright` keyed by `package-lock.json` hash.

How to run validators & smoke tests (local)
- Validate script references (report missing script files referenced in workflows/package.json):
  - `node scripts/utils/ci-validate-scripts.js`
  - or `npm run ci:validate-scripts`
- Find duplicate script basenames (report-only):
  - `node scripts/utils/find-duplicate-scripts.js`
  - to archive duplicates locally (explicit): `node scripts/utils/find-duplicate-scripts.js --archive`
- Run the minimal smoke test (manifest dry-run + widget check):
  - `node scripts/utils/smoke-test.js`
  - or `npm run ci:smoke-test`

CI guidance
- Use `npm ci` (not `npm install`) in CI jobs for deterministic installs. Example: `npm ci --prefer-offline --no-audit --no-fund`.
- Prefer running manifest generators in `--dry` mode during CI validation steps to avoid accidental writes.
- CI duplicate scanning should be report-only by default. Archival should be a manual/maintainer action.

Archive policy
- When we archive a script, move the file to `scripts/_archived/` and append a `.archived-YYYYMMDD-HHMMSS` suffix to the filename.
- Update the top of the archived file with a one-line pointer to the canonical script path.

Adding new scripts
- Add new, single-purpose scripts to the appropriate canonical folder.
- Update `package.json` (and `package.scripts.sample.json`) with any npm scripts that call the scripts.
- If the script will be referenced by a GitHub Action, commit the script and update the action to reference the canonical path.

Troubleshooting
- If a workflow fails with "missing script referenced", run `node scripts/utils/ci-validate-scripts.js` to find the broken reference.
- Use the smoke test to quickly validate manifest generation and widget presence without writing files.

Contact
- For questions about the scripts layout or to request automated archival, open an issue or reach out to the repo maintainer.

_Last updated: 2025-11-03_
