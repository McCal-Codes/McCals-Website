# Legacy Widget Versions Archive

This directory centralizes older, superseded widget version files to keep active widget `versions/` folders lean and easier to navigate.

## Policy

- Only retain the current stable and previous stable versions in each widget's live `versions/` directory (≤2 active versions).
- Move older or deprecated versions (pre-major performance/accessibility standardization) here.
- Do NOT edit archived version files; they exist for historical reference and potential diff comparisons.
- If a legacy version is resurrected for debugging, copy it back out—do not modify in place here.

## Structure

```
Legacy Widgets/
  <widget>/
    versions/
      INDEX.json
      vX.Y.Z-<widget>.html
  (others as needed)
```

## Current Contents

- Placeholder directories will be added as legacy versions are migrated.

## Next Steps

1. Migrate older Concert Portfolio versions (v2._, v3._, v4.1–v4.5).
2. Migrate older Photojournalism Portfolio versions (v1._, v2._, v3.\*, v4.0–v4.3, v4.8).
3. Migrate Featured Portfolio early versions (v1.0–v1.4).
4. Update main widget README(s) to note archive policy.

_Last updated: 2025-12-14_
