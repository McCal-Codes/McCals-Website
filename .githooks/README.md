# Git Hooks

This directory contains custom git hooks for the repository.

## Installation

To enable these hooks, run:

```bash
git config core.hooksPath .githooks
chmod +x .githooks/*
```

## Available Hooks

### commit-msg
Rejects AI attribution before it can enter history, then appends the author note.

This repository carries no AI co-author trailers and no "generated with" advertisements.
Tooling adds them by default, so one forgotten trailer lands in history permanently.

The hook is fast local feedback, not the guarantee: hooks are opt-in and `--no-verify`
skips them. `.github/workflows/no-ai-attribution.yml` is what actually enforces this,
on every pull request, over both the commits and the PR title and body. Both call the
same `scripts/ci/check-no-ai-attribution.js`, so they cannot drift.

### post-commit
Automatically runs the welcome script after each commit to update the dashboard (`updates/welcome.md`).

This ensures your TODO status and recent changes are always fresh when you start working.

## Disabling Hooks

To temporarily disable hooks:
```bash
git config core.hooksPath .git/hooks
```

To re-enable:
```bash
git config core.hooksPath .githooks
```
