#!/usr/bin/env node

/**
 * Accessibility Enhancement Utility
 * Systematically improves accessibility across HTML files
 * - Adds loading="lazy" to images
 * - Adds explicit width/height where missing
 * - Validates alt text
 * - Reports accessibility issues
 */

const fs = require("fs");
const path = require("path");

// ANSI color codes
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(msg, color = "reset") {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

class AccessibilityEnhancer {
  constructor(options = {}) {
    this.dryRun = options.dryRun || false;
    this.verbose = options.verbose || false;
    this.stats = {
      filesScanned: 0,
      filesModified: 0,
      imagesProcessed: 0,
      lazyLoadAdded: 0,
      dimensionsAdded: 0,
      altTextMissing: 0,
      altTextEmpty: 0,
      semanticIssues: 0,
    };
  }

  /**
   * Scan and enhance HTML files
   */
  async enhanceFiles(patterns) {
    log("\n🔍 Scanning HTML files for accessibility improvements...\n", "cyan");

    const files = this.findHTMLFiles(patterns);

    for (const filePath of files) {
      await this.processFile(filePath);
    }

    this.printReport();
  }

  /**
   * Find all HTML files matching patterns
   */
  findHTMLFiles(patterns) {
    const files = [];

    for (const pattern of patterns) {
      // Handle glob patterns like 'src/site/**/*.html'
      const parts = pattern.split("**");
      if (parts.length === 2) {
        const baseDir = path.resolve(parts[0].replace(/\/$/, ""));
        if (fs.existsSync(baseDir)) {
          this.findFilesRecursive(baseDir, "*.html", files);
        }
      } else {
        // Handle simple paths
        const resolved = path.resolve(pattern);
        if (fs.existsSync(resolved)) {
          if (fs.statSync(resolved).isDirectory()) {
            this.findFilesRecursive(resolved, "*.html", files);
          } else if (resolved.endsWith(".html")) {
            files.push(resolved);
          }
        }
      }
    }

    return files;
  }

  findFilesRecursive(dir, glob, results) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      // Skip certain directories
      if (entry.isDirectory()) {
        if (
          ["node_modules", ".git", "dist", "test-results"].includes(entry.name)
        ) {
          continue;
        }
        this.findFilesRecursive(fullPath, glob, results);
      } else if (entry.isFile() && entry.name.endsWith(".html")) {
        results.push(fullPath);
      }
    }
  }

  /**
   * Process a single HTML file
   */
  async processFile(filePath) {
    this.stats.filesScanned++;

    let content = fs.readFileSync(filePath, "utf-8");
    const original = content;
    let modified = false;

    // Find all img tags
    const imgRegex = /<img\s+([^>]+)>/gi;
    const matches = [...content.matchAll(imgRegex)];

    if (matches.length === 0) {
      if (this.verbose) {
        log(
          `  ⏭️  ${path.relative(process.cwd(), filePath)} - No images`,
          "reset"
        );
      }
      return;
    }

    log(`\n📄 ${path.relative(process.cwd(), filePath)}`, "bright");
    log(`   Found ${matches.length} image(s)`, "blue");

    for (const match of matches) {
      this.stats.imagesProcessed++;
      const fullTag = match[0];
      const attrs = match[1];

      let newTag = fullTag;
      let issues = [];
      let improvements = [];

      // Check for alt attribute
      if (!/alt\s*=/.test(attrs)) {
        issues.push("Missing alt attribute");
        this.stats.altTextMissing++;
        // Add empty alt for decorative images that are ARIA hidden
        if (/aria-hidden\s*=\s*["']true["']/.test(attrs)) {
          newTag = newTag.replace(">", ' alt="">');
          improvements.push('Added alt="" for aria-hidden image');
        } else {
          newTag = newTag.replace(">", ' alt="NEEDS_DESCRIPTION">');
          improvements.push("Added placeholder alt (needs manual review)");
        }
      } else if (
        /alt\s*=\s*["']["']/.test(attrs) &&
        !/aria-hidden/.test(attrs)
      ) {
        issues.push("Empty alt text without aria-hidden");
        this.stats.altTextEmpty++;
      }

      // Check for loading attribute
      if (!/loading\s*=/.test(attrs)) {
        // Don't add lazy loading to images with fetchpriority="high" or loading="eager"
        if (
          !/fetchpriority\s*=\s*["']high["']/.test(attrs) &&
          !/loading\s*=\s*["']eager["']/.test(attrs)
        ) {
          newTag = newTag.replace(">", ' loading="lazy">');
          improvements.push('Added loading="lazy"');
          this.stats.lazyLoadAdded++;
        }
      }

      // Check for width/height attributes (basic check, not measuring actual images)
      if (!/width\s*=/.test(attrs) || !/height\s*=/.test(attrs)) {
        // Only flag as issue, don't auto-add dimensions (need actual image measurements)
        issues.push("Missing width/height (prevents layout shift)");
      }

      // Report findings
      if (issues.length > 0) {
        log(`   ⚠️  Image issues:`, "yellow");
        issues.forEach((issue) => log(`      - ${issue}`, "yellow"));
      }

      if (improvements.length > 0) {
        log(`   ✅ Improvements:`, "green");
        improvements.forEach((imp) => log(`      - ${imp}`, "green"));
        modified = true;
      }

      // Apply changes
      content = content.replace(fullTag, newTag);
    }

    // Check for semantic issues
    const semanticIssues = this.checkSemanticStructure(content);
    if (semanticIssues.length > 0) {
      log(`   🔍 Semantic recommendations:`, "cyan");
      semanticIssues.forEach((issue) => {
        log(`      - ${issue}`, "cyan");
        this.stats.semanticIssues++;
      });
    }

    // Write changes
    if (modified && !this.dryRun) {
      fs.writeFileSync(filePath, content, "utf-8");
      this.stats.filesModified++;
      log(`   💾 File updated`, "green");
    } else if (modified && this.dryRun) {
      log(`   🔍 Changes detected (dry-run, not saved)`, "yellow");
    }
  }

  /**
   * Check for semantic HTML structure issues
   */
  checkSemanticStructure(content) {
    const issues = [];

    // Check for generic divs that could be semantic elements
    const lightboxDivCount = (
      content.match(/<div[^>]*class="[^"]*lightbox[^"]*"/gi) || []
    ).length;
    if (
      lightboxDivCount > 0 &&
      !/<[^>]* role\s*=\s*["']dialog["']/i.test(content)
    ) {
      issues.push('Lightbox containers should have role="dialog"');
    }

    // Check for navigation without nav tag
    const navDivs = (
      content.match(/<div[^>]*class="[^"]*(nav|menu)[^"]*"/gi) || []
    ).length;
    const navTags = (content.match(/<nav\b/gi) || []).length;
    if (navDivs > navTags) {
      issues.push("Consider using <nav> for navigation containers");
    }

    // Check for headings hierarchy
    const h1Count = (content.match(/<h1\b/gi) || []).length;
    if (h1Count > 1) {
      issues.push("Multiple <h1> tags found (should have only one per page)");
    } else if (h1Count === 0 && !content.includes("<!-- widget -->")) {
      issues.push("No <h1> heading found (important for accessibility)");
    }

    // Check for form labels
    const inputs = (
      content.match(/<input[^>]*type\s*=\s*["'](text|email|tel|number)/gi) || []
    ).length;
    const labels = (content.match(/<label\b/gi) || []).length;
    if (inputs > labels && inputs > 0) {
      issues.push("Some form inputs may be missing associated labels");
    }

    // Check for ARIA attributes on interactive elements
    const buttons = content.match(/<button[^>]+>/gi) || [];
    buttons.forEach((btn) => {
      if (
        /aria-label\s*=|title\s*=/i.test(btn) === false &&
        btn.includes("×")
      ) {
        issues.push("Close buttons (×) should have aria-label");
      }
    });

    return issues;
  }

  /**
   * Print summary report
   */
  printReport() {
    log("\n" + "=".repeat(60), "bright");
    log("📊 Accessibility Enhancement Report", "bright");
    log("=".repeat(60) + "\n", "bright");

    log(`Files scanned:           ${this.stats.filesScanned}`, "blue");
    log(`Files modified:          ${this.stats.filesModified}`, "green");
    log(`Images processed:        ${this.stats.imagesProcessed}`, "blue");
    log("");
    log("Improvements made:", "bright");
    log(`  ✅ lazy loading added:  ${this.stats.lazyLoadAdded}`, "green");
    log("");
    log("Issues found:", "bright");
    log(`  ⚠️  Missing alt text:   ${this.stats.altTextMissing}`, "yellow");
    log(`  ⚠️  Empty alt text:     ${this.stats.altTextEmpty}`, "yellow");
    log(`  🔍 Semantic issues:     ${this.stats.semanticIssues}`, "cyan");

    if (this.dryRun) {
      log("\n🔍 DRY RUN - No files were modified", "yellow");
    }

    log("\n" + "=".repeat(60) + "\n", "bright");

    // Recommendations
    if (this.stats.altTextMissing > 0 || this.stats.altTextEmpty > 0) {
      log("📋 Next Steps:", "bright");
      log("  1. Review images with missing or empty alt text", "cyan");
      log("  2. Add descriptive alt text for meaningful images", "cyan");
      log(
        '  3. Use alt="" for decorative images with aria-hidden="true"',
        "cyan"
      );
      log("  4. Run axe-core tests: npm run test:a11y", "cyan");
      log("");
    }
  }
}

// CLI
const args = process.argv.slice(2);
const options = {
  dryRun: args.includes("--dry-run") || args.includes("-d"),
  verbose: args.includes("--verbose") || args.includes("-v"),
};

const patterns = args.filter((arg) => !arg.startsWith("-"));
const defaultPatterns = [
  "src/site/**/*.html",
  "src/widgets/**/versions/*.html",
];

const enhancer = new AccessibilityEnhancer(options);
enhancer
  .enhanceFiles(patterns.length > 0 ? patterns : defaultPatterns)
  .catch((err) => {
    console.error("Error:", err);
    process.exit(1);
  });
