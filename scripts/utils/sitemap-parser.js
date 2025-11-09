/*
 * Sitemap parser utility
 * Exports: parseTopLevelSlugs(xmlText, base)
 * Works in Node (module.exports) and browser (window.mccSitemapParser)
 */
(function(exports){
  'use strict';

  function parseTopLevelSlugs(xmlText, base) {
    if (!xmlText || typeof xmlText !== 'string') return [];
    const locRe = /<loc>(.*?)<\/loc>/gims;
    const slugs = new Set();
    let m;
    while ((m = locRe.exec(xmlText)) !== null) {
      try {
        const urlText = (m[1] || '').trim();
        if (!urlText) continue;
  // use globalThis when available to avoid linter issues in Node
  const globalObj = (typeof globalThis !== 'undefined') ? globalThis : undefined;
        const originBase = base || (globalObj && globalObj.location && globalObj.location.origin) || 'https://example.test';
        const u = new URL(urlText, originBase);
        const path = u.pathname.replace(/\/+$|^\/+/, '');
        const top = path.split('/').filter(Boolean)[0] || '';
        if (top) slugs.add(top.toLowerCase());
      } catch (e) {
        // ignore malformed
      }
    }
    return Array.from(slugs);
  }

  // expose
  if (typeof module !== 'undefined' && module.exports) module.exports = { parseTopLevelSlugs };
  // attach to globalThis if available (browser use)
  try {
    const g = (typeof globalThis !== 'undefined') ? globalThis : undefined;
    if (g) {
      g.mccSitemapParser = g.mccSitemapParser || {};
      g.mccSitemapParser.parseTopLevelSlugs = parseTopLevelSlugs;
    }
  } catch (e) {
    /* ignore errors when trying to attach to global (best-effort) */
  }

  return exports;
})({});
