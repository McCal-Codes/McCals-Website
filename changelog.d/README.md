# Changelog fragments

One file per pull request. `assemble.js` folds them into `CHANGELOG.md` at release.

## Why

Every PR used to edit the top of `CHANGELOG.md`, so any two open PRs conflicted on
the same lines. Resolving that costs a second full round of CI and a second set of
Vercel builds, and it happened on two of three PRs in a single session.

A fragment is a new file, so two PRs never touch the same one.

## Writing one

Name it after your branch, `changelog.d/<branch-topic>.md`. Write the same thing you
would have written in `CHANGELOG.md`, starting at the `###` heading. No date heading:
`assemble.js` adds that.

```markdown
### The Thing That Was Wrong

- What was broken, and what it cost. Say how you know rather than asserting it.
- What changed.
```

House style: no AI attribution anywhere, and no em-dashes.

## Releasing

```bash
node scripts/changelog/assemble.js
```

Moves every fragment into a new dated section at the top of `CHANGELOG.md` and deletes
the fragments. Pass `--dry-run` to see the result without writing anything.
