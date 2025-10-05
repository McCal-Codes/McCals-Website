# Concert Portfolio Auto-Reader System

An automated system for detecting folder names and extracting year/month metadata from concert images.

## Overview

This system automatically:
- 🎵 **Detects band/folder names** from directory structure
- 📅 **Extracts concert dates** from image filenames (YYMMDD, YYYYMMDD formats)
- 🖼️ **Falls back to EXIF date data** when filename dates aren't available
- 📊 **Generates enhanced manifests** with metadata
- 🌐 **Powers the concert widget** with proper dates and band names

## Features

### ✨ Auto Date Detection
- Supports `YYMMDD` format (e.g., `250829` → August 29, 2025)
- Supports `YYYYMMDD` format (e.g., `20250829` → August 29, 2025)  
- EXIF metadata extraction as fallback
- Smart Y2K handling for 2-digit years

### 🎯 Smart Folder Processing
- Recursive directory scanning
- Nested folder support (e.g., `Band Name/Album Name/images`)
- Enhanced folder name formatting (`CamelCase` → `Camel Case`)

### 📋 Enhanced Manifests
Generated manifests include:
```json
{
  "bandName": "The Book Club",
  "folderName": "The Book Club",  
  "totalImages": 23,
  "images": ["250829_Haven_CAL4584.jpg", "..."],
  "concertDate": {
    "year": 2025,
    "month": 8,
    "monthName": "August",
    "day": 29,
    "iso": "2025-08-29",
    "source": "filename_yymmdd"
  },
  "metadata": {
    "generated": "2025-09-19T04:19:59.653Z",
    "version": "1.0"
  }
}
```

## Usage

### 🚀 Quick Start

```bash
# Preview what would be generated (safe)
npm run manifest:dry-run

# Generate manifests for all concert directories
npm run manifest:generate  

# Automated update with logging
npm run manifest:auto-update
```

### 📁 Manual Processing

```bash
# Process a specific directory
node scripts/enhanced-manifest-generator.js "/path/to/concert/folder"

# Process all concerts with verbose output
node scripts/enhanced-manifest-generator.js --auto --verbose

# Dry run to preview changes
node scripts/enhanced-manifest-generator.js --auto --dry --verbose
```

### 🤖 Automated Updates

The auto-updater script provides:
- Automated manifest generation
- Timestamped logging
- Git change detection
- Summary reports

```bash
# Run automated update
npm run manifest:auto-update

# View logs
cat logs/manifest-updates.log

# View last update summary  
cat logs/last-update-summary.json
```

## Concert Widget Integration

### Version 3.2 Features
- **Auto Date Display**: Shows proper concert dates (e.g., "August 2025") 
- **Enhanced Band Names**: Uses clean, formatted band names from manifests
- **Fallback Support**: Works with both enhanced and legacy manifests
- **Debug Information**: Shows manifest usage statistics

### Widget Usage
```html
<!-- Use the enhanced widget -->
<script src="widgets/concert-portfolio/versions/v3.2.html"></script>
```

## Directory Structure

```
images/Portfolios/Concert/
├── The Book Club/
│   └── The Book Club/
│       ├── 250829_Haven_CAL4584.jpg
│       ├── 250829_Haven_CAL4587.jpg
│       └── manifest.json            ← Generated automatically
├── Turtle Park/
│   ├── 250829_Haven_CAL4388.jpg
│   ├── 250829_Haven_CAL4401.jpg  
│   └── manifest.json                ← Generated automatically
└── processing-summary.json          ← Overall summary report
```

## Scheduling Automation

### Using Cron (Linux/macOS)
```bash
# Edit crontab
crontab -e

# Add entry to run daily at 3 AM
0 3 * * * cd /path/to/McCals-Website && npm run manifest:auto-update
```

### Using GitHub Actions
```yaml
# .github/workflows/update-manifests.yml
name: Update Concert Manifests
on:
  schedule:
    - cron: '0 3 * * *'  # Daily at 3 AM UTC
  workflow_dispatch:      # Manual trigger

jobs:
  update-manifests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '16'
      - run: npm ci
      - run: npm run manifest:auto-update
      - uses: stefanzweifel/git-auto-commit-action@v4
        with:
          commit_message: 'Auto-update concert manifests'
          file_pattern: 'images/Portfolios/Concert/**/manifest.json'
```

## File Naming Conventions

### Supported Date Formats
- `YYMMDD_*` → `250829_Haven_CAL4584.jpg`
- `YYYYMMDD_*` → `20250829_Concert_Photo.jpg`

### Best Practices
- Use consistent date prefixes in filenames
- Keep folder names descriptive (`The Book Club` not `tbc`)
- Organize in logical directory structures
- Avoid special characters in folder names

## Configuration

### Manifest Generator Settings
```javascript
// In enhanced-manifest-generator.js
const CONCERT_BASE_DIR = '../images/Portfolios/Concert';
const IMAGE_EXTENSIONS = /\.(jpe?g|png|webp)$/i;
```

### Widget Settings
```html
<!-- Set number of images to display -->
<div data-panes="12">
```

## Troubleshooting

### Common Issues

**No dates detected?**
- Check filename format (`YYMMDD` or `YYYYMMDD` prefix)
- Verify EXIF date information exists
- Run with `--verbose` to see detection details

**Missing images?**
- Ensure images have supported extensions (`.jpg`, `.jpeg`, `.png`, `.webp`)
- Check directory permissions
- Verify GitHub repository structure matches local

**Widget not loading enhanced data?**
- Confirm manifests exist in expected locations
- Check browser console for errors
- Use debug mode in widget (`🔍 Debug` button)

### Debug Commands
```bash
# Test single directory with full logging
node scripts/enhanced-manifest-generator.js "/path/to/concert/folder" --verbose

# Check what would change without writing
npm run manifest:dry-run

# View detailed logs
tail -f logs/manifest-updates.log
```

## Version History

- **v1.0** - Enhanced manifest generator with date detection
- **v3.2** - Updated concert widget with manifest support
- **v1.0** - Auto-updater with logging and scheduling

## Related Files

- `scripts/enhanced-manifest-generator.js` - Main manifest generator
- `scripts/auto-manifest-updater.js` - Automated scheduling wrapper  
- `widgets/concert-portfolio/versions/v3.2.html` - Enhanced widget
- `logs/manifest-updates.log` - Operation logs
- `images/Portfolios/Concert/processing-summary.json` - Summary report

---

**Next Steps**: The system is now fully automated! Simply add new concert images to the appropriate directories, and the manifests will be updated automatically on the next scheduled run.