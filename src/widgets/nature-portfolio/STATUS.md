# Nature Portfolio Widget — STATUS

**Status**: 🚧 Enhanced & Testing (WIP)  
**Phase**: Content expansion & performance validation  
**Current Version**: v1.7  
**Last Updated**: 2025-11-19  
**Next Review**: 2025-12-05  
**Expected Completion**: TBD  

## Snapshot
Core functionality stable; requires additional Wildlife & Landscapes content and Squarespace embed validation before promotion to production.

## Working ✅
- Expanded capacity (dynamic cap up to 3 images per collection)
- Landscape & Wildlife filtering with dynamic tab visibility
- Responsive masonry grid + lightbox
- Accessibility baseline (focusable cards, alt propagation)
- Manifest integration (aggregated nature-manifest.json)

## Needs Work ⚠️
- Additional curated nature photos for variety
- Performance scaling test (50–100 images scenario)
- Lighthouse performance & axe accessibility scans
- Optional structured data (ImageGallery) addition

## Development Checklist
- [ ] Add 20+ new wildlife images (multiple species)
- [ ] Add 10+ landscape/location images
- [ ] Run performance test with expanded dataset
- [ ] Implement optional ImageGallery JSON-LD
- [ ] Accessibility pass (focus outline contrast, lightbox SR cues)
- [ ] Finalize README with embed & configuration section

## Exit Criteria
1. Content threshold met (≥40 images total)
2. Performance metrics within acceptable baseline (FCP/LCP parity with concert v4.6)
3. Accessibility audit passes with no critical issues
4. Structured data validated (if implemented)
5. README updated & STATUS.md removed

## Usage Guidance
Suitable only for testing in local dev harness; do not promote to Squarespace production until exit criteria satisfied.

---
_STATUS template applied per workspace standards on 2025-11-19_