(function() {
  'use strict';

  // --- Utilities ---
  function parseGVizResponse(text) {
    // GViz returns: /*O_o*/\ngoogle.visualization.Query.setResponse({...});
    const match = text.match(/setResponse\((.*)\);?\s*$/s);
    if (!match) throw new Error('Unable to parse Google Sheets response');
    return JSON.parse(match[1]);
  }

  async function fetchSheetRows({ sheetId, sheetName, sheetGid }) {
    if (!sheetId) throw new Error('sheetId is required');
    let url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json`;
    if (sheetName) url += `&sheet=${encodeURIComponent(sheetName)}`;
    if (sheetGid) url += `&gid=${encodeURIComponent(sheetGid)}`; // may be ignored by GViz, but harmless

    const resp = await fetch(url, { mode: 'cors' });
    if (!resp.ok) throw new Error(`Google Sheets HTTP ${resp.status}`);
    const text = await resp.text();
    const json = parseGVizResponse(text);

    const cols = json.table.cols.map(c => (c.label || c.id || '').toLowerCase().trim());
    const rows = (json.table.rows || []).map(r => {
      const obj = {};
      (r.c || []).forEach((cell, i) => {
        const key = cols[i] || `col${i}`;
        obj[key] = cell ? (cell.v ?? cell.f ?? null) : null;
      });
      return obj;
    });
    return rows;
  }

  function sanitizeHtml(input) {
    const temp = document.createElement('div');
    temp.innerHTML = String(input || '');
    temp.querySelectorAll('script, style, iframe, object, embed').forEach(el => el.remove());

    const allowed = new Set(['A','P','BR','STRONG','EM','UL','OL','LI','BLOCKQUOTE','B','I','H2','H3','H4','H5','H6','SPAN','DIV']);
    temp.querySelectorAll('*').forEach(el => {
      if (!allowed.has(el.tagName)) {
        const parent = el.parentNode;
        if (parent) {
          while (el.firstChild) parent.insertBefore(el.firstChild, el);
          parent.removeChild(el);
        }
      } else {
        [...el.attributes].forEach(attr => {
          const name = attr.name.toLowerCase();
          if (el.tagName === 'A' && (name === 'href' || name === 'title')) {
            // keep
          } else if (name.startsWith('on')) {
            el.removeAttribute(attr.name);
          } else {
            el.removeAttribute(attr.name);
          }
        });
        if (el.tagName === 'A') {
          el.setAttribute('target', '_blank');
          el.setAttribute('rel', 'noopener');
        }
      }
    });

    return temp.innerHTML.trim();
  }

  function formatDate(dateLike) {
    if (!dateLike) return null;
    const d = new Date(dateLike);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }

  function fileNameFromUrl(url) {
    try {
      const u = new URL(url);
      return (u.pathname.split('/').pop() || 'image').split('?')[0];
    } catch (e) {
      // fallback for non-URL strings
      return String(url).split('/').pop() || 'image';
    }
  }

  async function attachAutoCaption(imgEl, explicitAlt) {
    // If explicit alt exists, use that as caption
    if (explicitAlt) {
      const fig = imgEl.closest('figure') || wrapImageInFigure(imgEl);
      const cap = document.createElement('figcaption');
      cap.className = 'blog-image-caption';
      cap.textContent = explicitAlt;
      fig.appendChild(cap);
      return;
    }

    const UCS = window.UniversalCaptionSystem;
    if (!UCS) return; // gracefully skip if system not loaded

    try {
      const fname = fileNameFromUrl(imgEl.src);
      const meta = await UCS.getImageCaption(imgEl.src, fname);
      if (meta && meta.caption) {
        const fig = imgEl.closest('figure') || wrapImageInFigure(imgEl);
        const cap = document.createElement('figcaption');
        cap.className = 'blog-image-caption';
        cap.textContent = meta.caption;
        fig.appendChild(cap);
      }
    } catch (e) {
      // ignore caption failure
    }
  }

  function wrapImageInFigure(imgEl) {
    const fig = document.createElement('figure');
    fig.className = 'blog-image';
    imgEl.parentNode.insertBefore(fig, imgEl);
    fig.appendChild(imgEl);
    return fig;
  }

  function createImageFigure(url, alt, enableAutoCaptions) {
    const fig = document.createElement('figure');
    fig.className = 'blog-image';
    const img = document.createElement('img');
    img.loading = 'lazy';
    img.decoding = 'async';
    img.src = url;
    if (alt) img.alt = alt;
    fig.appendChild(img);

    if (alt) {
      const cap = document.createElement('figcaption');
      cap.className = 'blog-image-caption';
      cap.textContent = alt;
      fig.appendChild(cap);
    } else if (enableAutoCaptions) {
      // Defer to avoid blocking rendering
      setTimeout(() => attachAutoCaption(img, null), 0);
    }

    return fig;
  }

  function normalizePost(row) {
    const map = {};
    Object.keys(row).forEach(k => map[k.toLowerCase()] = row[k]);
    const post = {
      title: map.title || map.name || map.headline || '',
      date: map.date || map.published || map.time || '',
      hero: map.image || map.hero || map.hero_image || map.heroimage || '',
      images: map.images || '',
      body: map.body_html || map.body || map.content || '',
      tags: map.tags || map.category || ''
    };
    return post;
  }

  async function renderFromSheets(container, opts) {
    container.innerHTML = '<div class="blog-loading">Loading…</div>';
    try {
      const rows = await fetchSheetRows(opts);
      const posts = rows.map(normalizePost).filter(p => p.title || p.body || p.hero);
      // Sort by date desc when available
      posts.sort((a, b) => new Date(b.date) - new Date(a.date));

      const limit = Number.isFinite(+opts.maxPosts) && +opts.maxPosts > 0 ? +opts.maxPosts : posts.length;
      const list = document.createElement('div');
      list.className = 'blog-feed';

      posts.slice(0, limit).forEach(p => {
        const article = document.createElement('article');
        article.className = 'blog-card';

        // Hero image
        if (opts.showImages !== false && p.hero) {
          article.appendChild(createImageFigure(p.hero, '', opts.autoCaptions !== false));
        }

        // Header
        const header = document.createElement('header');
        header.className = 'blog-card-header';
        const h2 = document.createElement('h2');
        h2.className = 'blog-title';
        h2.textContent = p.title || '(untitled)';
        header.appendChild(h2);
        if (opts.showDates !== false && p.date) {
          const f = formatDate(p.date);
          if (f) {
            const time = document.createElement('time');
            time.className = 'blog-date';
            time.textContent = f;
            try { time.dateTime = new Date(p.date).toISOString(); } catch(_) {}
            header.appendChild(time);
          }
        }
        article.appendChild(header);

        // Body
        if (p.body) {
          const body = document.createElement('div');
          body.className = 'blog-body';
          body.innerHTML = sanitizeHtml(p.body);
          article.appendChild(body);
        }

        // Additional images
        if (opts.showImages !== false && p.images) {
          String(p.images).split(/[\n,]/).map(s => s.trim()).filter(Boolean).forEach(url => {
            article.appendChild(createImageFigure(url, '', opts.autoCaptions !== false));
          });
        }

        list.appendChild(article);
      });

      container.innerHTML = '';
      container.appendChild(list);
    } catch (e) {
      console.error('Blog feed load failed:', e);
      container.innerHTML = '<div class="blog-error">Failed to load blog. Check Google Sheet sharing settings.</div>';
    }
  }

  // Public bootstrapper
  function initFromDataAttributes(root) {
    const opts = {
      provider: (root.dataset.provider || 'sheets').toLowerCase(),
      sheetId: root.dataset.sheetId,
      sheetName: root.dataset.sheetName,
      sheetGid: root.dataset.sheetGid,
      maxPosts: root.dataset.maxPosts ? parseInt(root.dataset.maxPosts, 10) : undefined,
      showDates: root.dataset.showDates !== 'false',
      showImages: root.dataset.showImages !== 'false',
      autoCaptions: root.dataset.autoCaptions !== 'false'
    };

    if (opts.provider !== 'sheets') {
      root.innerHTML = '<div class="blog-error">Unknown provider. Supported: sheets</div>';
      return;
    }

    if (!opts.sheetId) {
      root.innerHTML = '<div class="blog-error">Missing data-sheet-id</div>';
      return;
    }

    return renderFromSheets(root, opts);
  }

  function autoBootstrap() {
    document.querySelectorAll('[data-blog-feed]').forEach(el => initFromDataAttributes(el));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoBootstrap);
  } else {
    autoBootstrap();
  }

  // Expose programmatic API if needed
  window.BlogFeedWidget = {
    init: (container, opts) => {
      if (typeof container === 'string') container = document.querySelector(container);
      if (!container) throw new Error('Container not found');
      const config = { provider: 'sheets', showDates: true, showImages: true, autoCaptions: true, ...(opts || {}) };
      if (!config.sheetId) throw new Error('sheetId required');
      return renderFromSheets(container, config);
    }
  };
})();
