# Reorganizing Agent

Purpose
-------

This document describes the `reorganizing-agent` repository agent and how to use or customize it.

What it does
------------

The reorganizing agent scans the repository for common violations of workspace organization standards and suggests file moves without making changes. It checks:

- Scripts in root `scripts/` folder (should be in `manifest/`, `watchers/`, `utils/`, `admin/`, or `_archived/`)
- Widget files outside `src/widgets/`
- Documentation files outside `docs/` (excluding root-level README, CHANGELOG, CONTRIBUTING, LICENSE, .agents.md)
- Test files outside `tests/`
- Temporary/backup files (`.bak`, `.tmp`, `~`, `.swp`)

Files
-----

- `.agents.md` — agent definition (meta).
- `scripts/agents/reorganize-check.sh` — the script the agent calls.
- `docs/standards/workspace-organization.md` — the standards this agent enforces.

Safety model
------------

The agent is read-only by default and MUST request explicit approval before any file move or rename operation. Keep `allowed_tools` minimal and require the user to approve any tool runs.

How to run locally
-------------------

From the repository root (zsh or bash):

```bash
bash scripts/agents/reorganize-check.sh
```

Expected output: summary of violations with suggestions for where files should be moved.

Using --fix mode
----------------

The `--fix` mode allows you to execute approved file moves safely:

1. Create a `reorganize-fixes.json` file in the repository root with approved moves:

```json
{
  "moves": [
    {"from": "scripts/old-script.js", "to": "scripts/utils/old-script.js"},
    {"from": "src/widget.html", "to": "src/widgets/widget.html"}
  ]
}
```

2. Run the script with `--fix` flag:

```bash
bash scripts/agents/reorganize-check.sh --fix
```

3. The script will:
   - Read the JSON file
   - Create destination directories as needed
   - Execute each move
   - Report success/failures

**Safety notes:**
- The script validates that source files exist before moving
- Destination directories are created automatically
- Requires `jq` (JSON processor): `brew install jq` on macOS
- Always commit your work before running `--fix` mode
- Review the moves in `reorganize-fixes.json` carefully before execution

**Custom fix file:**
```bash
bash scripts/agents/reorganize-check.sh --fix --fix-file=custom-moves.json
```

Customizing
-----------

- Edit `scripts/agents/reorganize-check.sh` to add or modify checks (e.g., check for images in wrong directories, check for widget naming conventions).
- The `--fix` mode is now available for executing approved moves automatically from a JSON configuration file.

CI integration (optional)
--------------------------

You can incorporate the script in a GitHub Action to warn on PRs when new files violate organization standards. Example step in a workflow:

```yaml
- name: Workspace Organization Check
  run: bash scripts/agents/reorganize-check.sh
  continue-on-error: true  # warn but don't fail PR
```

Next steps
----------

- Create a `reorganize-fixes.json` template file with common moves and document the approval process.
- Add a GitHub Action to run this script on PRs and comment with suggestions (implemented in `.github/workflows/agent-checks.yml`).
- Integrate with VS Code Agent Sessions to allow interactive approval and execution.
- Consider adding a `--generate-fixes` mode that auto-generates the JSON file from detected violations for review.
