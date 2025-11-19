# Git Hygiene Agent

Purpose
-------

This document describes the `git-hygiene` repository agent and how to use or customize it.

What it does
------------

- Summarizes the working tree (`git status --short`).
- Runs `npm run lint` if a `lint` script is defined in `package.json`.
- Runs `npm test` if a `test` script is defined in `package.json`.
- Exits with a non-zero status when lint or tests fail to surface issues to CI or manual reviewers.

Files
-----

- `.agents.md` — agent definition (meta).
- `scripts/agents/git-hygiene.sh` — the script the agent calls.

Safety model
------------

The agent is read-first by default and MUST request explicit approval before any write operation (committing, pushing, editing files). Keep `allowed_tools` minimal and require the user to approve any tool runs.

How to run locally
-------------------

From the repository root (zsh or bash):

```bash
bash scripts/agents/git-hygiene.sh
```

Customizing
-----------

- Add or modify commands in `scripts/agents/git-hygiene.sh` to match your linters/test runners (e.g., `pnpm`, `yarn`, `pytest`).
- If you need the agent to be able to commit, add clear rules to `.agents.md` and require an explicit interactive approval step.

CI integration (optional)
------------------------

You can incorporate the script in a GitHub Action to fail PR checks when hygiene fails. Example step in a workflow:

```yaml
- name: Git Hygiene
  run: bash scripts/agents/git-hygiene.sh
```

Next steps
----------

- Add a GitHub Action to run this script on PRs.
- Add a README entry documenting the approval process for agent-suggested patches.
