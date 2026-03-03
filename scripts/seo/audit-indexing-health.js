#!/usr/bin/env node

/**
 * Audit live sitemap URL health for common Search Console indexing issues.
 *
 * Checks each URL in sitemap for:
 * - HTTP status / hard errors
 * - Redirect final URL differences
 * - Canonical mismatches
 * - noindex robots meta
 *
 * Usage:
 *   node scripts/seo/audit-indexing-health.js
 *   node scripts/seo/audit-indexing-health.js --sitemap=https://www.mcc-cal.com/sitemap.xml
 */

const https = require('https');
const http = require('http');

const DEFAULT_SITEMAP = 'https://www.mcc-cal.com/sitemap.xml';

function parseArgs(argv) {
  const options = {
    sitemap: DEFAULT_SITEMAP,
    timeoutMs: 15000
  };

  for (const arg of argv) {
    if (arg.startsWith('--sitemap=')) options.sitemap = arg.split('=')[1];
    if (arg.startsWith('--timeout=')) {
      const n = Number.parseInt(arg.split('=')[1], 10);
      if (!Number.isNaN(n) && n > 0) options.timeoutMs = n;
    }
  }

  return options;
}

function fetchUrl(url, { timeoutMs, maxRedirects = 5 } = {}) {
  return new Promise((resolve, reject) => {
    const seen = new Set();

    const doFetch = (currentUrl, remainingRedirects) => {
      if (seen.has(currentUrl)) {
        reject(new Error(`Redirect loop detected: ${currentUrl}`));
        return;
      }
      seen.add(currentUrl);

      const client = currentUrl.startsWith('https:') ? https : http;
      const req = client.get(
        currentUrl,
        {
          headers: {
            'User-Agent': 'McCal-SEO-Audit/1.0 (+https://www.mcc-cal.com)'
          }
        },
        (res) => {
          const statusCode = res.statusCode || 0;
          const location = res.headers.location;

          if (statusCode >= 300 && statusCode < 400 && location && remainingRedirects > 0) {
            const nextUrl = new URL(location, currentUrl).toString();
            res.resume();
            doFetch(nextUrl, remainingRedirects - 1);
            return;
          }

          const chunks = [];
          res.on('data', (chunk) => chunks.push(chunk));
          res.on('end', () => {
            const body = Buffer.concat(chunks).toString('utf8');
            resolve({
              url: currentUrl,
              statusCode,
              headers: res.headers,
              body
            });
          });
        }
      );

      req.setTimeout(timeoutMs, () => {
        req.destroy(new Error(`Timeout after ${timeoutMs}ms`));
      });

      req.on('error', reject);
    };

    doFetch(url, maxRedirects);
  });
}

function extractLocsFromSitemap(xml) {
  const locMatches = [...xml.matchAll(/<loc>(.*?)<\/loc>/gim)];
  return locMatches.map((m) => m[1].trim()).filter(Boolean);
}

function extractCanonical(html) {
  const match = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i);
  return match ? match[1].trim() : '';
}

function extractRobotsMeta(html) {
  const match = html.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']+)["'][^>]*>/i);
  return match ? match[1].trim() : '';
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  console.log(`🔎 Auditing sitemap: ${options.sitemap}`);
  const sitemapRes = await fetchUrl(options.sitemap, options);
  if (sitemapRes.statusCode >= 400) {
    throw new Error(`Sitemap request failed with HTTP ${sitemapRes.statusCode}`);
  }

  const urls = extractLocsFromSitemap(sitemapRes.body);
  console.log(`📄 Found ${urls.length} URLs in sitemap\n`);

  const findings = {
    notFound: [],
    serverErrors: [],
    canonicalMismatch: [],
    redirected: [],
    noindex: [],
    ok: []
  };

  for (const url of urls) {
    try {
      const res = await fetchUrl(url, options);
      const canonical = extractCanonical(res.body);
      const robots = extractRobotsMeta(res.body);
      const isNoindex = /(^|,)\s*noindex\b/i.test(robots);

      if (res.statusCode === 404) {
        findings.notFound.push({ url, status: res.statusCode });
      } else if (res.statusCode >= 500) {
        findings.serverErrors.push({ url, status: res.statusCode });
      }

      if (res.url !== url) {
        findings.redirected.push({ url, final: res.url, status: res.statusCode });
      }

      if (canonical && canonical !== res.url) {
        findings.canonicalMismatch.push({ url, final: res.url, canonical });
      }

      if (isNoindex) {
        findings.noindex.push({ url, robots });
      }

      if (
        res.statusCode < 400 &&
        res.url === url &&
        (!canonical || canonical === url) &&
        !isNoindex
      ) {
        findings.ok.push({ url, status: res.statusCode });
      }
    } catch (err) {
      findings.serverErrors.push({ url, status: 'ERR', error: err.message });
    }
  }

  console.log('=== Search Console Risk Buckets ===');
  console.log(`Not found (404): ${findings.notFound.length}`);
  console.log(`Alternate page with proper canonical: ${findings.canonicalMismatch.length}`);
  console.log(`Redirected URLs in sitemap: ${findings.redirected.length}`);
  console.log(`Noindex pages in sitemap: ${findings.noindex.length}`);
  console.log(`Healthy URLs: ${findings.ok.length}`);
  console.log('');

  const printRows = (title, rows) => {
    if (!rows.length) return;
    console.log(`## ${title}`);
    rows.forEach((row) => {
      console.log(JSON.stringify(row));
    });
    console.log('');
  };

  printRows('404 URLs', findings.notFound);
  printRows('Canonical mismatches', findings.canonicalMismatch);
  printRows('Redirected URLs', findings.redirected);
  printRows('Noindex URLs in sitemap', findings.noindex);

  const hasBlocking = findings.notFound.length > 0 || findings.serverErrors.length > 0;
  process.exit(hasBlocking ? 2 : 0);
}

main().catch((err) => {
  console.error(`❌ SEO audit failed: ${err.message}`);
  process.exit(1);
});
