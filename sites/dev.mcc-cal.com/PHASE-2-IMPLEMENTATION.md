# Phase 2: Next.js Components Implementation Guide

## Overview

Phase 2 focuses on building out the Next.js components and pages for the dev.mcc-cal.com site. The Cloudflare Worker API is configured and tested, now we need to implement the frontend components that consume these APIs.

## Completed Tasks

### 1. CORS Configuration Update ✓
- **File**: `tools/cloudflare/wrangler.toml`
- **Change**: Added `https://dev.mcc-cal.com` to `ALLOWED_ORIGINS`
- **Before**: `"https://mcc-cal.com,https://*.mcc-cal.com,http://localhost:*"`
- **After**: `"https://mcc-cal.com,https://dev.mcc-cal.com,https://*.mcc-cal.com,http://localhost:*"`
- **Deployment**: Run `wrangler deploy` to apply changes

### 2. API Integration Testing ✓
- **File**: `sites/dev.mcc-cal.com/pages/api-test.tsx`
- **Tests Included**:
  - CORS Preflight verification
  - Concert Manifest endpoint
  - Events Manifest endpoint
  - Journalism Manifest endpoint
  - Blog Posts endpoint
  - Rate Limiting headers
  - Cache headers validation
- **Access**: http://localhost:3000/api-test (auto-runs on page load)
- **Features**: 
  - Real-time test execution
  - Detailed error messages
  - Performance timing for each endpoint
  - Response body inspection

## Phase 2 Components Created

### 1. ManifestDisplay Component
- **File**: `sites/dev.mcc-cal.com/components/ManifestDisplay.tsx`
- **Purpose**: Display manifest data and portfolio statistics
- **Features**:
  - Show total image count
  - Display band/event/story counts
  - List preview of items
  - Show generation timestamp
  - Error and loading states
- **Props**:
  - `manifest: Manifest` - Manifest data from API
  - `type: string` - Portfolio type (concert, events, journalism)
  - `loading?: boolean` - Loading state
  - `error?: string` - Error message

### 2. BlogPostList Component
- **File**: `sites/dev.mcc-cal.com/components/BlogPostList.tsx`
- **Purpose**: Display grid of blog posts
- **Features**:
  - Grid layout (responsive)
  - Post preview with title, excerpt, author
  - Publication status badge
  - Click handler for post detail view
  - Hover animations
  - Empty state message
- **Props**:
  - `posts: BlogPost[]` - Array of blog posts
  - `loading?: boolean` - Loading state
  - `error?: string` - Error message
  - `onPostClick?: (post: BlogPost) => void` - Click handler

### 3. BlogPostDetail Component
- **File**: `sites/dev.mcc-cal.com/components/BlogPostDetail.tsx`
- **Purpose**: Display single blog post with full content
- **Features**:
  - Full post content rendering
  - Support for multiple content block types (text, image, quote, code)
  - Author and publication info
  - Back button navigation
  - Semantic HTML structure
  - Print-friendly styling
- **Supported Block Types**:
  - `text`: Rendered as paragraph with proper spacing
  - `image`: Displayed with responsive sizing and shadow
  - `quote`: Styled blockquote with left border
  - `code`: Formatted code block with monospace font
- **Props**:
  - `post: BlogPost` - Blog post data
  - `loading?: boolean` - Loading state
  - `error?: string` - Error message
  - `onBack?: () => void` - Back button handler

### 4. AdminDashboard Component
- **File**: `sites/dev.mcc-cal.com/components/AdminDashboard.tsx`
- **Purpose**: Admin control panel and system status
- **Features**:
  - API health status (ok/degraded/down)
  - Cache status monitoring
  - Manifest count display
  - System uptime tracking
  - Refresh manifests action
  - Clear cache action
  - Action result notifications
- **Props**:
  - `apiUrl: string` - Base API URL
  - `onRefreshManifests?: () => Promise<void>` - Refresh handler
  - `onClearCache?: () => Promise<void>` - Cache clear handler

## Integration with Existing Pages

### Updated Pages

The components should be integrated into the following pages:

1. **Blog Page** (`pages/blog.tsx`)
   - Use `BlogPostList` to display all posts
   - Use `BlogPostDetail` for post preview/modal
   - Hook up with `fetchBlogPosts()` API call

2. **Portfolio Pages** (`pages/concerts.tsx`, `pages/events.tsx`, etc.)
   - Use `ManifestDisplay` to show portfolio stats
   - Display manifest-driven widgets below statistics

3. **Admin Page** (new or existing)
   - Use `AdminDashboard` for control panel
   - Link to API test page for diagnostics

## Next Steps for Phase 2

