# Widget Development Tutorial Series — Part 4: Deployment & Versioning

> Goal: Promote a polished widget to a tagged, documented release ready for Squarespace embedding.
> Pre-req: Parts 1–3 complete (structure, performance, accessibility).

---
## 1. Final Verification Checklist
- [ ] Performance metrics captured (Lighthouse snapshot) — TODO script
- [ ] Accessibility audit (axe) passes with no critical violations
- [ ] README updated (embed instructions + version badge)
- [ ] CHANGELOG entry created (semantic version bump rationale)
- [ ] Structured data validated (if applicable)
- [ ] Two active versions max; archive older versions

## 2. Tagging & CDN Pinning
```bash
# Tag and push
git tag testimonials@1.0.0
git push origin testimonials@1.0.0
# jsDelivr pattern
https://cdn.jsdelivr.net/gh/<owner>/<repo>@testimonials@1.0.0/src/widgets/testimonials/versions/v1.0.0-testimonials.html
```

## 3. Archive Workflow (Planned Automation)
- Move superseded versions to `src/widgets/_archived/legacy-widget-versions/<widget>/versions/`
- Update `INDEX.json` with `{ version, date, summary }`
- CI will validate active vs archived counts (TODO: add enforcement job)

## 4. Squarespace Embed Snippet
```html
<div class="mccal-widget" data-src="JSDELIVR_URL_HERE"></div>
<script>(function(){var c=document.querySelector('.mccal-widget'); if(!c) return; var s=c.getAttribute('data-src'); if(!s) return; fetch(s,{mode:'cors'}).then(r=>r.ok?r.text():Promise.reject()).then(t=>c.innerHTML=t).catch(()=>{});})();</script>
```

## 5. Post-Release Validation
- [ ] Confirm widget renders identically on Squarespace (layout + interactions)
- [ ] Verify network panel: no 404s / missing assets
- [ ] Confirm structured data appears in page source once
- [ ] Check light/dark/system theme logic (if implemented)

## 6. Patch Releases
- Use PATCH for bug fixes only (no breaking HTML/CSS changes)
- Add focused CHANGELOG entry; avoid adding new large features in patch

## 7. Minor Releases
- Introduce new non-breaking features
- Maintain backwards compatibility for existing embed selectors

## 8. Major Releases
- Only when breaking markup or data contracts
- Provide migration notes in README & root CHANGELOG

## 9. Rollback Strategy
- Keep previous stable version intact
- If new version causes issues in production, immediately retag previous stable with `latest` pointer in documentation

## 10. Release Automation (Future)
- TODO: Add GitHub workflow to lint, validate, bundle metrics, and attach release notes automatically.
- TODO: Add script to diff two widget versions and list CSS/JS surface changes for review.

## 11. Follow-Ups
- TODO: Implement widget registry manifest summarizing all active versions for index page.
- TODO: Add changelog semantic validation script (checks headings format, date order).

---
*Last updated: 2025-11-19*
