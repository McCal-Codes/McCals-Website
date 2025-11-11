# axe-firefox (widget) — Summary

Date: 2025-11-11

Source JSON: `reports/axe-firefox-results.json`
HTML report: `reports/axe-firefox-widget-report.html`

Quick findings

- Automated scan engine: axe-core 4.10.2 (via Playwright + Firefox)
- URL scanned: `http://localhost:3000/src/widgets/accessibility-statement/versions/v1.1.3-accessibility-statement.html`
- Results: 0 violations, 0 incomplete checks when running `runOnly: ["wcag2aa"]`.
- Color contrast checks: multiple checks reported contrast ratios (e.g. 17.22, 6.5) and passed the expected thresholds.

What I learned (short)

- The v1.1.3 Accessibility Statement widget passes automated WCAG 2 AA checks for the scanned page with axe-core (no violations found). The theme variables (light/dark) appear to produce accessible contrast in the tested state.
- Automated tools are a good baseline, but they do not replace manual QA. I recommend keyboard-only navigation testing, a quick screen-reader pass (VoiceOver/NVDA/JAWS), and testing the widget when embedded in Squarespace because embedding can change focus order and skip-link behavior.

Recommendations / Next steps

1. Manual keyboard smoke test: tab through the page, open the mobile drawer, and ensure focus is trapped and returned correctly for overlays.
2. Screen-reader check: listen for correct headings and announceable skip-links when the widget is embedded.
3. Run a focused axe scan over time (CI) when you publish to a staging environment.
4. Optional: run Lighthouse accessibility (requires Chrome) for an additional perspective.

Files produced by this run

- `reports/axe-firefox-results.json` — full axe JSON results (already present)
- `reports/axe-firefox-widget-report.html` — a one-file HTML report that fetches the JSON and renders a human-friendly summary
- `reports/axe-firefox-summary.md` — this short summary and recommended next steps

If you want, I can now:
- Run the keyboard-focused automated checks and produce a short TAP-style report, or
- Generate an HTML report that also lists each pass/violation in a table (longer but actionable), or
- Re-run axe against the same page with different viewport sizes (mobile) — fast.

Choose one and I'll run it next.