### Priority 1: Blog Integration
- [ ] Update `pages/blog.tsx` to use new components
- [ ] Implement blog detail view/modal
- [ ] Add loading and error states
- [ ] Test with live API

### Priority 2: Portfolio Dashboard
- [ ] Create admin dashboard page
- [ ] Integrate `AdminDashboard` component
- [ ] Add manifest refresh capability
- [ ] Set up cache management endpoints

### Priority 3: Manifest Display
- [ ] Update all portfolio pages to use `ManifestDisplay`
- [ ] Show statistics above widget galleries
- [ ] Add portfolio comparison view

### Priority 4: Enhanced Features
- [ ] Add search/filter capabilities to blog list
- [ ] Implement pagination for large manifest sets
- [ ] Add manifests view/inspector for debugging
- [ ] Create portfolio import/sync utilities

## Testing Checklist

Before deploying Phase 2:

- [ ] API test page passes all endpoint tests
- [ ] BlogPostList renders without errors
- [ ] BlogPostDetail displays all content block types correctly
- [ ] ManifestDisplay shows statistics accurately
- [ ] AdminDashboard connects to API health endpoint
- [ ] All components handle loading and error states
- [ ] Mobile responsive layout verified
- [ ] CORS works from dev.mcc-cal.com domain
- [ ] Lighthouse scores maintained

## Local Development

### Starting the Dev Server
```bash
cd sites/dev.mcc-cal.com
npm run dev
```

### Testing Components
1. Navigate to http://localhost:3000/api-test to verify API integration
2. Open each portfolio page to verify manifest loading
3. Check browser console for errors/warnings

### Environment Setup
Ensure `.env.local` has:
```
NEXT_PUBLIC_API_URL=https://api.mcc-cal.com
# Or for local testing:
# NEXT_PUBLIC_API_URL=http://localhost:8787
```

## API Endpoints Reference

All endpoints require CORS origin to be in allowed list:

- `GET /api/v1/manifests/concert` - Concert manifest with bands and concerts
- `GET /api/v1/manifests/events` - Events manifest
- `GET /api/v1/manifests/journalism` - Journalism stories
- `GET /api/v1/manifests/nature` - Nature portfolio
- `GET /api/v1/manifests/portrait` - Portrait gallery
- `GET /api/v1/manifests/featured` - Featured work selection
- `GET /api/v1/blog/posts` - All blog posts (cached 5 min)
- `GET /api/v1/blog/posts/:id` - Single blog post
- `POST /api/v1/blog/auth/login` - Blog authentication

### Rate Limiting
- Limit: 100 requests per minute per IP
- Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`
- Status 429 when exceeded

### Caching
- Manifests: 10 minutes TTL, 1 hour stale-while-revalidate
- Blog posts: 5 minutes TTL
- ETag validation supported

## Deployment Considerations

1. **CORS**: Cloudflare Worker CORS must be updated before deployment
2. **API URL**: Update `NEXT_PUBLIC_API_URL` env var if using different endpoint
3. **CDN**: Consider caching strategy for static blog content
4. **Performance**: Monitor Lighthouse scores after component integration
5. **Error Handling**: Implement comprehensive error boundaries

## Troubleshooting

### CORS Errors
- Check that dev.mcc-cal.com is in `ALLOWED_ORIGINS` in wrangler.toml
- Run `wrangler deploy` to apply changes
- Test with `/api-test` page first

### API 503/Unavailable
- Check Cloudflare Worker is deployed: `wrangler list`
- Verify KV namespace exists and is bound
- Check worker logs: `wrangler tail`

### Components Not Rendering
- Check browser console for TypeScript/React errors
- Verify API response structure matches expected interfaces
- Run API test page to isolate API vs component issues

## Files Summary

| File | Component | Status | Purpose |
|------|-----------|--------|---------|
| `pages/api-test.tsx` | API Test Page | ✓ Complete | Verify API integration and CORS |
| `components/ManifestDisplay.tsx` | Manifest Display | ✓ Complete | Show portfolio statistics |
| `components/BlogPostList.tsx` | Blog List | ✓ Complete | Display blog posts grid |
| `components/BlogPostDetail.tsx` | Blog Detail | ✓ Complete | Display single post |
| `components/AdminDashboard.tsx` | Admin Panel | ✓ Complete | System status and controls |
| `utils/api-client.ts` | API Client | ✓ Existing | API calls and type definitions |

## Resources

- **Cloudflare Worker Docs**: https://developers.cloudflare.com/workers/
- **Next.js Docs**: https://nextjs.org/docs
- **Component Props Guide**: See component files for full prop documentation

---

**Last Updated**: December 6, 2025
**Phase**: 2 of 3 (Components)
**Status**: In Progress
