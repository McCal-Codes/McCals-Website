### Every Pull Request Edited the Same Lines of the Same File

- `CHANGELOG.md` took every entry at the top, so any two open pull requests conflicted there by construction. That happened on two of three PRs in one session, and each resolution cost a second full round of CI and a second set of Vercel builds for a diff that had nothing to do with the change.
- Entries now go in `changelog.d/`, one file per pull request, and `scripts/changelog/assemble.js` folds them into a dated section at release. Run by hand, never in CI: an automated commit into the deploy root is what produced the doubled build fixed in #292.
- Proven both ways rather than assumed. Two branches each adding a fragment merge clean; the same two changes made the old way conflict on `CHANGELOG.md`. The assembler's four refusal paths were each exercised: no fragments, a malformed date, fragments that are all empty, and a `CHANGELOG.md` that does not start with its own header.
- The validator accepts a fragment exactly as it accepted a `CHANGELOG.md` edit, and the bypass labels still work.

### The Workflow Named "Lint Scripts" Did Not Lint

- It ran `ci:validate-scripts`, which is the same command `ci-scripts-smoke.yml` already runs, so two runners did one another's work and `scripts/` went unlinted in CI. `npm run lint:scripts` was defined in `package.json` and invoked by nothing. It runs there now.
- The six files in `.github/workflows/archive/` are gone. GitHub only reads workflows at the top level of `.github/workflows`, so they could never fire, and three of them referenced scripts that no longer exist.

### Tailwind Was Left Half Removed

- #291 removed the `tailwindcss` dependency from both packages and the site's config, but the repo root kept a `tailwind.config.js` and a `postcss.config.js` naming `tailwindcss` as a plugin. A dependency removed while a config still asks for it turns any PostCSS run there into "Cannot find module". Nothing runs PostCSS at the root, which is the only reason this was latent rather than broken.
- The guard from #291 passed it, because it checked the manifests and not the configs. A tool is gone when nothing asks for it either, so the guard now checks both, and refuses a surviving tailwind config file. Both additions were confirmed to fail on purpose.
