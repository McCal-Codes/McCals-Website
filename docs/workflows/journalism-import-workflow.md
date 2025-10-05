# Journalism Photo Import Workflow

This document describes the streamlined workflow for importing journalism photos into your portfolio website.

## Quick Start

1. **Drop photos** into `src/images/Portfolios/Journalism/_import/`
2. **Run import**: `npm run import:journalism`
3. **Follow prompts** to enter event details
4. **Generate manifest**: `npm run manifest:journalism` (or let the import script do it automatically)
5. **Deploy**: Commit and push changes

## Detailed Process

### Step 1: Add Photos to Import Directory

Copy your new journalism photos to:
```
src/images/Portfolios/Journalism/_import/
```

You can drag and drop photos from anywhere - the script will handle the organization.

### Step 2: Run the Import Script

```bash
npm run import:journalism
```

The script will:
- Scan the import directory for image files
- Show you what files it found
- Ask for event details:
  - **Event date** (YYMMDD format, e.g., 250923 for September 23, 2025)
  - **Event name** (e.g., "City Council Meeting")
  - **Category** (optional, e.g., "Politics", "Events", "Portraits")

### Step 3: File Organization

The script automatically:
- Renames files to follow the standard format: `YYMMDD_EventName_CALxxx.jpg`
- Moves files to the appropriate directory:
  - Main folder: `src/images/Portfolios/Journalism/`
  - Category folder: `src/images/Portfolios/Journalism/CategoryName/`
- Skips files that already exist (prevents overwrites)
- Generates sequential photo codes (CAL001, CAL002, etc.)

### Step 4: Manifest Generation

After importing, you need to update the manifest:

**Option A:** Let the import script do it automatically
- The script will ask if you want to run manifest generation
- Choose "yes" to run `npm run manifest:journalism` automatically

**Option B:** Run it manually later
```bash
npm run manifest:journalism
```

### Step 5: Deploy Changes

Commit and push your changes to update the website:
```bash
git add .
git commit -m "Add journalism photos for [Event Name]"
git push
```

The website will auto-refresh or you can refresh manually after 15 minutes.

## File Naming Convention

The import script follows this naming pattern:
```
YYMMDD_EventName_CALxxx.jpg
```

Examples:
- `250923_City Council Meeting_CAL001.jpg`
- `250924_Football Game_CAL001.jpg`
- `251001_Portrait Session_CAL001.jpg`

## Categories

Organize photos by category for better organization:

Common categories:
- **Politics** - Government meetings, political events
- **Events** - Community events, festivals, gatherings
- **Portraits** - Individual portraits, headshots
- **Sports** - Athletic events, games
- **Breaking News** - Time-sensitive news events
- **Features** - Human interest stories, lifestyle

If no category is specified, photos go to the main journalism folder.

## Import Directory

The import directory (`src/images/Portfolios/Journalism/_import/`) is temporary storage:
- Files are **moved** (not copied) during import
- The directory will be empty after successful import
- Contains a README with quick instructions
- Supports all common image formats (JPG, PNG, GIF, WebP)

## Error Handling

The script handles common issues:
- **Duplicate files**: Existing files are skipped with a warning
- **Invalid date format**: Prompts you to enter date in YYMMDD format
- **No images found**: Reports if import directory is empty
- **Missing directories**: Creates target directories automatically

## Tips

1. **Batch Processing**: You can import multiple events by running the script multiple times
2. **File Naming**: Original filenames don't matter - the script handles renaming
3. **Consistent Dates**: Use consistent date formatting for better organization
4. **Descriptive Events**: Use clear, descriptive event names for better navigation
5. **Categories**: Use consistent category names to avoid duplicates

## Troubleshooting

**Script won't run:**
```bash
# Make sure the script is executable
chmod +x scripts/import-journalism.js
```

**Import directory missing:**
```bash
# Create the directory manually
mkdir -p src/images/Portfolios/Journalism/_import
```

**Manifest not updating:**
```bash
# Run manifest generation manually
npm run manifest:journalism
```

## Related Commands

- `npm run manifest:journalism` - Generate journalism portfolio manifest
- `npm run import:journalism` - Run the photo import process
- `npm run dev` - Start development server to preview changes