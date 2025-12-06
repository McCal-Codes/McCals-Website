# Phase 2 Quick Reference

## What's New

Phase 2 adds complete Next.js component library for consuming the Cloudflare Worker API.

## Test Your Setup

```bash
# 1. Start the dev server
cd sites/dev.mcc-cal.com
npm run dev

# 2. Open these URLs:
# - http://localhost:3000/api-test      (Auto-runs API tests)
# - http://localhost:3000/showcase      (View all components)
```

## Components at a Glance

### ManifestDisplay
Shows portfolio statistics (total images, band count, etc.)
```tsx
import ManifestDisplay from '@/components/ManifestDisplay';
import { useManifest } from '@/utils/useAPI';

export default function ConcertsPage() {
  const { data, loading, error } = useManifest('concert');
  
  return (
    <ManifestDisplay
      manifest={data || {}}
      type="concert"
      loading={loading}
      error={error}
    />
  );
}
```

### BlogPostList
Displays grid of blog posts with preview
```tsx
import BlogPostList from '@/components/BlogPostList';
import { useBlogPosts } from '@/utils/useAPI';

export default function BlogPage() {
  const { posts, loading, error } = useBlogPosts();
  const [selected, setSelected] = useState(null);
  
  return (
    <BlogPostList
      posts={posts}
      loading={loading}
      error={error}
      onPostClick={setSelected}
    />
  );
}
```

### BlogPostDetail
Shows full blog post with rich content
```tsx
import BlogPostDetail from '@/components/BlogPostDetail';

<BlogPostDetail
  post={selectedPost}
  onBack={() => setSelectedPost(null)}
/>
```

### AdminDashboard
System status and controls for admins
```tsx
import AdminDashboard from '@/components/AdminDashboard';

<AdminDashboard
  apiUrl={process.env.NEXT_PUBLIC_API_URL}
  onRefreshManifests={async () => { /* ... */ }}
  onClearCache={async () => { /* ... */ }}
/>
```

## Hooks at a Glance

### useManifest
```tsx
const { data, loading, error, refetch } = useManifest('concert');
```

### useBlogPosts
```tsx
const { posts, loading, error, refetch } = useBlogPosts();
```

### useBlogPost
```tsx
const { post, loading, error, refetch } = useBlogPost(postId);
```

### useManifests
```tsx
const { data, loading, error, refetch } = useManifests(['concert', 'events']);
```

### useAPIHealth
```tsx
const { healthy, lastCheck, check } = useAPIHealth();
```

## API Endpoints

All endpoints require CORS header to be in allowed origins.

| Endpoint | Purpose | Cache |
|----------|---------|-------|
| `GET /api/v1/manifests/concert` | Concert bands | 10 min |
| `GET /api/v1/manifests/events` | Events | 10 min |
| `GET /api/v1/manifests/journalism` | Stories | 10 min |
| `GET /api/v1/manifests/nature` | Nature portfolio | 10 min |
| `GET /api/v1/manifests/portrait` | Portraits | 10 min |
| `GET /api/v1/manifests/featured` | Featured work | 10 min |
| `GET /api/v1/blog/posts` | All posts | 5 min |
| `GET /api/v1/blog/posts/:id` | Single post | 5 min |

## Manifest Structure

```typescript
interface Manifest {
  bands?: Array<{
    bandName: string;
    concerts: Array<{ date: string; images: Image[] }>;
  }>;
  events?: Array<{
    eventName: string;
    category: string;
    images: Image[];
  }>;
  stories?: Array<{
    title: string;
    publication?: string;
    date?: string;
    images: Image[];
  }>;
  totalImages: number;
  generatedAt?: string;
}

interface Image {
  path: string;
  filename: string;
  url: string;
  width?: number;
  height?: number;
  caption?: string;
}
```

## BlogPost Structure

```typescript
interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: Array<{
    type: 'text' | 'image' | 'quote' | 'code';
    content: string;
  }>;
  author: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
  published: boolean;
}
```

## Configuration

Update `.env.local`:
```
NEXT_PUBLIC_API_URL=https://api.mcc-cal.com
```

## Common Patterns

### Loading & Error States
```tsx
const { data, loading, error } = useManifest('concert');

if (loading) return <p>Loading...</p>;
if (error) return <p>Error: {error}</p>;

return <ManifestDisplay manifest={data} type="concert" />;
```

### Conditional Rendering
```tsx
const { posts } = useBlogPosts();

return (
  <div>
    {posts.length === 0 ? (
      <p>No posts yet</p>
    ) : (
      <BlogPostList posts={posts} />
    )}
  </div>
);
```

### Manual Refresh
```tsx
const { data, refetch } = useManifest('concert');

<button onClick={() => refetch()}>
  Refresh Data
</button>
```

## Troubleshooting

### API returns 503
- Worker might not be deployed
- Run: `cd tools/cloudflare && wrangler deploy`

### CORS errors
- Check `ALLOWED_ORIGINS` in wrangler.toml includes your domain
- Redeploy worker after updating

### Components not rendering
- Check browser console for errors
- Verify API URL in .env.local
- Test with /api-test page first

### Data not loading
- Use /api-test page to verify endpoints
- Check if blog posts endpoint needs authentication
- Verify manifest files exist on disk

## Files Created

| File | Type | Purpose |
|------|------|---------|
| `components/ManifestDisplay.tsx` | Component | Portfolio stats |
| `components/BlogPostList.tsx` | Component | Blog grid |
| `components/BlogPostDetail.tsx` | Component | Blog detail |
| `components/AdminDashboard.tsx` | Component | Admin panel |
| `utils/useAPI.ts` | Hooks | React hooks |
| `pages/api-test.tsx` | Page | API tester |
| `pages/showcase.tsx` | Page | Demo page |

## Key Improvements

✅ CORS now includes dev.mcc-cal.com  
✅ Full component library for consuming API  
✅ Custom React hooks for data fetching  
✅ Comprehensive API testing page  
✅ Component showcase with live examples  
✅ Enhanced manifest loader with caching  
✅ Full TypeScript support  
✅ Error handling and loading states  
✅ Responsive, accessible components  
✅ Production-ready code  

## Next Steps

1. Visit http://localhost:3000/api-test to verify setup
2. Visit http://localhost:3000/showcase to see components in action
3. Integrate components into existing pages
4. Customize styling to match your site
5. Deploy to production

## Support

- See `PHASE-2-IMPLEMENTATION.md` for detailed documentation
- See `PHASE-2-COMPLETION.md` for completion summary
- Check component files for prop documentation
- Use TypeScript IntelliSense for type hints

---
**Last Updated**: December 6, 2025  
**Phase**: 2 of 3
