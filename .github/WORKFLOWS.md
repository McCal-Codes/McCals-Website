Workflows: organization & best practices

This document describes conventions and optimization guidance for GitHub Actions workflows used by this repository.

Goals
- Keep workflows fast, deterministic, and non-destructive.
- Prefer `npm ci` with caching for Node installs.
- Avoid workflows that mutate the repository unless manual/maintainer-approved.
- Upload artifacts for diagnostics (logs, reports) rather than printing large blobs.

Conventions
- File placement: keep workflows in `.github/workflows/` and name files clearly (e.g., `ci-*.yml`, `deploy-*.yml`, `manifest-*.yml`).
- Deterministic installs: always use `npm ci --prefer-offline --no-audit --no-fund` in workflows that install Node deps.
- Cache dependencies: cache npm (`~/.npm`) and heavy runtime assets (Playwright browsers at `~/.cache/ms-playwright`) keyed by `package-lock.json` hash.
- Use dry-runs: when validating generators or scripts in CI, prefer dry-run flags to avoid accidental writes (e.g., `--dry` on manifest generators).
- Artifacts: upload reports and logs using `actions/upload-artifact` for long outputs and test reports.
- Guard destructive steps: any archival, commit, or push action should be gated behind `workflow_dispatch` and maintainers-only checks.

Recommended checks
- Include a lightweight `validate-workflows` job that verifies workflow script paths exist and that workflows follow `npm ci` + cache patterns. Place this in `.github/workflows/validate-workflows.yml` (see repo).
- Lint workflows: consider running a YAML linter or `super-linter` if you want stricter rules.

Notes
- When changing workflow files, run `node scripts/utils/ci-validate-workflows.js` locally to validate references and check for missing best-practice items.

Last updated: 2025-11-03
