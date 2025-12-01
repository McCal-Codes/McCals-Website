#!/usr/bin/env bash
set -euo pipefail
# Helper script to perform Git LFS migration. This script is destructive (rewrites history) and is
# intended to be run on a dedicated migration branch after reviewing the plan produced by
# scripts/utils/generate-lfs-migration-plan.js

if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
  cat <<EOF
Usage: $0 <pattern(s)> [--dry-run]

Example:
  $0 "src/images/Portfolios/**" "*.psd" --dry-run

Notes:
 - This script requires git-lfs to be installed and configured.
 - It will run 'git lfs migrate import' which rewrites history. Use on a migration branch.
 - Review the generated plan (lfs-migration-plan.json) before running.
EOF
  exit 0
fi

DRY=0
PATTERNS=()
for arg in "$@"; do
  if [ "$arg" = "--dry-run" ]; then DRY=1; else PATTERNS+=("$arg"); fi
done

if [ ${#PATTERNS[@]} -eq 0 ]; then
  echo "No patterns provided. See --help" >&2
  exit 2
fi

echo "Patterns: ${PATTERNS[*]}"
echo "Dry run: ${DRY}" 

if ! command -v git-lfs >/dev/null 2>&1; then
  echo "Please install git-lfs first (https://git-lfs.com/)" >&2
  exit 2
fi

echo "Running: git lfs install"
git lfs install

echo "Tracking patterns in .gitattributes"
for p in "${PATTERNS[@]}"; do
  git lfs track "$p" || true
done

git add .gitattributes || true
git commit -m "chore: track large asset patterns with git-lfs" || true

CMD=(git lfs migrate import --everything --include)
IFS=,; CMD+=("${PATTERNS[*]}")

if [ "$DRY" -eq 1 ]; then
  echo "Dry-run mode: showing the command that would be run:"
  echo "${CMD[@]}"
  exit 0
fi

echo "This operation will rewrite git history. Ensure you are on a migration branch and have backups."
read -p "Proceed? (type 'YES' to continue): " confirm
if [ "$confirm" != "YES" ]; then
  echo "Aborting."; exit 1
fi

echo "Running migration..."
"${CMD[@]}"

echo "Migration complete. Please run tests and then push with --force-with-lease to your remote migration branch."
