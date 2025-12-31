#!/usr/bin/env bash
set -euo pipefail

# Simple Git Hygiene script used by the repo-local git-hygiene agent.
# Behavior: summarize working tree, run linters/tests if available, and exit with non-zero on failures.

ROOT_DIR=$(cd "$(dirname "$0")/../../" && pwd)
cd "$ROOT_DIR"

echo "== Git Hygiene Check: $(date -u) =="

echo
echo "-> Git status (short):"
git status --short || true

echo
echo "-> Unstaged or untracked files?"
if [[ -n "$(git status --porcelain)" ]]; then
  echo "Warning: working tree is dirty. Review changes before committing."
fi

EXIT_CODE=0

# Run npm lint if defined
if command -v npm >/dev/null 2>&1; then
  if npm run | sed -n '1,200p' | grep -q "lint"; then
    echo
    echo "-> Running 'npm run lint'"
    if npm run lint; then
      echo "lint: PASS"
    else
      echo "lint: FAIL"
      EXIT_CODE=2
    fi
  else
    echo "-> No 'lint' script defined in package.json"
  fi
fi

# Run tests if available
if command -v npm >/dev/null 2>&1; then
  if npm run | sed -n '1,200p' | grep -q "test"; then
    echo
    echo "-> Running 'npm test'"
    if npm test; then
      echo "tests: PASS"
    else
      echo "tests: FAIL"
      EXIT_CODE=3
    fi
  else
    echo "-> No 'test' script defined in package.json"
  fi
fi

echo
echo "Summary:"
if [[ $EXIT_CODE -eq 0 ]]; then
  echo "All checks passed. Ready to commit after review."
else
  echo "Some checks failed. Fix issues before committing. Exit code: $EXIT_CODE"
fi

exit $EXIT_CODE
