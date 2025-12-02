#!/usr/bin/env node

/**
 * JavaScript Modernization Script
 *
 * Automatically modernizes JavaScript in widget files:
 * - Replaces var with const/let
 * - Updates == to ===, != to !==
 * - Identifies opportunities for arrow functions
 * - Reports on modernization progress
 *
 * Usage:
 *   node scripts/utils/modernize-javascript.js [options]
 *
 * Options:
 *   --dry-run    Show changes without modifying files
 *   --widget     Target specific widget (e.g., --widget=event-portfolio)
 *   --verbose    Show detailed analysis
 */

const fs = require("fs");
const path = require("path");

// Configuration
const WIDGETS_DIR = path.join(__dirname, "../../src/widgets");
const SKIP_DIRS = ["_archived", "_shared"];
const TARGET_EXTENSIONS = [".html", ".js"];

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const verbose = args.includes("--verbose");
const targetWidget = args
  .find((arg) => arg.startsWith("--widget="))
  ?.split("=")[1];

// Statistics
const stats = {
  filesProcessed: 0,
  varReplacements: 0,
  equalityReplacements: 0,
  warnings: [],
};

/**
 * Analyze variable usage context
 * @param {string} code - Code snippet
 * @param {number} position - Position of 'var'
 * @returns {'const'|'let'} - Recommended declaration
 */
function analyzeVariableUsage(code, position) {
  // Get the line containing the var declaration
  const lineStart = code.lastIndexOf("\n", position) + 1;
  const lineEnd = code.indexOf("\n", position);
  const line = code.substring(lineStart, lineEnd);

  // Extract variable name
  const varMatch = line.match(/\bvar\s+(\w+)/);
  if (!varMatch) return "let";

  const varName = varMatch[1];

  // Check if variable is reassigned after declaration
  const afterDeclaration = code.substring(position);

  // Look for assignments (but not in declaration)
  const assignmentPattern = new RegExp(`\\b${varName}\\s*=(?!=)`, "g");
  const assignments = afterDeclaration.match(assignmentPattern) || [];

  // Look for increment/decrement operators
  const mutationPattern = new RegExp(
    `\\b${varName}\\s*(?:\\+\\+|--|\\+=|-=|\\*=|\\/=)`,
    "g"
  );
  const mutations = afterDeclaration.match(mutationPattern) || [];

  // If reassigned or mutated, use let; otherwise const
  return assignments.length > 1 || mutations.length > 0 ? "let" : "const";
}

/**
 * Modernize JavaScript code
 * @param {string} code - Original code
 * @param {string} filePath - File path for warnings
 * @returns {Object} - { code, changes }
 */
function modernizeCode(code, filePath) {
  let modernized = code;
  const changes = {
    var: 0,
    equality: 0,
  };

  // Replace var with const/let
  // Match: var varName = ...
  const varPattern = /\bvar\s+(\w+)\s*=/g;
  let match;
  const varReplacements = [];

  while ((match = varPattern.exec(code)) !== null) {
    const position = match.index;
    const varName = match[1];
    const replacement = analyzeVariableUsage(code, position);

    varReplacements.push({
      original: match[0],
      replacement: match[0].replace("var", replacement),
      position,
      varName,
      type: replacement,
    });
  }

  // Apply var replacements in reverse order to maintain positions
  varReplacements.reverse().forEach(({ original, replacement }) => {
    const index = modernized.lastIndexOf(original);
    if (index !== -1) {
      modernized =
        modernized.substring(0, index) +
        replacement +
        modernized.substring(index + original.length);
      changes.var++;
    }
  });

  // Replace loose equality with strict equality
  // Be careful not to replace === or !==

  // Replace == with ===
  modernized = modernized.replace(/([^=!])={2}(?!=)/g, "$1===");
  const eqMatches = (code.match(/([^=!])={2}(?!=)/g) || []).length;
  changes.equality += eqMatches;

  // Replace != with !==
  modernized = modernized.replace(/!={1}(?!=)/g, "!==");
  const neqMatches = (code.match(/!={1}(?!=)/g) || []).length;
  changes.equality += neqMatches;

  // Report warnings for potential issues
  if (code.includes("eval(")) {
    stats.warnings.push({
      file: filePath,
      issue: "Uses eval() - security risk",
    });
  }

  if (code.includes("document.write")) {
    stats.warnings.push({
      file: filePath,
      issue: "Uses document.write() - consider alternatives",
    });
  }

  // Check for global variable pollution
  const globalVarPattern = /^var\s+\w+\s*=/gm;
  if (code.match(globalVarPattern)) {
    const count = (code.match(globalVarPattern) || []).length;
    if (count > 5) {
      stats.warnings.push({
        file: filePath,
        issue: `${count} potential global variables - consider IIFE wrapping`,
      });
    }
  }

  return { code: modernized, changes };
}

