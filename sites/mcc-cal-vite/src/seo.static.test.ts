import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { STATIC_PAGE_ROUTES } from './config/public-routes.js';
import pageSeoData from './content/pageSeoData.json';

const __dirname = dirname(fileURLToPath(import.meta.url));

type PageSeoRecord = Record<string, { route: string; title: string; description: string; imagePath: string }>;

const pageSeo = pageSeoData as PageSeoRecord;

describe('static SEO metadata', () => {
  it('defines build-time metadata for every sitemap static route', () => {
    const seoRoutes = new Set(Object.values(pageSeo).map((entry) => entry.route));

    for (const route of STATIC_PAGE_ROUTES) {
      expect(seoRoutes, `${route.path} is missing from pageSeoData.json`).toContain(route.path);
    }
  });

  it('keeps static metadata unique, descriptive, and social-image ready', () => {
    const titles = new Set<string>();
    const descriptions = new Set<string>();

    for (const [key, entry] of Object.entries(pageSeo)) {
      expect(entry.title, `${key} title`).toMatch(/\S/);
      expect(entry.description.length, `${key} description length`).toBeGreaterThanOrEqual(50);
      expect(entry.description.length, `${key} description length`).toBeLessThanOrEqual(180);
      expect(entry.imagePath, `${key} imagePath`).toMatch(/^\/.+/);
      expect(titles, `${key} title should be unique`).not.toContain(entry.title);
      expect(descriptions, `${key} description should be unique`).not.toContain(entry.description);
      titles.add(entry.title);
      descriptions.add(entry.description);
    }
  });

  it('uses the canonical mcc-cal.com host in SEO fallbacks', () => {
    const legacyHost = ['https://mccalmedia', 'com'].join('.');
    const pageSources = [
      resolve(__dirname, 'pages', 'abridged.tsx'),
      resolve(__dirname, 'pages', 'design-systems.tsx'),
      resolve(__dirname, 'pages', 'video.tsx'),
    ]
      .map((file) => readFileSync(file, 'utf8'))
      .join('\n');

    expect(pageSources).not.toContain(legacyHost);
  });

  it('keeps the source homepage sharing head aligned with home SEO data', () => {
    const indexSource = readFileSync(resolve(__dirname, '..', 'index.html'), 'utf8');
    const home = pageSeo.home;

    expect(indexSource).toContain(`<meta name="description" content="${home.description}"`);
    expect(indexSource).toContain(`<meta property="og:description" content="${home.ogDescription}"`);
    expect(indexSource).toContain(`<meta name="twitter:description" content="${home.ogDescription}"`);
    expect(indexSource).not.toMatch(/XXX|TODO|PLACEHOLDER|mccalmedia\.com/i);
  });

  it('keeps browser-discovered public assets available', () => {
    const publicDir = resolve(__dirname, '..', 'public-vite');
    const expectedAssets = [
      'brand/favicon.svg',
      'brand/favicon-dark.svg',
      'brand/favicon-light-32x32.png',
      'brand/favicon-dark-32x32.png',
      'brand/favicon-light-16x16.png',
      'brand/favicon-dark-16x16.png',
      'brand/apple-touch-icon.png',
      'brand/web-app-manifest-192x192.png',
      'brand/web-app-manifest-512x512.png',
      'images/social/homepage-og.jpg',
      'og.png',
      'site.webmanifest',
    ];

    for (const asset of expectedAssets) {
      expect(existsSync(resolve(publicDir, asset)), `${asset} should exist`).toBe(true);
    }
  });
});
