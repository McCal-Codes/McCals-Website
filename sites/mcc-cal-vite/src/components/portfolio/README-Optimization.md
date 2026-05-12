# Vercel Image CDN Optimization

## What's Been Implemented

✅ **VercelImage Component** - `/src/components/ui/VercelImage.tsx`
✅ **OptimizedPortfolioLightbox** - `/src/components/portfolio/OptimizedPortfolioLightbox.tsx`
✅ **OptimizedPortfolioCard** - `/src/components/portfolio/OptimizedPortfolioCard.tsx`

## How to Use

### 1. Basic VercelImage Usage

```tsx
import VercelImage from '../ui/VercelImage';

<VercelImage
  src="/images/portraits/event/photo.jpg"
  alt="Event photography"
  width={1200}
  height={800}
  quality={85}
  format="auto"
  priority={false}
  loading="lazy"
/>
```

### 2. Replace Portfolio Components

**Before:**
```tsx
import PortfolioLightbox from './PortfolioLightbox';
import PortfolioCard from './PortfolioCard';
```

**After:**
```tsx
import OptimizedPortfolioLightbox from './OptimizedPortfolioLightbox';
import OptimizedPortfolioCard from './OptimizedPortfolioCard';
```

### 3. Update Your Portfolio Pages

Replace the imports in your portfolio pages (events.tsx, portraits.tsx, etc.):

```tsx
// Replace these imports
import PortfolioLightbox from '../components/portfolio/PortfolioLightbox';
import PortfolioCard from '../components/portfolio/PortfolioCard';

// With these
import OptimizedPortfolioLightbox from '../components/portfolio/OptimizedPortfolioLightbox';
import OptimizedPortfolioCard from '../components/portfolio/OptimizedPortfolioCard';
```

Then update the component usage:
```tsx
// Change this
<PortfolioLightbox group={selectedGroup} onClose={closeLightbox} />
<PortfolioCard group={group} onOpen={openLightbox} onCopyLink={copyLink} />

// To this
<OptimizedPortfolioLightbox group={selectedGroup} onClose={closeLightbox} />
<OptimizedPortfolioCard group={group} onOpen={openLightbox} onCopyLink={copyLink} />
```

## Performance Benefits

- **Automatic Format Optimization**: WebP/AVIF support with fallbacks
- **Resizing**: Images served at optimal dimensions
- **Quality Control**: Adjustable quality (75-85 recommended)
- **Global CDN**: Faster loading worldwide
- **Lazy Loading**: Built-in performance optimizations

## Next Steps

1. Update each portfolio page to use optimized components
2. Test locally to ensure images load correctly
3. Deploy to see performance improvements
4. Monitor with Vercel Speed Insights

## Expected Results

- **40-60% faster image loading**
- **Better Core Web Vitals scores**
- **Reduced bandwidth usage**
- **Improved user experience for portfolio galleries**
