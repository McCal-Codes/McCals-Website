# dev.mcc-cal.com - McCal Media Development Site

Next.js development site mirroring mcc-cal.com production, featuring full widget integration and API connectivity (api.mcc-cal.com).

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (Next.js 15 works best on Node 18+)
- Network access to npm registry
- Access to api.mcc-cal.com API
- Cloudflare Tunnel configured (one-time setup complete ✅)

### Three Ways to Start

#### Option 1: Auto-start with VS Code (Easiest)
When you open this workspace in VS Code, both the Next.js server and Cloudflare tunnel will start automatically!

- **Local:** http://localhost:3000
- **Public:** https://dev.mcc-cal.com

To disable auto-start, remove the `task.runTask` section from `.vscode/settings.json`.

#### Option 2: Manual with VS Code Tasks
Press `Cmd+Shift+P` (macOS) or `Ctrl+Shift+P` (Windows/Linux), then:
1. Type "Tasks: Run Task"
2. Select "Dev Site: Start All"

Both services will start in dedicated terminal panels.

#### Option 3: Command Line Script
```bash
cd sites/dev.mcc-cal.com

# Start both services with one command
npm run dev:full

# Or start manually in separate terminals:
# Terminal 1: npm run dev
# Terminal 2: cloudflared tunnel run mccal-dev
```

### Stop Services
- VS Code: Click the trash icon in the terminal panels
- Script: Press `Ctrl+C` in the terminal running `npm run dev:full`
- Manual: `Ctrl+C` in each terminal window

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

- **Production-Perfect Widgets**: Dev pages use the exact same widget code as mcc-cal.com  
- **🔄 Dynamic Widget Reloading**: See widget changes instantly during development (no rebuild needed!)
- **Server-Side Rendering (SSR)**: Fast initial page loads with pre-rendered content
- **API Integration**: Fetches data from api.mcc-cal.com with intelligent caching  
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

## 🎯 Widget Embed System

As of December 6, 2025, all portfolio pages use the **WidgetEmbed** component, which loads production widget HTML directly from the McCals-Website repository. This ensures perfect parity between dev and production.

### How It Works

1. Each page (journalism, concerts, events, etc.) uses `<WidgetEmbed>`
2. `WidgetEmbed` fetches the production widget HTML from GitHub raw content
3. Widget HTML is injected and scripts are re-executed
4. Result: Dev pages look **identical** to mcc-cal.com

### Widget Changelogs

Each widget includes its own built-in changelog modal! Click the **version indicator** badge (e.g., "v5.2") next to the widget title to view:
- All changes and improvements for that version
- Previous version notes
- Feature highlights

This is the **exact same changelog** shown on the production Squarespace site.

### Current Widget Pages

| Page | Widget | Version | Changelog |
|------|--------|---------|-----------|
| `/journalism` | photojournalism-portfolio | v5.2.0 | ✓ Click v5.2 badge |
| `/concerts` | concert-portfolio | v4.7.1 | ✓ Click v4.7.1 badge |
| `/events` | event-portfolio | v2.6.4 | ✓ Click v2.6.4 badge |
| `/featured-work` | featured-portfolio | v1.5.0 | ✓ Click v1.5.0 badge |
| `/portraits` | portrait-portfolio | v1.1 | ✓ Click v1.1 badge |
| `/nature` | nature-portfolio | v1.0 | ✓ Click v1.0 badge |
| `/podcast` | podcast-feed | v1.9.5 | ✓ Click v1.9.5 badge |

### Widget Development & Hot Reload

**New Feature**: Widgets now reload dynamically during development!

During development (`localhost:3000`):
- Widget files are loaded from the **local filesystem**
- Changes appear **instantly** when you edit a widget HTML file
- No need to rebuild or commit changes
- Simply press **Ctrl+Shift+W** (Cmd+Shift+W on macOS) to reload

In production (deployed site):
- Widgets are loaded from **GitHub** (frozen, consistent versions)
- Behavior unchanged from previous implementation

**For detailed workflow and troubleshooting, see:**
[Widget Hot Reload Development Guide](./WIDGET-HOT-RELOAD-GUIDE.md)

### Adding New Widget Pages

See **[WIDGET-EMBED-GUIDE.md](./WIDGET-EMBED-GUIDE.md)** for detailed instructions on:
- Adding a new widget page
- Updating widget versions
- Troubleshooting widget loading issues

### Benefits

✅ **Zero Duplication** - Single source of truth for widget code  
✅ **Instant Development Feedback** - See changes as you make them (no rebuild delays)
✅ **Automatic Updates** - Changes to production widgets instantly appear on dev  
✅ **Built-in Changelogs** - View changelog modal for each widget  
✅ **Easy Maintenance** - No custom React components to keep in sync  
✅ **Perfect Parity** - Dev always matches production exactly  

## 📚 Related Documentation

- [Widget Hot Reload Guide](./WIDGET-HOT-RELOAD-GUIDE.md) - **NEW**: Instant widget development feedback
- [Widget Embed Guide](./WIDGET-EMBED-GUIDE.md) - Adding and updating widgets
- [API Setup Guide](../../docs/integrations/CLOUDFLARE-SUBDOMAIN-SETUP.md)
- [GitHub Actions Integration](../../docs/workflows/GITHUB-ACTIONS-CLOUDFLARE-INTEGRATION.md)
- [Widget Standards](../../docs/standards/widget-standards.md)

---

**Version:** 0.3.0 (Added Widget Hot Reload)  
**API:** api.mcc-cal.com  
**Last Updated:** December 6, 2025
