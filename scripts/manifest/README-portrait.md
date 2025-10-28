# Portrait Manifest Generator

Automatically generates manifest files for portrait photography collections.

## Usage

### Generate All Portrait Manifests

```bash
npm run manifest:portrait
```

This will:
1. Scan all folders under `src/images/Portfolios/Portrait/`
2. Generate individual `manifest.json` files in each collection folder
3. Create an aggregated `portrait-manifest.json` at the Portrait root

## Folder Structure

Expected structure:
```
src/images/Portfolios/Portrait/
├── Character Studies/
│   ├── character-study-01.jpg
│   ├── character-study-02.jpg
│   └── manifest.json (auto-generated)
├── Environmental/
│   ├── env-portrait-01.jpg
│   ├── env-portrait-02.jpg
│   └── manifest.json (auto-generated)
├── Studio/
│   ├── studio-portrait-01.jpg
│   └── manifest.json (auto-generated)
└── portrait-manifest.json (auto-generated)
```

## Collection Types

The generator automatically detects and tags collections based on folder names:

- **Character Studies**: Intimate portraits capturing personality
  - Tags: `portrait`, `character`, `black-and-white`
  
- **Environmental Portraits**: Portraits in natural locations
  - Tags: `portrait`, `environmental`, `location`
  
- **Studio Portraits**: Professional studio work with controlled lighting
  - Tags: `portrait`, `studio`, `professional`
  
- **Editorial/Fashion**: Fashion and editorial portrait work
  - Tags: `portrait`, `editorial`, `fashion`
  
- **Corporate/Business**: Professional corporate headshots
  - Tags: `portrait`, `corporate`, `professional`

## Manifest Format

Each collection folder gets a `manifest.json`:

```json
{
  "collectionName": "Character Studies",
  "folderPath": "Character Studies",
  "totalImages": 8,
  "images": ["character-study-01.jpg", "..."],
  "tags": ["portrait", "character", "black-and-white"],
  "dateDisplay": "2025",
  "dateISO": "2025-01-01T00:00:00.000Z",
  "description": "Intimate character studies capturing personality and emotion",
  "metadata": {
    "generated": "2025-10-27T18:00:00.000Z",
    "version": "1.0"
  }
}
```

## Aggregated Manifest

The root `portrait-manifest.json` contains:

```json
{
  "version": "1.0",
  "generated": "2025-10-27T18:00:00.000Z",
  "totalCollections": 3,
  "totalImages": 45,
  "collections": [...]
}
```

## Integration

This generator follows the same patterns as:
- Concert manifest generator (`generate-concert-manifest.js`)
- Nature manifest generator (`generate-nature-manifest.js`)
- Events manifest generator (`generate-events-manifest.js`)
- Journalism manifest generator (`generate-journalism-manifest-v2.js`)

## Supported Image Formats

- `.jpg` / `.jpeg`
- `.png`
- `.webp`
- `.gif`

## Error Handling

The generator:
- Skips non-directory items in the Portrait folder
- Continues on individual collection errors
- Provides detailed console output for debugging
- Exits with error code 1 on fatal errors

## Notes

- Manifests are automatically regenerated each run
- Date information defaults to current year (portrait collections typically don't have dates in filenames)
- Tags and descriptions are auto-generated based on collection names
- Images are sorted alphabetically in manifests
