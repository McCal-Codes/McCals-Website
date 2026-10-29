### Nightly Smoke Test, Footer Headings, And Unit Tests Fixed

- The nightly Playwright smoke test failed every night because it requested localhost:5173 with no server running. It now tests https://mcc-cal.com.
- Lighthouse flagged the footer headings (h4 with no h3 above) and the hero carousel dots (20px wide, under the 24px minimum tap size). The footer headings are now h2 and the dots are 24px wide.
- 29 unit tests failed locally: a Windows path-separator bug in the API route test, booking test fixtures whose fixed October 2026 dates had passed, and 5s timeouts under parallel load. All 331 pass now.
