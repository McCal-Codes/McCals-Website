# Git Hooks

This directory contains custom git hooks for the repository.

## Installation

To enable these hooks, run:

```bash
git config core.hooksPath .githooks
chmod +x .githooks/*
```

## Available Hooks

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
