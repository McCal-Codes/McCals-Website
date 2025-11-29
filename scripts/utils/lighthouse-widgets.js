#!/usr/bin/env node
/**
 * Lighthouse runner per widget with simple thresholds
 */

const fs = require('fs');
const path = require('path');
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

const ROOT = path.resolve(__dirname, '../..');
const OUTDIR = path.join(ROOT, 'test-results', 'lighthouse');

function ensureDir(p) { if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true }); }

const routes = [
  { url: 'http://localhost:3000/', name: 'home' },
  { url: 'http://localhost:3000/widgets', name: 'widgets' }
];

const thresholds = {
  performance: 0.80,
  accessibility: 0.90,
  bestPractices: 0.90,
  seo: 0.90
};

async function runLighthouse(url, name) {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
  const opts = { logLevel: 'error', output: 'html', onlyCategories: ['performance','accessibility','best-practices','seo'], port: chrome.port };
  const runnerResult = await lighthouse(url, opts);
  const reportHtml = runnerResult.report;
  ensureDir(OUTDIR);
  const outFile = path.join(OUTDIR, `${name}.html`);
  fs.writeFileSync(outFile, reportHtml);
  const cats = runnerResult.lhr.categories;
  const scores = {
    performance: cats.performance.score,
    accessibility: cats.accessibility.score,
    bestPractices: cats['best-practices'].score,
    seo: cats.seo.score
  };
  await chrome.kill();
  return scores;
}

async function main() {
  ensureDir(OUTDIR);
  let fail = false;
  for (const r of routes) {
    const scores = await runLighthouse(r.url, r.name);
    console.log(`${r.name}:`, scores);
    for (const [k, v] of Object.entries(thresholds)) {
      if ((scores[k] || 0) < v) {
        console.error(`Threshold fail: ${r.name} ${k} ${scores[k]} < ${v}`);
        fail = true;
      }
    }
  }
  if (fail) process.exitCode = 1;
}

main().catch(e => { console.error(e); process.exitCode = 1; });
