# Event Portfolio Widget (v2.5)

Squarespace-ready single-file widget. Featured-first + shuffle, lightbox, debug console.

## Use in Squarespace
1. Open `src/widgets/event-portfolio/versions/v2.5.html`
2. Copy **all** HTML and paste into a Squarespace **Code Block**.
3. The widget fetches the manifest from:
   `https://raw.githubusercontent.com/McCal-Codes/McCals-Website/main/src/images/Portfolios/Events/events-manifest.json`
   (override by editing `data-manifest` on `<main id="eventsPf">`)

## Local generation
```bash
node scripts/generate-events-manifest-v2.js --root src/images/Portfolios/Events --force
```
