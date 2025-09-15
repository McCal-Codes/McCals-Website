- name: Show working tree & confirm script exists
  run: |
    echo "== PWD =="
    pwd
    echo "== Branch =="
    git rev-parse --abbrev-ref HEAD || true

    echo "== Top-level listing =="
    ls -la

    echo "== List 'scripts' directory (if present) =="
    ls -la scripts || true

    echo "== Tracked files (git ls-files) =="
    git ls-files | sed -n '1,200p'

    echo "== Find any gen-manifest files regardless of case =="
    find . -maxdepth 4 -iregex '.*gen-.*manifest.*\.js' -print || true

    echo "== Hard check for the expected path =="
    if [ -f scripts/gen-manifest.js ]; then
      echo "✅ scripts/gen-manifest.js found"
    else
      echo "❌ scripts/gen-manifest.js NOT found in this checkout"
      exit 1
    fi

    echo "== Verify target images directory =="
    if [ -d "images/Portfolios/Concert/The Book Club/The Book Club" ]; then
      echo "✅ Target image dir exists"
    else
      echo "❌ Target image dir missing"
      exit 1
    fi
