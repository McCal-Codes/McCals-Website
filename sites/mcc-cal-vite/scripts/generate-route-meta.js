import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { STATIC_PAGE_ROUTES } from '../src/config/public-routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(__dirname, '..');
const distRoot = path.join(appRoot, 'dist');
const pageSeoPath = path.join(appRoot, 'src', 'content', 'pageSeoData.json');
const blogManifestPath = path.join(appRoot, 'public-vite', 'content', 'blog-static', 'blog-manifest.json');
export function resolveSiteUrl(env = process.env) {
  const vercelEnv = env.VERCEL_ENV || env.VITE_VERCEL_ENV || 'development';
  if (vercelEnv === 'production') {
    return 'https://mcc-cal.com';
  }

  return (env.VITE_SITE_URL || 'https://mcc-cal.com').replace(/\/$/, '');
}

const siteUrl = resolveSiteUrl();
const DEFAULT_OG_IMAGE_WIDTH = '1200';
const DEFAULT_OG_IMAGE_HEIGHT = '630';
const DEFAULT_OG_IMAGE_TYPE = 'image/jpeg';

/**
 * @typedef {object} BlogManifestPost
 * @property {string} slug
 * @property {string} title
 * @property {string=} excerpt
 * @property {string=} leadImage
 * @property {string=} leadImageFallback
 * @property {string=} leadImageAlt
 * @property {boolean=} published
 */

/**
 * @typedef {object} BlogManifest
 * @property {BlogManifestPost[]=} posts
 */

/**
 * @typedef {object} PageSeoEntry
 * @property {string} route
 * @property {string} title
 * @property {string} description
 * @property {string} ogTitle
 * @property {string} ogDescription
 * @property {string} imagePath
 * @property {string} imageAlt
 * @property {string=} imageWidth
 * @property {string=} imageHeight
 * @property {string=} imageType
 */

