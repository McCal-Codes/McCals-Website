#!/usr/bin/env node
/**
 * Build script for Interactive Thesis (local dev preview)
 * - Bundles React JSX with esbuild (minified, IIFE)
 * - Builds Tailwind CSS via PostCSS programmatically
 * - Writes out /thesis/interactive/index.html + app.js + styles.css
 */
const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');
const postcss = require('postcss');
const tailwindcss = require('tailwindcss');
const autoprefixer = require('autoprefixer');
const chokidar = require('chokidar');

const projectRoot = path.resolve(__dirname, '..', '..');
// Output inside repo root at ./thesis/interactive (served by dev-server spa fallback)
const outDir = path.join(projectRoot, 'thesis', 'interactive');
// Correct in-repo entry paths
const entryJs = path.join(projectRoot, 'src', 'pages', 'thesis', 'interactive.jsx');
const entryCss = path.join(projectRoot, 'src', 'pages', 'thesis', 'styles.css');
const tailwindConfig = path.join(projectRoot, 'tailwind.config.js');

const isWatch = process.argv.includes('--watch');

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

async function buildJS() {
  await esbuild.build({
    entryPoints: [entryJs],
    outfile: path.join(outDir, 'app.js'),
    bundle: true,
    minify: true,
    sourcemap: true,
    target: ['es2018'],
    format: 'iife',
    platform: 'browser',
    jsx: 'automatic',
    define: { 'process.env.NODE_ENV': '"production"' },
  });
}

async function buildCSS() {
  const cssIn = fs.readFileSync(entryCss, 'utf8');
  const result = await postcss([
    tailwindcss({ config: tailwindConfig }),
    autoprefixer()
  ]).process(cssIn, {
    from: entryCss,
    to: path.join(outDir, 'styles.css')
  });
  fs.writeFileSync(path.join(outDir, 'styles.css'), result.css, 'utf8');
}

function writeHTML() {
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Interactive Thesis — Preview</title>
  <meta name="description" content="Interactive thesis prototype with scroll-reveal imagery and an accessible story drawer with audio transcript." />
  <meta property="og:title" content="Interactive Thesis — Preview" />
  <meta property="og:description" content="Scroll-reveal imagery and an accessible story drawer with audio transcript." />
  <meta property="og:image" content="https://raw.githubusercontent.com/McCal-Codes/McCals-Website/main/src/images/Portfolios/Journalism/Politics/Obama%20Speaks%20at%20Pitt/101024_Obama%20Speaks%20at%20Pittsburgh_CAL3038.jpg" />
  <link rel="preload" href="app.js" as="script" />
  <link rel="stylesheet" href="styles.css" />
  <style>body{margin:0}</style>
</head>
<body>
  <div id="app"></div>
  <script src="app.js" defer></script>
</body>
</html>`;
  fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf8');
  // Write no-extension file to support /thesis/interactive route on our dev server
  fs.writeFileSync(path.join(outDir, 'interactive'), html, 'utf8');
}

async function buildAll() {
  ensureDir(outDir);
  await Promise.all([buildJS(), buildCSS()]);
  writeHTML();
  console.log('✅ Built thesis preview at /thesis/interactive - build-thesis-interactive.js:86');
}

if (!isWatch) {
  buildAll().catch((e) => { console.error(e); process.exit(1); });
} else {
  (async () => {
    await buildAll();
    console.log('👀 Watching for changes... - build-thesis-interactive.js:94');
    const watcher = chokidar.watch([
      entryJs,
      path.join(projectRoot, 'src', 'pages', 'thesis', '**', '*.jsx'),
      entryCss,
      tailwindConfig
    ], { ignoreInitial: true });
    watcher.on('all', async () => {
      try { await buildAll(); } catch (e) { console.error(e); }
    });
  })();
}
