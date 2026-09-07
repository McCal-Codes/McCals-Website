# Runbook: technical portfolio (moved)

The technical product portfolio no longer lives in this repository. It was
extracted, with its history, to [`McCal-Codes/mccal-codes.github.io`][repo] and
is published at <https://mccal-codes.github.io> by GitHub Actions.

[repo]: https://github.com/McCal-Codes/mccal-codes.github.io

- The Vercel project `mcc-cal-dev` was retired.
- `dev.mcc-cal.com` was retired with it. The domain no longer resolves.
- The `Sync Dev Portfolio GitHub Data` workflow moved to the new repository.

Operational detail now lives in that repository's `README.md`, including the
response headers GitHub Pages cannot set.

## Correction

Earlier revisions of this runbook described `/terranova` and `/roadmap` as 308
redirects declared in both `vercel.json` files, kept in sync by a test at
`src/vercel-config.test.ts`. No such redirects were ever present in either file
and that test never existed. The claim is recorded here only so it is not
recovered from git history and believed.
