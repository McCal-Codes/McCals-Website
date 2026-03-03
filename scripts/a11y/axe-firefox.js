/* global axe */
const fs = require('fs');
const path = require('path');
const { firefox } = require('playwright');

function escHtml(input) {
  return String(input || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function ensureReportsDir() {
  const dir = path.resolve('reports');
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function buildSummaryMarkdown(url, results) {
  const violations = Array.isArray(results.violations) ? results.violations : [];
  const incomplete = Array.isArray(results.incomplete) ? results.incomplete : [];
  const passes = Array.isArray(results.passes) ? results.passes : [];

  const lines = [];
  lines.push('# Axe Firefox Accessibility Summary');
  lines.push('');
  lines.push(`- Target URL: ${url}`);
  lines.push(`- Violations: ${violations.length}`);
  lines.push(`- Incomplete: ${incomplete.length}`);
  lines.push(`- Passes: ${passes.length}`);
  lines.push('');

  if (!violations.length) {
    lines.push('## ✅ No violations found');
    lines.push('');
    return lines.join('\n');
  }

  lines.push('## ❌ Violations');
  lines.push('');
  violations.forEach((v, i) => {
    lines.push(`### ${i + 1}. ${v.id}`);
    lines.push(`- Impact: ${v.impact || 'unknown'}`);
    lines.push(`- Help: ${v.help || ''}`);
    lines.push(`- Rule: ${v.helpUrl || ''}`);
    lines.push(`- Affected nodes: ${(v.nodes || []).length}`);
    lines.push('');
  });

  return lines.join('\n');
}

function buildHtmlReport(url, results) {
  const violations = Array.isArray(results.violations) ? results.violations : [];
  const incomplete = Array.isArray(results.incomplete) ? results.incomplete : [];
  const passes = Array.isArray(results.passes) ? results.passes : [];

  const rows = violations
    .map((v) => {
      const nodeCount = (v.nodes || []).length;
      return `<tr><td><code>${escHtml(v.id)}</code></td><td>${escHtml(v.impact || 'unknown')}</td><td><a href="${escHtml(v.helpUrl || '#')}" target="_blank" rel="noopener">${escHtml(v.help || '')}</a></td><td>${nodeCount}</td></tr>`;
    })
    .join('');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Axe Firefox Report</title>
  <style>
    body { font-family: Inter, Arial, sans-serif; margin: 24px; background: #0b0c0f; color: #f3f4f6; }
    h1, h2 { margin: 0 0 12px; }
    .meta { margin-bottom: 20px; color: #c0c4cc; }
    .stats { display: flex; gap: 12px; margin-bottom: 18px; }
    .card { background: #16181d; border: 1px solid #2a2f38; border-radius: 10px; padding: 10px 12px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #2a2f38; padding: 8px 10px; text-align: left; }
    th { background: #1c2028; }
    a { color: #7dd3fc; }
    code { color: #fde68a; }
  </style>
</head>
<body>
  <h1>Axe Firefox Accessibility Report</h1>
  <div class="meta">Target: <a href="${escHtml(url)}" target="_blank" rel="noopener">${escHtml(url)}</a></div>
  <div class="stats">
    <div class="card">Violations: <strong>${violations.length}</strong></div>
    <div class="card">Incomplete: <strong>${incomplete.length}</strong></div>
    <div class="card">Passes: <strong>${passes.length}</strong></div>
  </div>
  <h2>Violations</h2>
  ${violations.length ? `<table><thead><tr><th>Rule</th><th>Impact</th><th>Help</th><th>Nodes</th></tr></thead><tbody>${rows}</tbody></table>` : '<p>✅ No violations found.</p>'}
</body>
</html>`;
}

(async () => {
  const url = process.argv[2] || process.env.TARGET_URL || 'http://localhost:3000';
  const failOnViolations = String(process.env.AXE_FAIL_ON_VIOLATIONS || 'false').toLowerCase() === 'true';

  console.log(`Running axe-core accessibility scan against ${url} using Firefox...`);
  const browser = await firefox.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.addScriptTag({
      url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.2/axe.min.js',
    });

    const results = await page.evaluate(async () => {
      return await axe.run(document, {
        runOnly: {
          type: 'tag',
          values: ['wcag2aa'],
        },
      });
    });

    const reportsDir = ensureReportsDir();
    const jsonPath = path.join(reportsDir, 'axe-firefox-results.json');
    const htmlPath = path.join(reportsDir, 'axe-firefox-widget-report.html');
    const summaryPath = path.join(reportsDir, 'axe-firefox-summary.md');

    fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2));
    fs.writeFileSync(htmlPath, buildHtmlReport(url, results));
    fs.writeFileSync(summaryPath, buildSummaryMarkdown(url, results));

    const violationCount = Array.isArray(results.violations) ? results.violations.length : 0;
    const incompleteCount = Array.isArray(results.incomplete) ? results.incomplete.length : 0;

    console.log(`Saved results to ${jsonPath}`);
    console.log(`Saved HTML report to ${htmlPath}`);
    console.log(`Saved summary to ${summaryPath}`);
    console.log(`Violations: ${violationCount}, Incomplete: ${incompleteCount}`);

    if (failOnViolations && violationCount > 0) {
      console.error('Axe scan found accessibility violations and AXE_FAIL_ON_VIOLATIONS=true.');
      process.exitCode = 1;
    }
  } catch (err) {
    console.error('Error running axe:', err);
    process.exitCode = 2;
  } finally {
    await browser.close();
  }
})();
