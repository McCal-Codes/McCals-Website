const { test, expect } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

/**
 * Accessibility Testing Suite with axe-core
 * Tests main site and key widgets for WCAG 2.1 AA compliance
 * Generates reports in reports/ directory
 */

// Helper to inject and run axe-core
async function runAxe(page) {
  // Inject axe-core directly into the page
  await page.addScriptTag({
    url: "https://unpkg.com/axe-core@4.10.2/axe.min.js",
  });

  // Wait for axe to be available
  await page.waitForFunction(() => typeof window.axe !== "undefined");

  // Run axe-core with WCAG 2.1 AA standards
  const results = await page.evaluate(async () => {
    const axeResults = await window.axe.run({
      runOnly: {
        type: "tag",
        values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"],
      },
    });
    return axeResults;
  });

  return results;
}

// Helper to generate HTML report
function generateHTMLReport(results, testName) {
  const violations = results.violations || [];
  const passes = results.passes || [];
  const incomplete = results.incomplete || [];

  const violationRows = violations
    .map((v) => {
      const nodes = v.nodes
        .map(
          (n) => `
      <li>
        <strong>Element:</strong> <code>${escapeHtml(n.html)}</code><br>
        <strong>Impact:</strong> <span class="impact-${n.impact}">${
            n.impact
          }</span><br>
        <strong>Message:</strong> ${escapeHtml(
          n.failureSummary || n.message || "No message"
        )}<br>
        ${
          n.target
            ? `<strong>Selector:</strong> <code>${n.target.join(", ")}</code>`
            : ""
        }
      </li>
    `
        )
        .join("");

      return `
      <tr class="violation">
        <td class="impact-${v.impact}">${v.impact}</td>
        <td>
          <strong>${escapeHtml(v.id)}</strong><br>
          <small>${escapeHtml(v.description)}</small><br>
          <a href="${v.helpUrl}" target="_blank" rel="noopener">Learn more</a>
          <ul class="nodes">${nodes}</ul>
        </td>
        <td>${v.nodes.length}</td>
      </tr>
    `;
    })
    .join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Accessibility Report: ${escapeHtml(testName)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: system-ui, -apple-system, sans-serif; 
      line-height: 1.6; 
      padding: 2rem; 
      background: #fafafa;
      color: #1a1a1a;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    h1 { margin-bottom: 0.5rem; color: #0f172a; }
    .meta { color: #64748b; margin-bottom: 2rem; }
    .summary { 
      display: grid; 
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
      gap: 1rem; 
      margin-bottom: 2rem; 
    }
    .summary-card { 
      background: white; 
      padding: 1.5rem; 
      border-radius: 8px; 
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .summary-card h3 { font-size: 0.875rem; color: #64748b; margin-bottom: 0.5rem; }
    .summary-card .number { font-size: 2rem; font-weight: bold; }
    .summary-card.violations .number { color: #ef4444; }
    .summary-card.passes .number { color: #10b981; }
    .summary-card.incomplete .number { color: #f59e0b; }
    
    table { 
      width: 100%; 
      background: white; 
      border-radius: 8px; 
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
    }
    th, td { 
      padding: 1rem; 
      text-align: left; 
      border-bottom: 1px solid #e5e7eb; 
    }
    th { 
      background: #f8fafc; 
      font-weight: 600; 
      color: #0f172a;
    }
    tr:last-child td { border-bottom: none; }
    
    .impact-critical { color: #dc2626; font-weight: bold; }
    .impact-serious { color: #ea580c; font-weight: 600; }
    .impact-moderate { color: #ca8a04; }
    .impact-minor { color: #0891b2; }
    
    .nodes { 
      margin-top: 1rem; 
      padding-left: 1.5rem; 
      list-style: disc;
    }
    .nodes li { 
      margin-bottom: 1rem; 
      padding: 0.75rem; 
      background: #f8fafc; 
      border-radius: 4px;
    }
    code { 
      background: #1e293b; 
      color: #f1f5f9; 
      padding: 0.125rem 0.375rem; 
      border-radius: 3px; 
      font-size: 0.875rem;
      word-break: break-all;
      display: inline-block;
      max-width: 100%;
    }
    a { color: #0ea5e9; text-decoration: none; }
    a:hover { text-decoration: underline; }
    
    .no-violations { 
      text-align: center; 
      padding: 3rem; 
      color: #10b981; 
      font-size: 1.25rem; 
      background: white; 
      border-radius: 8px;
    }
    .no-violations svg { 
      width: 64px; 
      height: 64px; 
      margin-bottom: 1rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Accessibility Report</h1>
    <div class="meta">
      <strong>Test:</strong> ${escapeHtml(testName)}<br>
      <strong>Timestamp:</strong> ${new Date().toISOString()}<br>
      <strong>Standard:</strong> WCAG 2.1 Level AA
    </div>

    <div class="summary">
      <div class="summary-card violations">
        <h3>Violations</h3>
        <div class="number">${violations.length}</div>
      </div>
      <div class="summary-card passes">
        <h3>Passes</h3>
        <div class="number">${passes.length}</div>
      </div>
      <div class="summary-card incomplete">
        <h3>Incomplete</h3>
        <div class="number">${incomplete.length}</div>
      </div>
      <div class="summary-card">
        <h3>Total Checks</h3>
        <div class="number">${
          violations.length + passes.length + incomplete.length
        }</div>
      </div>
    </div>

    ${
      violations.length === 0
        ? `
      <div class="no-violations">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <div>✅ No accessibility violations found!</div>
      </div>
    `
        : `
      <h2>Violations (${violations.length})</h2>
      <table>
        <thead>
          <tr>
            <th>Impact</th>
            <th>Issue</th>
            <th>Instances</th>
          </tr>
        </thead>
        <tbody>
          ${violationRows}
        </tbody>
      </table>
    `
    }

    ${
      incomplete.length > 0
        ? `
      <h2>Incomplete Checks (${incomplete.length})</h2>
      <p style="color: #64748b; margin-bottom: 1rem;">
        These checks require manual verification.
      </p>
      <table>
        <thead>
          <tr>
            <th>Check</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          ${incomplete
            .map(
              (i) => `
            <tr>
              <td><strong>${escapeHtml(i.id)}</strong></td>
              <td>${escapeHtml(i.description)}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `
        : ""
    }
  </div>
</body>
</html>`;

  return html;
}

function escapeHtml(text) {
  if (!text) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Main site test
test("Main site accessibility", async ({ page }) => {
  // Start dev server on port 3000
  await page.goto("http://localhost:3000");

  // Wait for main content to load
  await page.waitForSelector("#page", { timeout: 10000 });

  // Run axe
  const results = await runAxe(page);

  // Save JSON results
  const reportsDir = path.join(__dirname, "../../reports");
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(reportsDir, "axe-main-site-results.json"),
    JSON.stringify(results, null, 2)
  );

  // Generate HTML report
  const htmlReport = generateHTMLReport(results, "Main Site (index.html)");
  fs.writeFileSync(
    path.join(reportsDir, "axe-main-site-report.html"),
    htmlReport
  );

  // Create summary markdown
  const summary = generateSummary(results, "Main Site");
  fs.writeFileSync(path.join(reportsDir, "axe-main-site-summary.md"), summary);

  console.log(`\n✅ Main site accessibility report generated`);
  console.log(`   Violations: ${results.violations.length}`);
  console.log(`   Passes: ${results.passes.length}`);
  console.log(`   Report: reports/axe-main-site-report.html\n`);

  // Assert no critical violations
  const criticalViolations = results.violations.filter(
    (v) => v.impact === "critical"
  );
  expect(criticalViolations).toHaveLength(0);
});

// Concert widget test
test("Concert portfolio widget accessibility", async ({ page }) => {
  await page.goto("http://localhost:3000");
  await page.waitForSelector("#page");

  // Inject concert widget
  await page.evaluate(() => {
    const widgetDiv = document.createElement("div");
    widgetDiv.id = "concert-widget-test";
    document.querySelector("#page").appendChild(widgetDiv);
  });

  // Load widget HTML (simplified for testing)
  const widgetPath = path.join(
    __dirname,
    "../../src/widgets/concert-portfolio/versions/v4.7.1-api-optional.html"
  );
  if (fs.existsSync(widgetPath)) {
    const widgetHTML = fs.readFileSync(widgetPath, "utf-8");
    await page.evaluate((html) => {
      document.getElementById("concert-widget-test").innerHTML = html;
    }, widgetHTML);

    // Wait for widget to initialize
    await page.waitForTimeout(2000);

    const results = await runAxe(page);

    const reportsDir = path.join(__dirname, "../../reports");
    fs.writeFileSync(
      path.join(reportsDir, "axe-concert-widget-results.json"),
      JSON.stringify(results, null, 2)
    );

    const htmlReport = generateHTMLReport(
      results,
      "Concert Portfolio Widget v4.7.1"
    );
    fs.writeFileSync(
      path.join(reportsDir, "axe-concert-widget-report.html"),
      htmlReport
    );

    console.log(`\n✅ Concert widget accessibility report generated`);
    console.log(`   Violations: ${results.violations.length}`);
    console.log(`   Report: reports/axe-concert-widget-report.html\n`);
  }
});

// Photojournalism widget test
test("Photojournalism widget accessibility", async ({ page }) => {
  await page.goto("http://localhost:3000");
  await page.waitForSelector("#page");

  await page.evaluate(() => {
    const widgetDiv = document.createElement("div");
    widgetDiv.id = "journalism-widget-test";
    document.querySelector("#page").appendChild(widgetDiv);
  });

  const widgetPath = path.join(
    __dirname,
    "../../src/widgets/photojournalism-portfolio/versions/v5.2.0-performance-optimized.html"
  );
  if (fs.existsSync(widgetPath)) {
    const widgetHTML = fs.readFileSync(widgetPath, "utf-8");
    await page.evaluate((html) => {
      document.getElementById("journalism-widget-test").innerHTML = html;
    }, widgetHTML);

    await page.waitForTimeout(2000);

    const results = await runAxe(page);

    const reportsDir = path.join(__dirname, "../../reports");
    fs.writeFileSync(
      path.join(reportsDir, "axe-journalism-widget-results.json"),
      JSON.stringify(results, null, 2)
    );

    const htmlReport = generateHTMLReport(
      results,
      "Photojournalism Portfolio Widget v5.2.0"
    );
    fs.writeFileSync(
      path.join(reportsDir, "axe-journalism-widget-report.html"),
      htmlReport
    );

    console.log(`\n✅ Photojournalism widget accessibility report generated`);
    console.log(`   Violations: ${results.violations.length}`);
    console.log(`   Report: reports/axe-journalism-widget-report.html\n`);
  }
});

// Generate markdown summary
function generateSummary(results, testName) {
  const violations = results.violations || [];
  const passes = results.passes || [];
  const incomplete = results.incomplete || [];

  let markdown = `# Accessibility Report: ${testName}\n\n`;
  markdown += `**Timestamp:** ${new Date().toISOString()}\n`;
  markdown += `**Standard:** WCAG 2.1 Level AA\n\n`;
  markdown += `## Summary\n\n`;
  markdown += `- ❌ **Violations:** ${violations.length}\n`;
  markdown += `- ✅ **Passes:** ${passes.length}\n`;
  markdown += `- ⚠️ **Incomplete:** ${incomplete.length}\n`;
  markdown += `- 📊 **Total Checks:** ${
    violations.length + passes.length + incomplete.length
  }\n\n`;

  if (violations.length > 0) {
    markdown += `## Violations\n\n`;
    violations.forEach((v, i) => {
      markdown += `### ${i + 1}. ${v.id} (${v.impact})\n\n`;
      markdown += `**Description:** ${v.description}\n\n`;
      markdown += `**Help:** ${v.helpUrl}\n\n`;
      markdown += `**Instances:** ${v.nodes.length}\n\n`;
      v.nodes.slice(0, 3).forEach((n, j) => {
        markdown += `**Element ${j + 1}:**\n`;
        markdown += `\`\`\`html\n${n.html}\n\`\`\`\n\n`;
        if (n.failureSummary) {
          markdown += `**Issue:** ${n.failureSummary}\n\n`;
        }
      });
      markdown += `---\n\n`;
    });
  }

  if (incomplete.length > 0) {
    markdown += `## Incomplete Checks (Manual Verification Required)\n\n`;
    incomplete.forEach((i) => {
      markdown += `- **${i.id}:** ${i.description}\n`;
    });
    markdown += `\n`;
  }

  return markdown;
}
