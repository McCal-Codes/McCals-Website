import { chromium } from 'playwright';

const BASE_URL = process.env.PERFORMANCE_BASE_URL ?? 'http://127.0.0.1:4173';
const ROUTES = [
  {
    path: '/',
    budgets: {
      cls: 0.1,
      lcp: 2500,
      fcp: 1800,
      jsKb: 200,
      cssKb: 80,
      imageKb: 750,
    },
  },
  {
    path: '/about',
    budgets: {
      cls: 0.1,
      lcp: 2500,
      fcp: 1800,
      jsKb: 200,
      cssKb: 80,
      imageKb: 1800,
    },
  },
  {
    path: '/blog/fear-of-emotion',
    budgets: {
      cls: 0.1,
      lcp: 2500,
      fcp: 1800,
      jsKb: 200,
      cssKb: 80,
      imageKb: 2800,
    },
  },
];

const VIEWPORTS = [
  ['mobile', { width: 390, height: 844, isMobile: true }],
  ['desktop', { width: 1440, height: 1000, isMobile: false }],
];

function format(value, digits = 0) {
  return Number.isFinite(value) ? value.toFixed(digits) : 'n/a';
}

async function measureRoute(browser, route, viewportName, viewport) {
  const page = await browser.newPage({
    isMobile: viewport.isMobile,
    viewport: { width: viewport.width, height: viewport.height },
  });
  const consoleIssues = [];
  const failedResponses = [];

  // `/_vercel/*` is served by Vercel's edge, not by the app. It always 404s against
  // a local `vite preview`, which would otherwise fail every route in this check.
  const isEdgeOnlyPath = (url) => new URL(url).pathname.startsWith('/_vercel/');

  page.on('console', (message) => {
    if (!['warning', 'error'].includes(message.type())) return;
    const url = message.location()?.url;
    if (url && isEdgeOnlyPath(url)) return;
    consoleIssues.push(`${message.type()}: ${message.text()}`);
  });

  page.on('response', (response) => {
    if (response.status() >= 400 && !isEdgeOnlyPath(response.url())) {
      failedResponses.push(`${response.status()} ${response.url()}`);
    }
  });

  await page.addInitScript(() => {
    window.__mccPerfBudget = {
      cls: 0,
      fcp: 0,
      lcp: 0,
    };

    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            window.__mccPerfBudget.cls += entry.value;
          }
        }
      }).observe({ type: 'layout-shift', buffered: true });

      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const last = entries[entries.length - 1];
        if (last) {
          window.__mccPerfBudget.lcp = last.startTime;
        }
      }).observe({ type: 'largest-contentful-paint', buffered: true });

      new PerformanceObserver((list) => {
        const first = list.getEntriesByName('first-contentful-paint')[0];
        if (first) {
          window.__mccPerfBudget.fcp = first.startTime;
        }
      }).observe({ type: 'paint', buffered: true });
    } catch {
      // PerformanceObserver support varies in test harnesses.
    }
  });

  await page.goto(new URL(route.path, BASE_URL).toString(), { waitUntil: 'load' });
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(1500);

  const metrics = await page.evaluate(() => {
    const resources = performance.getEntriesByType('resource');
    // Match on the URL rather than initiatorType: Vite emits vendor chunks as
    // `<link rel="modulepreload">`, which reports initiatorType 'link', so a
    // script-only filter counted the entry chunk and missed every vendor chunk.
    const jsBytes = resources
      .filter((resource) => /\.js($|\?)/.test(resource.name))
      .reduce((sum, resource) => sum + (resource.transferSize || 0), 0);
    const cssBytes = resources
      .filter((resource) => resource.initiatorType === 'link' && /\.css($|\?)/.test(resource.name))
      .reduce((sum, resource) => sum + (resource.transferSize || 0), 0);
    const imageBytes = resources
      .filter((resource) => resource.initiatorType === 'img')
      .reduce((sum, resource) => sum + (resource.transferSize || 0), 0);

    return {
      cls: window.__mccPerfBudget.cls,
      fcp: Math.round(window.__mccPerfBudget.fcp),
      imageKb: Math.round(imageBytes / 1024),
      jsKb: Math.round(jsBytes / 1024),
      lcp: Math.round(window.__mccPerfBudget.lcp),
      cssKb: Math.round(cssBytes / 1024),
      overflowX: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
      resources: resources.length,
      title: document.title,
    };
  });

  await page.close();

  return {
    ...metrics,
    consoleIssues,
    failedResponses,
    path: route.path,
    viewport: viewportName,
  };
}

function collectFailures(result, budgets) {
  const failures = [];

  for (const [metric, budget] of Object.entries(budgets)) {
    if (result[metric] > budget) {
      failures.push(`${metric} ${format(result[metric], metric === 'cls' ? 4 : 0)} > ${budget}`);
    }
  }

  if (result.overflowX > 0) {
    failures.push(`overflowX ${result.overflowX} > 0`);
  }

  if (result.failedResponses.length > 0) {
    failures.push(`failed responses: ${result.failedResponses.join('; ')}`);
  }

  if (result.consoleIssues.length > 0) {
    failures.push(`console issues: ${result.consoleIssues.join('; ')}`);
  }

  return failures;
}

const browser = await chromium.launch({ headless: true });
const results = [];

try {
  for (const route of ROUTES) {
    for (const [viewportName, viewport] of VIEWPORTS) {
      const result = await measureRoute(browser, route, viewportName, viewport);
      const failures = collectFailures(result, route.budgets);
      results.push({ ...result, failures });
    }
  }
} finally {
  await browser.close();
}

console.table(
  results.map((result) => ({
    route: result.path,
    viewport: result.viewport,
    cls: format(result.cls, 4),
    lcp: result.lcp,
    fcp: result.fcp,
    jsKb: result.jsKb,
    cssKb: result.cssKb,
    imageKb: result.imageKb,
    overflowX: result.overflowX,
    status: result.failures.length ? 'fail' : 'pass',
  })),
);

const failures = results.filter((result) => result.failures.length > 0);

if (failures.length > 0) {
  console.error('\nPerformance budget failures:');
  for (const result of failures) {
    console.error(`- ${result.path} (${result.viewport}): ${result.failures.join('; ')}`);
  }
  process.exitCode = 1;
} else {
  console.log('\nPerformance budgets passed.');
}
