# Widget Migration Plan

**Objective**: Migrate 8 remaining bridge pages from `WidgetEmbed` to full React components, then purge the `src/widgets/` directory.

## Current State

### Fully Migrated Pages (React) ✅
| Page | Component | Status |
|------|-----------|--------|
| `/concerts` | `ConcertsPage` | ✅ Complete |
| `/events` | `EventsPage` | ✅ Complete |
| `/journalism` | `JournalismPage` | ✅ Complete |
| `/blog` | `BlogPage` | ✅ Complete |
| `/podcast` | `PodcastPage` | ✅ Complete |
| `/about` | `AboutPage` | ✅ Complete |

### Bridge Pages (WidgetEmbed) ⚠️
| Page | Widget Used | Migration Priority | Complexity |
|------|-------------|-------------------|------------|
| `/nature` | `nature-portfolio` | High | Medium |
| `/portraits` | `portrait-portfolio` | High | Medium |
| `/video` | `video-portfolio` | Medium | High |
| `/roadmap` | `roadmap` | Low | Low |
| `/design-systems` | `design-system-portfolio` | Low | Medium |
| `/contact-us` | `contact-form` | High | Low |
| `/request-a-quote` | `quote-request` | Medium | Medium |
| `/abridged` | `abridged` | Low | Low |

## Migration Strategy

### Phase 1: Portfolio Pages (Nature, Portraits)
**Priority**: High - User-facing, SEO-important

These follow the same pattern as `ConcertsPage`:

```tsx
// Pattern from concerts.tsx
import { NaturePortfolio } from '@/components/portfolios';
import { useManifest } from '@/components/portfolio';

export default function NaturePage() {
  const { data, status, error } = useManifest<NatureManifest>('nature');
  
  return (
    <Layout>
      <div className="pf-root">
        <h1 className="pf-heading">Nature Photography</h1>
        {status === 'success' && <PortfolioGrid groups={adaptedGroups} />}
      </div>
    </Layout>
  );
}
```

**Steps**:
1. Create `nature-manifest.json` if not exists
2. Create `adaptNature()` function in `utils/adapters.ts`
3. Copy `concerts.tsx` pattern to `nature.tsx`
4. Update routes
5. Test and deploy

### Phase 2: Contact Pages (Contact Us, Request a Quote)
**Priority**: High - User conversion critical

These need form handling:

```tsx
// Pattern for contact pages
import { ContactForm } from '@/components/forms';
import { useForm } from '@/hooks/useForm';

export default function ContactPage() {
  const { submit, status } = useForm('/api/contact');
  
  return (
    <Layout>
      <ContactForm onSubmit={submit} status={status} />
    </Layout>
  );
}
```

**Steps**:
1. Create `ContactForm` component with validation
2. Create `useForm` hook for submission handling
3. Set up API endpoint for form handling
4. Migrate pages

### Phase 3: Content Pages (Video, Design Systems, Abridged, Roadmap)
**Priority**: Medium/Low - Lower traffic

These are mostly static content:

```tsx
// Pattern for static content pages
import { VideoContent } from '@/components/content';

export default function VideoPage() {
  return (
    <Layout>
      <VideoContent />
    </Layout>
  );
}
```

## Implementation Timeline

### Week 1: Portfolio Pages
- [ ] Create `nature.tsx` (follow concerts pattern)
- [ ] Create `portraits.tsx` (follow concerts pattern)
- [ ] Add nature/portrait manifests to sync script
- [ ] Test image loading and lightbox
- [ ] Deploy to staging

### Week 2: Contact Pages
- [ ] Create `ContactForm` component
- [ ] Create `useForm` hook
- [ ] Create API endpoint for form submission
- [ ] Migrate `contact-us.tsx`
- [ ] Migrate `request-a-quote.tsx`
- [ ] Test form submissions
- [ ] Deploy to staging

### Week 3: Content Pages
- [ ] Migrate `video.tsx`
- [ ] Migrate `design-systems.tsx`
- [ ] Migrate `abridged.tsx`
- [ ] Migrate `roadmap.tsx`
- [ ] Deploy to staging

### Week 4: Cleanup
- [ ] Remove `WidgetEmbed` component
- [ ] Remove `widgetConfig.ts` and `widgetHotReload.ts`
- [ ] Archive `src/widgets/` to `docs/archive/widgets-backup/`
- [ ] Remove widget API endpoint
- [ ] Update documentation
- [ ] Final deployment

## Post-Migration Cleanup

### Files to Remove
- `src/components/widgets/WidgetEmbed.tsx`
- `src/utils/widgetConfig.ts`
- `src/utils/widgetHotReload.ts`
- `src/pages/api/widgets/[...slug].js`
- `src/widgets/` (entire directory)

### Documentation Updates
- Update `ONBOARDING.md` - remove widget references
- Update `deployment-guide.md` - remove widget build steps
- Archive widget docs to `docs/archive/`

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Missing widget functionality | High | Thorough testing of each migrated page |
| Form submission breaking | High | Test API endpoints before deployment |
| Image loading issues | Medium | Verify manifest paths, use staging |
| SEO impact | Low | Keep meta tags identical, use redirects |

## Success Criteria

- [ ] All 8 bridge pages migrated to React
- [ ] `src/widgets/` directory removed
- [ ] Zero references to `WidgetEmbed` in codebase
- [ ] All pages render without console errors
- [ ] Forms submit correctly
- [ ] Images lazy-load properly
- [ ] SEO meta tags preserved
- [ ] Lighthouse scores maintained or improved

## References

- [Concerts Page Implementation](../sites/mcc-cal-vite/src/pages/concerts.tsx)
- [Portfolio Components](../sites/mcc-cal-vite/src/components/portfolio/)
- [Widget Config Mapping](../sites/mcc-cal-vite/src/utils/widgetConfig.ts)
