#!/usr/bin/env node
/**
 * Accessibility scan. Fails when it finds violations.
 *
 * What this replaced, and why each part mattered:
 *
 *   - It set a non-zero exit only inside catch, so violations were serialised
 *     to JSON and the job exited 0. A page with fifty WCAG AA failures passed.
 *   - It injected axe from cdnjs at run time, so a CDN outage was the only
 *     realistic way it went red, and the version was pinned in a URL rather
 *     than in the lockfile. @axe-core/playwright pins it properly.
 *   - It scanned exactly one URL, defaulting to a port nothing serves.
 *   - It wrote one of the three report files its workflow uploaded. The other
 *     two were stale files committed in November 2025, re-uploaded on every run
 *     as though they were results.
 *
 * Usage:
 *   node scripts/a11y/axe-firefox.js                       # http://127.0.0.1:4173
 *   node scripts/a11y/axe-firefox.js https://mcc-cal.com   # explicit base
 *   node scripts/a11y/axe-firefox.js --routes /,/events    # override routes
 *   node scripts/a11y/axe-firefox.js --browser chromium   # firefox by default
 *
 * A bare URL argument is still accepted, because .github/workflows both call it
 * that way.
 */
const fs = require('fs');
const path = require('path');
const playwright = require('playwright');
const { AxeBuilder } = require('@axe-core/playwright');

const DEFAULT_BASE = 'http://127.0.0.1:4173';

/**
 * One route per kind of page rather than every route: a template's problems
 * repeat across its instances, so scanning all seventy would multiply run time
 * without finding more.
 */
const DEFAULT_ROUTES = [
  '/', // hero, carousel, nav
  '/events', // gallery grid and its cards
  '/contact-us', // a form
  '/request-a-quote', // the multi-step form
  '/podcast', // audio player controls
  '/about', // long-form prose
];

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

function parseArgs(argv) {
  let base = DEFAULT_BASE;
  let routes = DEFAULT_ROUTES;
  // Firefox by default, because a second engine catches things Chromium's
  // accessibility tree does not. Selectable so the scan can still be run where
  // Firefox cannot launch, such as a sandboxed shell.
  let browserName = 'firefox';

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--routes') {
      routes = String(argv[i + 1] || '')
        .split(',')
        .map((r) => r.trim())
        .filter(Boolean);
      i += 1;
    } else if (arg === '--browser') {
      browserName = argv[i + 1];
      i += 1;
    } else if (arg === '--base-url') {
      base = argv[i + 1];
      i += 1;
    } else if (!arg.startsWith('--')) {
      base = arg;
    }
  }

  return { base: String(base).replace(/\/$/, ''), routes, browserName };
}

function summarise(results) {
  const lines = ['# Accessibility scan', ''];
  let total = 0;

  for (const page of results) {
    const count = page.violations.length;
    total += count;
    lines.push(
      `## ${page.route} — ${count === 0 ? 'no violations' : `${count} violation${count === 1 ? '' : 's'}`}`,
    );
    lines.push('');
    for (const v of page.violations) {
      lines.push(`- **${v.id}** (${v.impact || 'unknown impact'}): ${v.help}`);
      lines.push(
        `  - ${v.nodes.length} element${v.nodes.length === 1 ? '' : 's'}, e.g. \`${(v.nodes[0]?.target || []).join(' ')}\``,
      );
      lines.push(`  - ${v.helpUrl}`);
    }
    lines.push('');
  }

  lines.unshift(
    `Scanned ${results.length} route${results.length === 1 ? '' : 's'}, found ${total} violation${total === 1 ? '' : 's'}.`,
    '',
  );
  return { markdown: lines.join('\n'), total };
}

(async () => {
  const { base, routes, browserName } = parseArgs(process.argv.slice(2));
  if (routes.length === 0) {
    console.error('No routes to scan.');
    process.exitCode = 2;
    return;
  }

  const engine = playwright[browserName];
  if (!engine) {
    console.error(`Unknown browser: ${browserName}`);
    process.exitCode = 2;
    return;
  }

  console.log(`Scanning ${routes.length} route(s) against ${base} with ${browserName}.`);

  let browser;
  try {
    browser = await engine.launch({ headless: true });
  } catch (err) {
    // Failing to start the browser is not a clean scan, and the old script's
    // habit of exiting 0 on anything short of a thrown axe error is the whole
    // reason this file was rewritten.
    console.error(`Could not launch ${browserName}: ${err.message}`);
    process.exitCode = 2;
    return;
  }
  const results = [];
  let failedToLoad = 0;

  try {
    // A context, not browser.newPage(): AxeBuilder refuses a page created
    // directly off the browser.
    const context = await browser.newContext();
    for (const route of routes) {
      const page = await context.newPage();
      const url = `${base}${route}`;
      try {
        const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 45_000 });
        if (response && response.status() >= 400) {
          // A 404 that scanned clean would otherwise read as a pass.
          console.error(`  ${route}: HTTP ${response.status()}`);
          failedToLoad += 1;
          continue;
        }
        const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
        console.log(`  ${route}: ${violations.length} violation(s)`);
        results.push({ route, url, violations });
      } catch (err) {
        console.error(`  ${route}: could not scan: ${err.message}`);
        failedToLoad += 1;
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }

  fs.mkdirSync('reports', { recursive: true });
  const { markdown, total } = summarise(results);
  fs.writeFileSync(
    path.join('reports', 'axe-firefox-results.json'),
    JSON.stringify(results, null, 2),
  );
  fs.writeFileSync(path.join('reports', 'axe-firefox-summary.md'), `${markdown}\n`);
  console.log('\nWrote reports/axe-firefox-results.json and reports/axe-firefox-summary.md');

  if (failedToLoad > 0) {
    // Not scanning is not the same as finding nothing, and must not read as one.
    console.error(`\n${failedToLoad} route(s) could not be scanned.`);
    process.exitCode = 2;
    return;
  }

  if (total > 0) {
    console.error(`\n${total} accessibility violation(s). See reports/axe-firefox-summary.md.`);
    process.exitCode = 1;
    return;
  }

  console.log('\nNo violations.');
})();
