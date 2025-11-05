v1.3 — Static editable playground

This file contains safe, editable copies of key production widget parts so you can prototype and iterate without dynamically pulling production files.

How to use

- Open `versions/v1.3.html` in your browser or via dev server.
- Make edits directly in that file to experiment with markup and CSS.
- When ready to extract updated sections, run the export tool:

  ```bash
  node scripts/utils/export-playground-sections.js
  ```

- The tool writes files into `scripts/outbox/` (nav.html, buttons.html, portfolio.html, footer.html).
- Manually copy the exported snippets into the appropriate production widget version files under `src/widgets/<widget-name>/versions/` and test.

Notes

- The export tool is intentionally non-destructive — it only writes files to an outbox for review.
- Prefer manual review before pasting into production widget files.
