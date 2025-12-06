# dev.mcc-cal.com - McCal Media Development Site

Next.js development site mirroring mcc-cal.com production, featuring full widget integration and API connectivity (api.mcc-cal.com).

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (Next.js 15 works best on Node 18+)
- Network access to npm registry
- Access to api.mcc-cal.com API

### Install & Run

\`\`\`bash
cd sites/dev.mcc-cal.com

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Start development server
npm run dev
# Open http://localhost:3000 or https://dev.mcc-cal.com (via Cloudflare Tunnel)
\`\`\`

### Build for Production

\`\`\`bash
# Create optimized build
npm run build

# Start production server
npm run start
# Serves on http://localhost:3000
\`\`\`

## ✨ Features

- **Server-Side Rendering (SSR)**: Fast initial page loads with pre-rendered content
- **API Integration**: Fetches data from api.mcc-cal.com with intelligent caching  
- **Concert Portfolio**: ✅ Fully implemented with dynamic filtering and lightbox
- **Image Optimization**: Next.js Image component with automatic WebP conversion
- **TypeScript**: Full type safety across the application
- **Responsive Design**: Mobile-first, works on all devices

## 📁 Project Structure

\`\`\`
sites/dev.mcc-cal.com/
├── pages/              # Page routes
│   ├── index.tsx       # Homepage
│   ├── concerts.tsx    # ✅ Concert portfolio (API integrated)
│   ├── events.tsx      # Event portfolio (coming soon)
│   ├── journalism.tsx  # Journalism (coming soon)
│   └── ...
├── utils/
│   └── api-client.ts   # ✅ NEW: API client for api.mcc-cal.com
├── components/         # React components
├── types/              # TypeScript types
└── next.config.js      # Configuration
\`\`\`

## 🔌 API Integration

### Environment Variables

Create \`.env.local\`:

\`\`\`bash
# Production API
NEXT_PUBLIC_API_URL=https://api.mcc-cal.com

# Or for local development
# NEXT_PUBLIC_API_URL=http://localhost:8787
\`\`\`

### API Client Usage

\`\`\`typescript
import { fetchManifest, getImageUrl } from '@/utils/api-client';

// Fetch concert manifest (SSR)
const manifest = await fetchManifest('concert');

// Get optimized image URL
const url = getImageUrl(image.path);
\`\`\`

### Available Endpoints

- \`GET /api/v1/manifests/{type}\` - Portfolio manifests
- \`GET /api/v1/blog/posts\` - Blog posts
- \`GET /health\` - API health check

### Caching Strategy

- **Manifests**: 10-minute cache (600s revalidation)
- **Blog Posts**: 5-minute cache (300s revalidation)

## 📄 Pages

### ✅ Concert Portfolio (\`/concerts\`)

**Status:** Fully implemented with API integration

**Features:**
- Server-side rendering with \`getServerSideProps\`
- Dynamic band filtering
- Lightbox gallery with navigation
- Next.js Image optimization
- Responsive grid layout

**Data Flow:**
\`\`\`
1. Server fetches from api.mcc-cal.com/api/v1/manifests/concert
2. Page renders with complete data (SEO-friendly)
3. Client-side filtering and interactions
4. Images from jsDelivr CDN with optimization
\`\`\`

### Coming Soon

- Events Portfolio (\`/events\`)
- Journalism (\`/journalism\`)  
- Featured Work (\`/featured-work\`)
- Portraits & Nature
- Blog with Cloudflare KV integration

## 🚢 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import repository in Vercel
3. Set: \`NEXT_PUBLIC_API_URL=https://api.mcc-cal.com\`
4. Deploy!

### Self-Hosted

\`\`\`bash
npm run build
npm start

# Or with PM2
pm2 start npm --name "mccal-site" -- start
\`\`\`

### Docker

\`\`\`bash
docker build -t mccal-nextjs .
docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=https://api.mcc-cal.com mccal-nextjs
\`\`\`

## 🔧 Troubleshooting

### API Connection Failed

\`\`\`bash
# Check API health
curl https://api.mcc-cal.com/health

# Verify environment variable
echo $NEXT_PUBLIC_API_URL
\`\`\`

### Images Not Loading

\`\`\`bash
# Test jsDelivr CDN
curl https://cdn.jsdelivr.net/gh/McCal-Codes/mccal-api@manifests-cdn/src/images/Portfolios/Concert/concert-manifest.json
\`\`\`

### Port Already in Use

\`\`\`bash
# Use different port
npm run dev -- -p 3001
npm run start -- -p 3001
\`\`\`

## 📚 Related Documentation

- [API Setup Guide](../../docs/integrations/CLOUDFLARE-SUBDOMAIN-SETUP.md)
- [GitHub Actions Integration](../../docs/workflows/GITHUB-ACTIONS-CLOUDFLARE-INTEGRATION.md)
- [Widget Standards](../../docs/standards/widget-standards.md)

---

**Version:** 0.2.0  
**API:** api.mcc-cal.com  
**Last Updated:** December 6, 2025
