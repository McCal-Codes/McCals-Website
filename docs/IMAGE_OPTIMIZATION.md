## Image optimization workflow (local-first)

This document explains how to optimize images locally before pushing and how the repository toolset supports regenerating manifests for affected portfolios.

How to use (PowerShell)

1) Install deps (once):

```powershell
npm ci
npm install --no-save sharp fast-glob
```

2) Optimize images in a folder and regenerate manifests, but do not commit automatically:

```powershell
# Optimize a specific portfolio folder (no commit)
npm run images:optimize:local -- src/images/Portfolios/Concert/BandName/"Nov 2025"
```

3) Optimize images, regenerate manifests, and auto-commit the changed images + generated manifests:

```powershell
# Optimize and create a commit with optimized images + regenerated manifests
npm run images:optimize:local -- src/images/Portfolios/Concert/BandName/"Nov 2025" --commit --commit-message "chore: optimize images and update manifests"
```

Notes and suggestions

- The script runs the manifest generator npm scripts already present in the repo. If you add additional portfolio types, extend the `manifestMap` inside `scripts/optimize-images-local.js`.
- If you'd like the script to replace PNGs with JPGs for higher savings (only for images without alpha), use the `--allow-lossy` flag. Example:

```powershell
npm run images:optimize:local -- src/images/Portfolios/Concert/BandName/* --allow-lossy --commit
```

- If you want this to run automatically before push, Husky is configured in the repository. Install husky hooks locally once:

```powershell
npm run prepare
# Then ensure .husky/hooks are active (git will call the pre-push hook automatically)
```

The Husky pre-push hook will run the optimizer on any staged image files and commit optimized results before the push proceeds.

If you want additional behaviors (e.g., convert PNG->JPG only when size savings exceed X%, or open a dry-run report), I can add flags for these options.
