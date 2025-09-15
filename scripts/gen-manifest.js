name: Build manifests

on:
  push:
    branches: [ main ]
    paths:
      - 'images/**'
      - 'scripts/gen-manifest.js'
      - '.github/workflows/build-manifest.yml'

permissions:
  contents: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Show working tree & confirm script exists
        run: |
          pwd
          ls -la scripts || true
          test -f scripts/gen-manifest.js || (echo "❌ Missing scripts/gen-manifest.js" && exit 1)

      - name: Generate manifest (Concert – The Book Club)
        run: node scripts/gen-manifest.js "images/Portfolios/Concert/The Book Club/The Book Club"

      - name: Generate manifest (Journalism Portfolio)
        run: node scripts/gen-manifest.js "images/Portfolios/Journalism"

      - name: Commit & push manifests
        run: |
          if [[ -n "$(git status --porcelain)" ]]; then
            git config user.name "github-actions"
            git config user.email "actions@users.noreply.github.com"
            git add -A
            git commit -m "Auto-update manifests"
            git push
          else
            echo "No changes to commit."
          fi
