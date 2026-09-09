### The Accessibility Job Could Not Fire, Could Not Fail, and Published Stale Results

- Its pull request `paths` filter named `src/widgets/**` and `src/site/**`. Neither directory exists, so no code change could trigger it.
- `scripts/a11y/axe-firefox.js` set a non-zero exit only when axe itself threw. Violations were written to JSON and the job went green, so a page with fifty WCAG AA failures passed.
- It injected axe from cdnjs at run time, which meant the version lived in a URL rather than the lockfile, and a CDN outage was the only realistic way the job went red.
- It scanned one URL taken from a secret, and skipped silently when that secret was unset. The upload step had no matching condition, so it published three report files anyway. Two of the three were never written by any script: they were committed in November 2025, against a legacy widget URL, and re-uploaded on every run as though they were results. All three are deleted, and `reports/` was already in `.gitignore`, so they were tracked in violation of it.
- The scan now builds the site, serves it, and checks six routes chosen one per kind of page. It uses `@axe-core/playwright`, so the version is pinned in the lockfile. It exits 1 on violations and 2 when a route could not be loaded at all, because not scanning is not the same as finding nothing.
- The duplicate axe step in `playwright-smoke.yml` is gone. It called the same script nightly, depended on the same unset secret, and never uploaded what it produced.

### The Violations It Found, All Fixed

Running it against the real site found four, none of which anything had reported before:

- **Filter buttons declared themselves tabs.** `role="tablist"` and `role="tab"` with `aria-pressed`, which is not an allowed attribute on `role="tab"` and which axe rates critical. They also had none of what a tablist requires: no `aria-controls`, no tabpanel, no roving tabindex or arrow-key handling. They are toggle buttons that filter a grid in place, so they are buttons now, and `aria-pressed` is correct on a button.
- **Every gallery card nested one control inside another.** The card was an `<article role="button" tabindex="0">` containing the copy-link `<button>`, so a keyboard user met two overlapping controls with no way to tell them apart, and the outer one reimplemented Enter and Space by hand. The article is a plain container now and the action is a real button stretched over the card, which the browser gives focus and key handling for nothing.
- **Muted text on the podcast page failed contrast**, at ratios from 2.71:1 to 3.83:1 against 4.5:1. Seven declarations raised to `rgba(255,255,255,0.5)`, which measures between 5.23:1 and 5.37:1 on the three backgrounds involved, and the light theme equivalent from 2.24:1 to 5.74:1. Confirmed in the built page rather than assumed.
- **The client marquee kept hidden links in the tab order.** Duplicated cards are `aria-hidden` so they are not announced twice, but their links stayed focusable, so a keyboard user tabbed through every logo again into content a screen reader insisted was not there.

All six routes now report zero violations against a real build. The two card tests that asserted the old structure were rewritten to pin the new one, including a check that no control contains a focusable descendant, confirmed to fail when the nesting is put back.

The first CI run of the new job failed, which is worth recording because the failure was in the harness rather than the site. Vite printed `Local: http://localhost:4173/` and the readiness probe against `127.0.0.1` timed out for its full thirty seconds, so the scan never ran. That is not reproducible on macOS, where both names answer, so the fix does not rely on the diagnosis: the host is pinned with `--host 127.0.0.1`, the probe tries both names and reports which answered, and a failure now prints what is actually listening. Serving and scanning also moved into one step, so the server's lifetime is the step's lifetime rather than a background process expected to survive between steps.
