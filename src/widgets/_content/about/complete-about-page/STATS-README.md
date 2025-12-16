# Statistics Configuration

This file controls the dynamic statistics displayed in the about widget.

## How It Works

The widget tries to load stats from this JSON file. If unavailable, it falls back to calculated estimates.

## Configuration

```json
{
  "clients": 30, // Current number of happy clients
  "projects": 500, // Total projects completed
  "startYear": 2019, // Year you started professionally
  "avgClientsPerYear": 5, // Average new clients per year (for fallback)
  "avgProjectsPerYear": 80, // Average projects per year (for fallback)
  "lastUpdated": "2025-12-15" // When you last updated these numbers
}
```

## Updating Stats

1. Edit `stats-config.json`
2. Update the numbers
3. Change `lastUpdated` to today's date
4. Commit and push to GitHub

## Fallback Behavior

If this file can't be loaded, the widget automatically calculates:

- **Clients**: `years in business × 5` (minimum 30)
- **Projects**: `years in business × 80` (minimum 500)
- **Years**: Auto-calculated from `startYear`

This ensures the widget never breaks, even if the config file is unavailable.

## Example Updates

### When you get new clients:

```json
{
  "clients": 35, // Updated from 30
  "lastUpdated": "2026-03-15"
}
```

### When you hit a milestone:

```json
{
  "projects": 600, // Updated from 500
  "lastUpdated": "2026-06-01"
}
```

## Notes

- Years are always calculated dynamically from `startYear`
- The `+` symbol is added automatically
- Stats update on page load
- Console logs show which method was used (config vs fallback)