function escapeAttr(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function absoluteUrl(value) {
  return /^https?:\/\//i.test(value) ? value : `${siteUrl}${value.startsWith('/') ? value : `/${value}`}`;
}

function removeManagedImagePreloads(html) {
  return html.replace(/\s*<link[^>]+data-route-image-preload=["'][^"']+["'][^>]*>\n?/gi, '');
}

function inferImageType(image, explicitType) {
  if (explicitType) return explicitType;

  const pathname = String(image || '').split(/[?#]/)[0].toLowerCase();
  if (pathname.endsWith('.png')) return 'image/png';
  if (pathname.endsWith('.webp')) return 'image/webp';
  if (pathname.endsWith('.gif')) return 'image/gif';
  return DEFAULT_OG_IMAGE_TYPE;
}

function blogImagePath(post) {
  const image = post.leadImage || post.leadImageFallback;
  if (!image) return '/brand/abridged-icon.png';
  if (/^https?:\/\//i.test(image) || image.startsWith('/')) return image;
  if (image.startsWith(`posts/${post.slug}/`)) return `/content/blog-static/${image}`;
  return `/content/blog-static/posts/${post.slug}/${image.replace(/^\.?\//, '')}`;
}

function setTitle(html, title) {
  return html.replace(/<title>.*?<\/title>/i, `<title>${escapeAttr(title)}</title>`);
}

function setMeta(html, selector, attr, value) {
  const escapedValue = escapeAttr(value);
  const pattern = new RegExp(`(<meta\\s+${escapeRegex(selector)}[^>]*\\s${attr}=["'])[^"']*(["'][^>]*>)`, 'i');

  if (pattern.test(html)) {
    return html.replace(pattern, `$1${escapedValue}$2`);
  }

  return html;
}

function setLink(html, rel, href) {
  const escapedHref = escapeAttr(href);
  const pattern = new RegExp(`(<link\\s+rel=["']${rel}["'][^>]*\\shref=["'])[^"']*(["'][^>]*>)`, 'i');

  if (pattern.test(html)) {
    return html.replace(pattern, `$1${escapedHref}$2`);
  }

  return html.replace('</head>', `    <link rel="${rel}" href="${escapedHref}" />\n  </head>`);
}

function applyRouteMeta(indexHtml, entry) {
  const url = absoluteUrl(entry.route);
  const image = absoluteUrl(entry.imagePath);
  let html = removeManagedImagePreloads(indexHtml);
  html = setTitle(html, entry.title);

  if (entry.robots) {
    html = setMeta(html, 'name="robots"', 'content', entry.robots);
  }

  html = setMeta(html, 'name="description"', 'content', entry.description);
  html = setLink(html, 'canonical', url);
  html = setMeta(html, 'property="og:type"', 'content', entry.ogType || 'website');
  html = setMeta(html, 'property="og:title"', 'content', entry.ogTitle);
  html = setMeta(html, 'property="og:description"', 'content', entry.ogDescription);
  html = setMeta(html, 'property="og:url"', 'content', url);
  html = setMeta(html, 'property="og:image"', 'content', image);
  html = setMeta(html, 'property="og:image:alt"', 'content', entry.imageAlt);
  html = setMeta(html, 'property="og:image:width"', 'content', entry.imageWidth || DEFAULT_OG_IMAGE_WIDTH);
  html = setMeta(html, 'property="og:image:height"', 'content', entry.imageHeight || DEFAULT_OG_IMAGE_HEIGHT);
  html = setMeta(html, 'property="og:image:type"', 'content', inferImageType(entry.imagePath, entry.imageType));
  html = setMeta(html, 'name="twitter:title"', 'content', entry.ogTitle);
  html = setMeta(html, 'name="twitter:description"', 'content', entry.ogDescription);
  html = setMeta(html, 'name="twitter:image"', 'content', image);
  html = setMeta(html, 'name="twitter:image:alt"', 'content', entry.imageAlt);

  return html;
}

/**
 * Routes that are registered in the router but deliberately excluded from
 * STATIC_PAGE_ROUTES (not in nav/footer/sitemap, disallowed in robots.txt).
 * They still need a pre-rendered static HTML file: this site's Vercel
 * deployment serves every real page as its own static file, found via
 * cleanUrls filesystem matching, rather than through the SPA catch-all
 * rewrite - a path with no matching file 404s before the rewrite is ever
 * consulted. Every other route works because it's pre-rendered; these need
 * the same treatment to actually load in production.
 */
const HIDDEN_ROUTES = [
  {
    route: '/links',
    title: 'Caleb McCartney | McCal Media',
    description: 'Contact links and social profiles for Caleb McCartney.',
    robots: 'noindex, nofollow, max-image-preview:large',
    ogTitle: 'Caleb McCartney',
    ogDescription: 'Contact links and social profiles for Caleb McCartney.',
    imagePath: '/about/caleb-mccartney-photo.jpg',
    imageAlt: 'Caleb McCartney',
  },
  {
    // Reached only from the token link in a confirmation email.
    route: '/manage-booking',
    title: 'Manage your booking | Caleb McCartney',
    description: 'Reschedule or cancel your booking.',
    robots: 'noindex, nofollow',
    ogTitle: 'Manage your booking',
    ogDescription: 'Reschedule or cancel your booking.',
    imagePath: '/about/caleb-mccartney-photo.jpg',
    imageAlt: 'Caleb McCartney',
  },
];

/**
 * Meta for the generated 404.html. It is served for whatever path the visitor
 * asked for, so `route` is only used to derive a self-referential /404
 * canonical — matching what not-found.tsx sets at runtime. `noindex, nofollow`
 * is what actually keeps it out of the index.
 */
const NOT_FOUND_ENTRY = {
  route: '/404',
  title: 'Page Not Found | McCal Media',
  description:
    'The page you are looking for does not exist. Explore McCal Media for photography, podcast, and creative content.',
  robots: 'noindex, nofollow',
  ogTitle: 'Page Not Found | McCal Media',
  ogDescription: 'The page you are looking for does not exist.',
  imagePath: '/about/caleb-mccartney-photo.jpg',
  imageAlt: 'Caleb McCartney',
};

export function routeOutputPaths(route) {
  if (route === '/') return ['index.html'];

  const cleanRoute = route.replace(/^\//, '').replace(/\/$/, '');
  return [
    `${cleanRoute}/index.html`,
    `${cleanRoute}.html`,
  ];
}

/**
 * @param {{ pageSeo: Record<string, PageSeoEntry>, blogManifest?: BlogManifest }} input
 */
export function buildRouteMetaEntries({ pageSeo, blogManifest = { posts: [] } }) {
  const staticEntries = STATIC_PAGE_ROUTES
    .filter((route) => route.path !== '/')
    .map((route) => {
      const seoKey = route.seoKey || route.routeKey;
      const entry = pageSeo[seoKey];
      if (!entry) {
        throw new Error(`Missing page SEO entry for route "${route.path}" (${seoKey})`);
      }

      return {
        ...entry,
        route: route.path,
      };
    });
  const blogEntries = (blogManifest.posts || [])
    .filter((post) => post.published)
    .map((post) => ({
      route: `/blog/${post.slug}`,
      title: `${post.title} | McCal Media`,
      description: post.excerpt || 'Photojournalism and field reporting from McCal Media.',
      ogType: 'article',
      ogTitle: post.title,
      ogDescription: post.excerpt || 'Photojournalism and field reporting from McCal Media.',
      imagePath: blogImagePath(post),
      imageAlt: post.leadImageAlt || `${post.title} lead image`,
    }));

  return [...staticEntries, ...blogEntries];
}

async function generateRouteMeta() {
  const [indexHtml, pageSeoRaw, blogManifestRaw] = await Promise.all([
    fs.readFile(path.join(distRoot, 'index.html'), 'utf8'),
    fs.readFile(pageSeoPath, 'utf8'),
    fs.readFile(blogManifestPath, 'utf8').catch(() => '{"posts":[]}'),
  ]);
  const pageSeo = JSON.parse(pageSeoRaw);
  const blogManifest = JSON.parse(blogManifestRaw);
  const routeEntries = buildRouteMetaEntries({ pageSeo, blogManifest });
  const allEntries = [...routeEntries, ...HIDDEN_ROUTES];

  await Promise.all(
    allEntries.flatMap((entry) => {
      const routeHtml = applyRouteMeta(indexHtml, entry);

      return routeOutputPaths(entry.route).map(async (outputPath) => {
        const targetPath = path.join(distRoot, outputPath);
        await fs.mkdir(path.dirname(targetPath), { recursive: true });
        await fs.writeFile(targetPath, routeHtml);
        return outputPath;
      });
    }),
  );

  // Vercel serves /404.html for any path that matches no file. Without it a
  // mistyped or retired URL gets Vercel's bare "NOT_FOUND" text and the app
  // never boots, so the site's own 404 page — which exists and is routed —
  // could never actually render.
  await fs.writeFile(
    path.join(distRoot, '404.html'),
    applyRouteMeta(indexHtml, NOT_FOUND_ENTRY),
  );

  console.log(
    `Generated route meta for ${routeEntries.length} pages (+ ${HIDDEN_ROUTES.length} hidden route${HIDDEN_ROUTES.length === 1 ? '' : 's'})`,
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  generateRouteMeta().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
