# Portfolio ID Generation Strategy

## Problem
Portfolio items need unique IDs for React keys. Duplicate IDs cause React warnings and rendering issues.

## Solution
IDs are generated from the item title plus an optional date suffix:

```
{basename}-{date}
```

Examples:
- `star-viper-2025-12-01` (Concert with multiple performances)
- `brentwood-vs-springdale-2025-09-12` (Journalism event)
- `downtown-pittsburgh` (Nature collection - no date needed)

## Rules
1. **Lowercase**: All IDs are lowercase
2. **URL-safe**: Special characters replaced with `-`
3. **Date suffix**: Added when items can have duplicates (concerts, events)
4. **No trailing dashes**: Cleaned up edge cases

## When to Add Date Suffix
- ✅ Concert bands (multiple performances)
- ✅ Events (recurring events)
- ✅ Journalism (same event different dates)
- ❌ Nature collections (unique by name)
- ❌ Portraits (unique by name)

## Validation
Run `npm run validate:manifests` before builds to catch duplicates.
