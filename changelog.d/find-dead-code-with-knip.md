### Dead Code, Found by a Tool Instead of a Guess

- Roughly 5,400 lines removed: 28 unreachable source files, seven CSS modules only those files imported, `src/styles/about-widget.css`, the 5.2 MB `public/` directory, `babel.config.js`, and the `.storybook` config. The Storybook scripts went with it: `storybook` and `build-storybook` were defined while `storybook` itself was not a dependency, so both failed on the first line.
- It was found with `knip` rather than by hand. Two reachability heuristics written first disagreed with each other, 17 files against 37, and both were wrong. The first missed `ErrorBoundaries/ErrorBoundary.tsx` because a different file named `ErrorBoundary` is referenced elsewhere; the second flagged `styles/fonts.css`, which is genuinely pulled in by a CSS `@import`, and `src/test/setup.ts`, which vitest loads. Neither was trustworthy enough to delete on.
- The risky candidates were still checked by hand rather than taken on the tool's word. `design-systems` and `video` are absent from `App.tsx` and the route table and return 404 in production. `schedule.tsx` renders a client-side redirect, but `/schedule` is a `redirectFrom` entry on `/grab-a-coffee` and the edge answers 308 before the app ever loads. Four of the six `portfolios/` components have no importer at all; the two that do are Journalism and Featured.
- `knip` now runs in CI, inside the existing lint job so it reuses that install rather than adding a fifth `npm ci` to every pull request. Confirmed it can fail: a planted unreachable file exits 1, and a clean tree exits 0.
- Unused _exports_ are deliberately not gated. There are 98, plus 42 unused exported types, mostly barrel re-exports, and that is separate work. `npm run deadcode:all` surfaces them.
- The first version of that split did not work, and a review caught it. `knip.json` carried `include: ["files"]` while both scripts ran a bare `knip`, so `deadcode:all` reported exactly what `deadcode` reported and the wider audit it promised was unreachable. The restriction lives on the CI script now and the config is unrestricted, which is the way round that makes the wider command actually wider. Confirmed by running both: the gate reports nothing, the audit reports five categories.

### A Guard That Broke Because It Named Its Inputs

- `seo.static.test.ts` asserted that no page references the old `mccalmedia.com` host, but it read a hardcoded pair of files, both of which turned out to be dead pages. Deleting them did not weaken the test, it broke it outright with ENOENT.
- It walks `src/pages` now, so it covers thirty files rather than two and cannot be broken by deleting one. Confirmed by planting the legacy host in `about.tsx`, a page the old version never looked at.

### A Correction

- Earlier notes said the raw error message block "appears in all six portfolio components". Four of those six are dead code, removed here. The problem is real and affects the two live ones, Journalism and Featured.
