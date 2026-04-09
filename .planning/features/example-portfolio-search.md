# Feature Plan: Portfolio Search

**Status**: Example/Demonstration  
**Created**: April 2026  
**Created by**: `/plan-feature` skill

---

## Description
Add a search functionality to the photo portfolio pages that allows visitors to filter photos by tags, events, or keywords. This will improve discoverability as the portfolio grows.

## User Value
- Visitors can quickly find photos from specific events or venues
- Journalists can locate specific shots for articles
- Potential clients can see relevant work samples faster

## Requirements

### Functional
- [ ] Search input visible on portfolio pages
- [ ] Real-time filtering as user types
- [ ] Filter by: event name, tags, date range
- [ ] Clear search button
- [ ] "No results" state with helpful messaging
- [ ] Keyboard shortcut (Cmd/Ctrl+K) to focus search

### Non-Functional
- Search response: < 100ms for client-side filtering
- Works offline (client-side only)
- Accessible: ARIA labels, keyboard navigation
- Mobile: Collapsible search bar

## Implementation Approach

### Option A: Client-side filtering (Recommended)
- **Pros**: No backend changes, instant results, works offline
- **Cons**: Limited to current page's manifest data
- **Best for**: Current scale (< 1000 photos per category)

### Option B: Server-side search API
- **Pros**: Can search across all portfolios
- **Cons**: Requires API endpoint, latency, more complex
- **Best for**: Future scale with thousands of photos

**Decision**: Option A - client-side filtering using existing manifest data

## File Changes

### New Files
- `src/components/PortfolioSearch.tsx` - Search input component
- `src/components/PortfolioSearchResults.tsx` - Results display
- `src/hooks/usePortfolioFilter.ts` - Filter logic hook

### Modified Files
- `src/components/PortfolioGallery.tsx` - Add search component integration
- `src/pages/PortfolioPage.tsx` - Pass search state to gallery
- `src/styles/components.css` - Search input styles

## Testing Strategy
- [ ] Unit tests for `usePortfolioFilter` hook
- [ ] E2E test: Search flows on each portfolio category
- [ ] Mobile: Verify collapsible search works
- [ ] Accessibility: Screen reader testing
- [ ] Performance: Test with maximum manifest size

## Rollback Plan
If issues found:
1. Remove search component from `PortfolioGallery.tsx`
2. Keep hook/component files but don't import them
3. Revert CSS changes

## Commit Messages
```
feat(component): add PortfolioSearch component
feat(hooks): add usePortfolioFilter for client-side search
feat(component): add PortfolioSearchResults display
feat(pages): integrate search into portfolio pages
```

## Post-Implementation Notes

*This section is updated during/after implementation*

- [ ] Actual implementation date:
- [ ] Performance metrics achieved:
- [ ] Any deviations from plan:
