#!/usr/bin/env bash
set -euo pipefail

# Reorganizing Agent — Workspace Structure Checker
# Scans the repository for common violations of workspace organization standards.
# Outputs suggestions without making changes. Requires explicit approval to execute moves.
# Usage:
#   bash reorganize-check.sh              # scan only (exit 1 if violations found)
#   bash reorganize-check.sh --fix        # execute approved moves from reorganize-fixes.json

ROOT_DIR=$(cd "$(dirname "$0")/../../" && pwd)
cd "$ROOT_DIR"

FIX_MODE=false
FIX_FILE="reorganize-fixes.json"

# Parse arguments
for arg in "$@"; do
  case $arg in
    --fix)
      FIX_MODE=true
      shift
      ;;
    --fix-file=*)
      FIX_FILE="${arg#*=}"
      shift
      ;;
  esac
done

echo "== Workspace Reorganization Check: $(date -u) =="
echo

VIOLATIONS=0

# Check for scripts in the root scripts/ folder that should be in subdirectories
echo "-> Checking scripts/ organization..."
if [[ -d scripts ]]; then
  ROOT_SCRIPTS=$(find scripts -maxdepth 1 -type f -name "*.js" -o -name "*.sh" | grep -v -E "(README|ORGANIZATION|welcome)" || true)
  if [[ -n "$ROOT_SCRIPTS" ]]; then
    echo "Warning: Found scripts in root scripts/ folder (should be in manifest/, watchers/, utils/, admin/, or _archived/):"
    echo "$ROOT_SCRIPTS" | while read -r file; do
      echo "  - $file"
      VIOLATIONS=$((VIOLATIONS + 1))
    done
  else
    echo "OK: No loose scripts in root scripts/ folder"
  fi
fi

# Check for widgets outside src/widgets/
echo
echo "-> Checking widget file placement..."
if [[ -d src ]]; then
  MISPLACED_WIDGETS=$(find src -maxdepth 1 -type f -name "*widget*.html" -o -name "*widget*.js" 2>/dev/null || true)
  if [[ -n "$MISPLACED_WIDGETS" ]]; then
    echo "Warning: Found widget files outside src/widgets/:"
    echo "$MISPLACED_WIDGETS" | while read -r file; do
      echo "  - $file (should be in src/widgets/)"
      VIOLATIONS=$((VIOLATIONS + 1))
    done
  else
    echo "OK: No misplaced widget files"
  fi
fi

# Check for documentation outside docs/
echo
echo "-> Checking documentation placement..."
MISPLACED_DOCS=$(find . -maxdepth 2 -type f \( -name "*.md" -o -name "*README*" \) ! -path "./docs/*" ! -path "./node_modules/*" ! -path "./.git/*" ! -name "README.md" ! -name "CHANGELOG.md" ! -name "CONTRIBUTING.md" ! -name "LICENSE.md" ! -name ".agents.md" 2>/dev/null || true)
if [[ -n "$MISPLACED_DOCS" ]]; then
  echo "Warning: Found documentation files that might belong in docs/:"
  echo "$MISPLACED_DOCS" | while read -r file; do
    echo "  - $file"
    VIOLATIONS=$((VIOLATIONS + 1))
  done
else
  echo "OK: Documentation appears well-organized"
fi

# Check for test files outside tests/
echo
echo "-> Checking test file placement..."
MISPLACED_TESTS=$(find . -maxdepth 2 -type f \( -name "*test*.html" -o -name "*test*.js" \) ! -path "./tests/*" ! -path "./node_modules/*" ! -path "./.git/*" ! -path "./test-results/*" 2>/dev/null || true)
if [[ -n "$MISPLACED_TESTS" ]]; then
  echo "Warning: Found test files that might belong in tests/:"
  echo "$MISPLACED_TESTS" | while read -r file; do
    echo "  - $file"
    VIOLATIONS=$((VIOLATIONS + 1))
  done
else
  echo "OK: Test files appear well-organized"
fi

# Check for temporary/backup files
echo
echo "-> Checking for temporary/backup files..."
TEMP_FILES=$(find . -maxdepth 3 -type f \( -name "*.bak" -o -name "*.tmp" -o -name "*~" -o -name "*.swp" \) ! -path "./node_modules/*" ! -path "./.git/*" 2>/dev/null || true)
if [[ -n "$TEMP_FILES" ]]; then
  echo "Warning: Found temporary/backup files:"
  echo "$TEMP_FILES" | while read -r file; do
    echo "  - $file (should be removed or gitignored)"
    VIOLATIONS=$((VIOLATIONS + 1))
  done
else
  echo "OK: No temporary files found"
fi

echo
echo "Summary:"
if [[ $VIOLATIONS -eq 0 ]]; then
  echo "No violations found. Repository structure follows workspace organization standards."
  exit 0
else
  echo "Found $VIOLATIONS potential violations. Review suggestions above."
  echo "To fix: move files to appropriate directories per docs/standards/workspace-organization.md"
  
  if [[ "$FIX_MODE" = true ]]; then
    echo ""
    echo "==> Fix mode enabled"
    if [[ ! -f "$FIX_FILE" ]]; then
      echo "Error: Fix file '$FIX_FILE' not found. Create it with approved moves."
      echo "Example format:"
      echo '{'
      echo '  "moves": ['
      echo '    {"from": "scripts/old-script.js", "to": "scripts/utils/old-script.js"},'
      echo '    {"from": "src/widget.html", "to": "src/widgets/widget.html"}'
      echo '  ]'
      echo '}'
      exit 2
    fi
    
    echo "Reading approved moves from $FIX_FILE..."
    # Parse JSON and execute moves (requires jq)
    if ! command -v jq >/dev/null 2>&1; then
      echo "Error: jq is required for --fix mode. Install with: brew install jq"
      exit 2
    fi
    
    MOVE_COUNT=$(jq -r '.moves | length' "$FIX_FILE")
    echo "Found $MOVE_COUNT approved moves."
    
    for i in $(seq 0 $((MOVE_COUNT - 1))); do
      FROM=$(jq -r ".moves[$i].from" "$FIX_FILE")
      TO=$(jq -r ".moves[$i].to" "$FIX_FILE")
      
      if [[ ! -f "$FROM" ]]; then
        echo "Warning: Source file '$FROM' not found, skipping..."
        continue
      fi
      
      echo "Moving: $FROM -> $TO"
      mkdir -p "$(dirname "$TO")"
      mv "$FROM" "$TO"
      echo "  ✓ Moved successfully"
    done
    
    echo ""
    echo "All approved moves executed. Re-run script to verify."
    exit 0
  else
    echo "Run with --fix flag to execute moves after creating '$FIX_FILE' with approved changes."
    exit 1
  fi
fi
