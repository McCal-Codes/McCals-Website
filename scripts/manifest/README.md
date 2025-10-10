# Manifest Scripts

Scripts for generating and managing portfolio manifests. Used for image indexing and manifest rollups.

## Nature Manifest Auto-Generation

**Script:** `generate-nature-manifest.js`

- Scans all animal types under `src/images/Portfolios/Nature/Wildlife/*` (e.g., Birds, Mammals, Reptiles, etc.), and landscape/location folders under `src/images/Portfolios/Nature/Landscapes/*`.
- For each animal type, scans all species folders, auto-generates/updates a `manifest.json` in each with correct filenames, tags (animal type), and metadata.
- Aggregates all collections into a single `nature-manifest.json` for portfolio widgets.
- Whenever you add a new animal type, species, or landscape/location folder (with images), just run:

```sh
node scripts/manifest/generate-nature-manifest.js
```

This will auto-populate all manifests and keep the portfolio up to date, just like the concert manifest workflow.
