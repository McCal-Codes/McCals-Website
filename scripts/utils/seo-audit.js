#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// SEO Audit Tool for Widgets
// Scans HTML widgets and generates actionable SEO improvement report

async function scanWidget(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];
  const recommendations = [];

  // Check for structured data (JSON-LD)
  const hasStructuredData = /<script type="application\/ld\+json">/i.test(content);
  if (!hasStructuredData) {
    issues.push('Missing structured data (Schema.org JSON-LD)');
    recommendations.push('Add ImageGallery or similar schema to <head>');
  }

  // Check for meta description
  const hasMetaDesc = /<meta\s+name=["']description["']/i.test(content);
  if (!hasMetaDesc) {
    issues.push('Missing meta description');
    recommendations.push('Add <meta name="description" content="..."> in <head>');
  }

  // Check for Open Graph tags
  const hasOG = /<meta\s+property=["']og:/i.test(content);
  if (!hasOG) {
    issues.push('Missing Open Graph tags');
    recommendations.push('Add og:title, og:description, og:image for social sharing');
  }

  // Check img tags for alt text
  const imgMatches = content.match(/<img[^>]*>/gi) || [];
  let missingAlt = 0;
  for (const img of imgMatches) {
    if (!/alt=["'][^"']*["']/i.test(img)) {
      missingAlt++;
    }
  }
  if (missingAlt > 0) {
    issues.push(`${missingAlt} images missing alt text`);
    recommendations.push('Add descriptive alt="" attributes to all <img> tags');
  }

  // Check for lazy loading
  const hasLazyLoading = /loading=["']lazy["']/i.test(content);
  if (!hasLazyLoading && imgMatches.length > 5) {
    issues.push('Images not using lazy loading');
    recommendations.push('Add loading="lazy" to <img> tags (except above-fold)');
  }

  // Check for responsive images (srcset/picture)
  const hasSrcset = /srcset=/i.test(content);
  const hasPicture = /<picture>/i.test(content);
  if (!hasSrcset && !hasPicture && imgMatches.length > 0) {
    issues.push('No responsive image techniques (srcset/picture)');
    recommendations.push('Use <picture> or srcset for WebP/AVIF with fallbacks');
  }

  // Check for semantic HTML
  const hasMain = /<main/i.test(content);
  const hasArticle = /<article/i.test(content);
  const hasSection = /<section/i.test(content);
  if (!hasMain && !hasArticle && !hasSection) {
    issues.push('Missing semantic HTML5 elements (main/article/section)');
    recommendations.push('Wrap content in <main>, <article>, or <section> tags');
  }

  // Check for ARIA labels
  const hasARIA = /aria-/i.test(content);
  const hasButtons = /<button/i.test(content) || /role=["']button["']/i.test(content);
  if (hasButtons && !hasARIA) {
    issues.push('Interactive elements missing ARIA labels');
    recommendations.push('Add aria-label or aria-labelledby to buttons/controls');
  }

  // Check for keyboard navigation support
  const hasTabIndex = /tabindex=/i.test(content);
  const hasKeyHandlers = /onkeydown|onkeyup|onkeypress/i.test(content);
  if ((hasButtons || /<a[^>]*>/i.test(content)) && !hasTabIndex && !hasKeyHandlers) {
    issues.push('Possible keyboard navigation issues');
    recommendations.push('Ensure interactive elements are keyboard accessible (Tab, Enter, Escape)');
  }

  // Performance checks
  const styleCount = (content.match(/<style>/gi) || []).length;
  if (styleCount > 2) {
    issues.push(`Multiple inline <style> blocks (${styleCount}) - consider consolidation`);
    recommendations.push('Merge <style> blocks or externalize large CSS for caching');
  }

  const scriptCount = (content.match(/<script>/gi) || []).length;
  if (scriptCount > 3) {
    issues.push(`Multiple inline <script> blocks (${scriptCount})`);
    recommendations.push('Consider async/defer attributes or module bundling');
  }

  return { issues, recommendations, stats: { images: imgMatches.length, scripts: scriptCount, styles: styleCount } };
}

async function main() {
  const widgetsDir = path.join(process.cwd(), 'src', 'widgets');
  if (!fs.existsSync(widgetsDir)) {
    console.error('Widgets directory not found:', widgetsDir);
    process.exit(1);
  }

  const results = [];
  const scan = (dir) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory() && !entry.name.startsWith('_')) {
        scan(fullPath);
      } else if (entry.isFile() && /\.html$/i.test(entry.name)) {
        const rel = path.relative(widgetsDir, fullPath);
        const audit = scanWidget(fullPath);
        results.push({ path: rel, ...audit });
      }
    }
  };
  scan(widgetsDir);

  console.log('=== SEO & Performance Audit Report ===\n');
  let totalIssues = 0;
  for (const res of results) {
    if (!res || !res.issues) continue;
    totalIssues += res.issues.length;
    if (res.issues.length > 0) {
      console.log(`📄 ${res.path}`);
      console.log(`   Images: ${res.stats.images}, Scripts: ${res.stats.scripts}, Styles: ${res.stats.styles}`);
      console.log('   Issues:');
      res.issues.forEach(i => console.log(`     ⚠️  ${i}`));
      console.log('   Recommendations:');
      res.recommendations.forEach(r => console.log(`     💡 ${r}`));
      console.log();
    }
  }

  if (totalIssues === 0) {
    console.log('✅ No SEO/performance issues found!\n');
  } else {
    console.log(`\n📊 Summary: ${totalIssues} issues found across ${results.filter(r => r.issues.length > 0).length} widgets.\n`);
    console.log('Next steps:');
    console.log('1. Add structured data (Schema.org JSON-LD) to all widgets');
    console.log('2. Ensure all images have descriptive alt text');
    console.log('3. Add meta descriptions and Open Graph tags');
    console.log('4. Implement lazy loading for below-fold images');
    console.log('5. Add responsive image support (WebP/AVIF with srcset)');
    console.log('6. Improve accessibility with ARIA labels and keyboard navigation\n');
  }

  process.exit(totalIssues > 0 ? 1 : 0);
}

main().catch(err => {
  console.error(err);
  process.exit(2);
});
