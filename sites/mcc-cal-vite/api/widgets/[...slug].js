import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Vercel Serverless Function: /api/widgets/[...slug]
 * Serves widget HTML files from the repository filesystem.
 *
 * Supports:
 *   /api/widgets/concert-portfolio                           → auto-detect latest
 *   /api/widgets/concert-portfolio/v4.9.3-concert.html      → specific version
 *   /api/widgets/portfolios/concert-portfolio               → categorical, auto-detect
 *   /api/widgets/portfolios/concert-portfolio/v4.9.3.html   → categorical + specific version
 */

function findWidgetPath(widget) {
  // Resolve from this file's location up to repo root → src/widgets
  const baseDir = path.resolve(__dirname, '..', '..', '..', '..', 'src', 'widgets');
  const categories = ['_admin', '_navigation', '_content', '_content/about', '_content/contact-form', '_content/quote-request', '_content/policies-legal', '_content/accessibility-statement', 'portfolios', 'projects'];
  for (const category of categories) {
    const p = path.join(baseDir, category, widget);
    if (fs.existsSync(p) && fs.statSync(p).isDirectory()) return p;
  }
  const flat = path.join(baseDir, widget);
  if (fs.existsSync(flat) && fs.statSync(flat).isDirectory()) return flat;
  return null;
}

function getLatestVersion(versionsDir) {
  const files = fs
    .readdirSync(versionsDir)
    .filter((f) => f.endsWith('.html'))
    .sort((a, b) => {
      const v = (s) => {
        const m = s.match(/v([\d.]+)/);
        return m ? m[1].split('.').map((x) => parseInt(x, 10)) : [0];
      };
      const [va, vb] = [v(a), v(b)];
      for (let i = 0; i < Math.max(va.length, vb.length); i++) {
        const d = (vb[i] || 0) - (va[i] || 0);
        if (d !== 0) return d;
      }
      return 0;
    });
  return files[0] || null;
}

export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const slug = req.query.slug;
  if (!slug || slug.length < 1) {
    res.status(400).json({ error: 'Invalid request' });
    return;
  }

  // Security: no path traversal
  for (const part of slug) {
    if (typeof part !== 'string' || part.includes('..') || part.includes('\0')) {
      res.status(400).json({ error: 'Invalid parameters' });
      return;
    }
  }

  const categories = ['_admin', '_navigation', '_content', '_content/about', '_content/contact-form', '_content/quote-request', '_content/policies-legal', '_content/accessibility-statement', 'portfolios', 'projects'];
  let widget, version;

  if (slug.length === 1) {
    widget = slug[0];
  } else if (slug.length === 2) {
    if (categories.includes(slug[0])) {
      widget = slug[1];
    } else {
      widget = slug[0];
      version = slug[1];
    }
  } else if (slug.length === 3) {
    widget = slug[1];
    version = slug[2];
  } else {
    res.status(400).json({ error: 'Invalid request path' });
    return;
  }

  const widgetPath = findWidgetPath(widget);
  if (!widgetPath) {
    res.status(404).json({ error: `Widget not found: ${widget}` });
    return;
  }

  const versionsDir = path.join(widgetPath, 'versions');
  if (!fs.existsSync(versionsDir)) {
    res.status(404).json({ error: `No versions directory for widget: ${widget}` });
    return;
  }

  const resolvedVersion = version || getLatestVersion(versionsDir);
  if (!resolvedVersion) {
    res.status(404).json({ error: `No versions found for widget: ${widget}` });
    return;
  }

  const filePath = path.resolve(path.join(versionsDir, resolvedVersion));
  const baseDir = path.resolve(__dirname, '..', '..', '..', '..', 'src', 'widgets');
  if (!filePath.startsWith(baseDir)) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }

  if (!fs.existsSync(filePath)) {
    res.status(404).json({ error: `Version not found: ${widget}/${resolvedVersion}` });
    return;
  }

  const html = fs.readFileSync(filePath, 'utf-8');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.setHeader('X-Widget-Name', widget);
  res.setHeader('X-Widget-Version', resolvedVersion);
  res.status(200).send(html);
}
