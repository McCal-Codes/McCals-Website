# See [workspace-organization.md](./workspace-organization.md) for workspace/process standards and validation checklists.
# Date Naming Standards for Portfolio Images

## Standard Format: YYMMDD

**All portfolio images should use the YYMMDD format for consistency across all portfolio types.**

### Correct Format Examples:
- `241014_Kamala Speaks at Erie_CAL3741.jpg` (Oct 14, 2024)
- `250829_The Book Club_CAL4567.jpg` (Aug 29, 2025) 
- `240315_Genesis Volume 1_599.jpg` (Mar 15, 2024)

### Format Breakdown:
- `YY` = Last two digits of year (24 = 2024, 25 = 2025)
- `MM` = Month (01-12, with leading zero)
- `DD` = Day (01-31, with leading zero)

## Why This Standard?

1. **Consistency**: All portfolio types (Concerts, Events, Journalism) use the same format
2. **Chronological Sorting**: Files sort chronologically when listed alphabetically
3. **Shared Date Parsing**: All manifest generators use the same date parsing logic
4. **Widget Compatibility**: All portfolio widgets expect this format

## Migration Notes

- **October 2025**: Fixed Kamala Speaks at Erie images from DDMMYY format (`141024_`) to YYMMDD format (`241014_`)
- **Shared Module**: All generators now use `scripts/shared-date-parsing.js` for consistent date parsing

## Fixing Incorrectly Named Files

If you find files using DDMMYY or other formats:

1. **Identify the correct date** from context (event date, EXIF data, etc.)
2. **Rename files** to use YYMMDD format
3. **Regenerate manifests** using the appropriate generator script
4. **Test widgets** to ensure dates display correctly

## Generator Scripts Using Shared Date Parsing

- `generate-concert-manifest.js`
- `generate-events-manifest.js` 
- `generate-journalism-manifest.js`
- `generate-universal-manifest.js`
- `generate-featured-manifest.js`

All generators use the `shared-date-parsing.js` module to ensure consistent date interpretation.