/**
 * Process a single file
 * @param {string} filePath - Path to file
 */
function processFile(filePath) {
  const relativePath = path.relative(WIDGETS_DIR, filePath);

  try {
    const content = fs.readFileSync(filePath, "utf8");
    const { code: modernized, changes } = modernizeCode(content, relativePath);

    const hasChanges = changes.var > 0 || changes.equality > 0;

    if (hasChanges) {
      console.log(`\n📝 ${relativePath}`);

      if (changes.var > 0) {
        console.log(`   - Replaced ${changes.var} var declaration(s)`);
        stats.varReplacements += changes.var;
      }

      if (changes.equality > 0) {
        console.log(
          `   - Fixed ${changes.equality} loose equality operator(s)`
        );
        stats.equalityReplacements += changes.equality;
      }

      if (!dryRun) {
        fs.writeFileSync(filePath, modernized, "utf8");
        console.log(`   ✅ Updated`);
      } else {
        console.log(`   🔍 Dry run - no changes made`);
      }
    } else if (verbose) {
      console.log(`✓ ${relativePath} - already modernized`);
    }

    stats.filesProcessed++;
  } catch (error) {
    console.error(`❌ Error processing ${relativePath}:`, error.message);
  }
}

/**
 * Process directory recursively
 * @param {string} dirPath - Directory path
 */
function processDirectory(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    // Skip archived and shared directories
    if (entry.isDirectory()) {
      if (SKIP_DIRS.includes(entry.name)) {
        if (verbose) {
          console.log(`⏭️  Skipping ${entry.name}/`);
        }
        continue;
      }
      processDirectory(fullPath);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (TARGET_EXTENSIONS.includes(ext)) {
        processFile(fullPath);
      }
    }
  }
}

/**
 * Main execution
 */
function main() {
  console.log("\n🚀 JavaScript Modernization Tool\n");
  console.log("Configuration:");
  console.log(`  - Mode: ${dryRun ? "DRY RUN" : "WRITE"}`);
  console.log(`  - Target: ${targetWidget || "all widgets"}`);
  console.log(`  - Verbose: ${verbose}`);
  console.log("");

  const startTime = Date.now();

  if (targetWidget) {
    const widgetPath = path.join(WIDGETS_DIR, targetWidget);
    if (!fs.existsSync(widgetPath)) {
      console.error(`❌ Widget not found: ${targetWidget}`);
      process.exit(1);
    }
    processDirectory(widgetPath);
  } else {
    processDirectory(WIDGETS_DIR);
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  // Print summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 Summary");
  console.log("=".repeat(60));
  console.log(`Files processed:        ${stats.filesProcessed}`);
  console.log(`Var replacements:       ${stats.varReplacements}`);
  console.log(`Equality fixes:         ${stats.equalityReplacements}`);
  console.log(`Processing time:        ${duration}s`);

  if (stats.warnings.length > 0) {
    console.log("\n⚠️  Warnings:");
    stats.warnings.forEach(({ file, issue }) => {
      console.log(`   - ${file}: ${issue}`);
    });
  }

  if (dryRun) {
    console.log("\n🔍 This was a dry run. No files were modified.");
    console.log("Run without --dry-run to apply changes.");
  }

  console.log("");
}

// Run the script
main();
