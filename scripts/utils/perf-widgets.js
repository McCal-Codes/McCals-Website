#!/usr/bin/env node
/**
 * Playwright performance scaffold for widgets
 * Measures simple load timings and collects basic metrics per widget route.
 * Saves HTML reports to test-results/.
 */

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '../..');
const OUTDIR = path.join(ROOT, 'test-results');

function ensureDir(p) { if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true }); }

async function measure(url, name) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const start = Date.now();
  let metrics = { name, url };
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');
    /* eslint-disable no-undef */
    const dom = await page.evaluate(() => ({
      title: document?.title || '',
      images: document ? document.querySelectorAll('img').length : 0,
      scripts: document ? document.querySelectorAll('script').length : 0,
      links: document ? document.querySelectorAll('a').length : 0
    }));
    /* eslint-enable no-undef */
    metrics = { ...metrics, dom, ms: Date.now() - start };
  } catch (e) {
    metrics.error = e.message;
  } finally {
    await browser.close();
  }
  return metrics;
}

async function main() {
  ensureDir(OUTDIR);
  const base = 'http://localhost:3000';
  const routes = [
    { path: '/', name: 'home' },
    { path: '/widgets', name: 'widgets' },
  ];

  // Try to start dev server if not running (best-effort)
  const { spawn } = require('child_process');
  const server = spawn('node', [path.join(ROOT, 'dev-server.js')], { stdio: 'inherit' });
  // Give server time to start
  await new Promise(r => setTimeout(r, 3000));

  const results = [];
  for (const r of routes) {
    const url = base + r.path;
    results.push(await measure(url, r.name));
  }

  const html = `<!doctype html><meta charset="utf-8"><title>Widget Performance</title>
  <style>body{font-family:system-ui,sans-serif;padding:24px} pre{background:#f5f5f5;padding:12px;border-radius:8px}</style>
  <h1>Widget Performance (Playwright Scaffold)</h1>
  <p>Basic timings and DOM metrics. Lighthouse integration to follow.</p>
  <pre>${JSON.stringify(results, null, 2)}</pre>`;
  fs.writeFileSync(path.join(OUTDIR, 'performance-report.html'), html, 'utf8');

  // Stop server
  server.kill('SIGINT');
}

main().catch(e => { console.error(e); process.exitCode = 1; });
