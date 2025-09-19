(function() {
  'use strict';

  // --- Google Docs Utilities ---
  function extractDocId(url) {
    const match = url.match(/\/document\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : url; // Return as-is if already just an ID
  }

  async function fetchGoogleDoc(docId) {
    // Use the published-to-web endpoint for public docs
    const publishUrl = `https://docs.google.com/document/d/${docId}/pub`;
    
    try {
      const response = await fetch(publishUrl, { mode: 'cors' });
      if (!response.ok) {
        throw new Error(`Google Docs HTTP ${response.status}. Make sure the document is published to web.`);
      }
      return await response.text();
    } catch (error) {
      console.error('Failed to fetch Google Doc:', error);
      throw error;
    }
  }

  function parseGoogleDocHTML(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const posts = [];

    // Find all headings that could be post titles
    const headings = doc.querySelectorAll('h1, h2, h3');
    
    let currentPost = null;
    let contentBuffer = [];

    const processContentBuffer = () => {
      if (contentBuffer.length > 0) {
        const content = contentBuffer.join('\n').trim();
        if (currentPost && content) {
          currentPost.body = content;
        }
        contentBuffer = [];
      }
    };

    // Walk through the document content
    const walker = document.createTreeWalker(
      doc.body,
      NodeFilter.SHOW_ELEMENT,
      null,
      false
    );

    let node;
    while (node = walker.nextNode()) {
      const tagName = node.tagName.toLowerCase();
      
      // Check if this is a heading that looks like a blog post title
      if (['h1', 'h2', 'h3'].includes(tagName)) {
        // Finish previous post
        if (currentPost) {
          processContentBuffer();
          if (currentPost.title) {
            posts.push(currentPost);
          }
        }
        
        // Start new post
        const title = node.textContent.trim();
        if (title) {
          currentPost = {
            title: title,
            date: null,
            hero: null,
            images: [],
            body: '',
            tags: ''
          };
        }
      }
      // Collect content for current post
      else if (currentPost) {
        if (tagName === 'p') {
          const text = node.textContent.trim();
          const html = node.innerHTML.trim();
          
          // Check if this paragraph contains a date
          const dateMatch = text.match(/\b(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}|\d{4}[-\/]\d{1,2}[-\/]\d{1,2}|January|February|March|April|May|June|July|August|September|October|November|December)/i);
          if (dateMatch && !currentPost.date) {
            currentPost.date = text;
          }
          
          // Check for images in this paragraph
          const images = node.querySelectorAll('img');
          images.forEach(img => {
            if (img.src) {
              if (!currentPost.hero) {
                currentPost.hero = img.src;
              } else {
                currentPost.images.push(img.src);
              }
            }
          });
          
          // Add text content
          if (text) {
            contentBuffer.push(html);
          }
        }
        else if (['ul', 'ol', 'blockquote', 'div'].includes(tagName)) {
          const html = node.outerHTML;
          if (html.trim()) {
            contentBuffer.push(html);
          }
        }
        else if (tagName === 'img') {
          if (node.src) {
            if (!currentPost.hero) {
              currentPost.hero = node.src;
            } else {
              currentPost.images.push(node.src);
            }
          }
        }
      }
    }

    // Process the last post
    if (currentPost) {
      processContentBuffer();
      if (currentPost.title) {
        posts.push(currentPost);
      }
    }

    return posts;
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
          } else if (name.startsWith('on') || name.startsWith('data-')) {
            el.removeAttribute(attr.name);
          } else if (!['href', 'title', 'alt', 'src'].includes(name)) {
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

  function formatDate(dateString) {
    if (!dateString) return null;
    
    // Try to parse various date formats
    const patterns = [
      /(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})/,
      /(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/,
      /(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(\d{4})/i,
      /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2}),?\s+(\d{4})/i
    ];
    
    for (const pattern of patterns) {
      const match = dateString.match(pattern);
      if (match) {
        try {
          const date = new Date(dateString);
          if (!isNaN(date.getTime())) {
            return date.toLocaleDateString(undefined, { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            });
          }
        } catch (e) {
          // continue to next pattern
        }
      }
    }
    
    return null;
  }

  function fileNameFromUrl(url) {
    try {
      const u = new URL(url);
      return (u.pathname.split('/').pop() || 'image').split('?')[0];
    } catch (e) {
      return String(url).split('/').pop() || 'image';
    }
  }

  async function attachAutoCaption(imgEl, explicitAlt) {
    if (explicitAlt) {
      const fig = imgEl.closest('figure') || wrapImageInFigure(imgEl);
      const cap = document.createElement('figcaption');
      cap.className = 'blog-image-caption';
      cap.textContent = explicitAlt;
      fig.appendChild(cap);
      return;
    }

    const UCS = window.UniversalCaptionSystem;
    if (!UCS) return;

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
      setTimeout(() => attachAutoCaption(img, null), 0);
    }

    return fig;
  }

  async function renderFromGoogleDocs(container, opts) {
    container.innerHTML = '<div class="blog-loading">Loading blog posts...</div>';
    
    try {
      const docId = extractDocId(opts.docId);
      const html = await fetchGoogleDoc(docId);
      const posts = parseGoogleDocHTML(html);
      
      // Filter and limit posts
      const validPosts = posts.filter(p => p.title && (p.body || p.hero));
      const limit = Number.isFinite(+opts.maxPosts) && +opts.maxPosts > 0 ? +opts.maxPosts : validPosts.length;
      
      const list = document.createElement('div');
      list.className = 'blog-feed';

      validPosts.slice(0, limit).forEach(post => {
        const article = document.createElement('article');
        article.className = 'blog-card';

        // Hero image
        if (opts.showImages !== false && post.hero) {
          article.appendChild(createImageFigure(post.hero, '', opts.autoCaptions !== false));
        }

        // Header
        const header = document.createElement('header');
        header.className = 'blog-card-header';
        const h2 = document.createElement('h2');
        h2.className = 'blog-title';
        h2.textContent = post.title;
        header.appendChild(h2);
        
        if (opts.showDates !== false && post.date) {
          const formattedDate = formatDate(post.date);
          if (formattedDate) {
            const time = document.createElement('time');
            time.className = 'blog-date';
            time.textContent = formattedDate;
            header.appendChild(time);
          }
        }
        article.appendChild(header);

        // Body
        if (post.body) {
          const body = document.createElement('div');
          body.className = 'blog-body';
          body.innerHTML = sanitizeHtml(post.body);
          article.appendChild(body);
        }

        // Additional images
        if (opts.showImages !== false && post.images && post.images.length > 0) {
          post.images.forEach(imgUrl => {
            article.appendChild(createImageFigure(imgUrl, '', opts.autoCaptions !== false));
          });
        }

        list.appendChild(article);
      });

      container.innerHTML = '';
      container.appendChild(list);
      
    } catch (error) {
      console.error('Google Docs blog feed load failed:', error);
      container.innerHTML = `<div class="blog-error">Failed to load blog from Google Docs. ${error.message}</div>`;
    }
  }

  // Public bootstrapper for Google Docs
  function initFromDataAttributes(root) {
    const opts = {
      provider: (root.dataset.provider || 'docs').toLowerCase(),
      docId: root.dataset.docId || root.dataset.docUrl,
      maxPosts: root.dataset.maxPosts ? parseInt(root.dataset.maxPosts, 10) : undefined,
      showDates: root.dataset.showDates !== 'false',
      showImages: root.dataset.showImages !== 'false',
      autoCaptions: root.dataset.autoCaptions !== 'false'
    };

    if (opts.provider !== 'docs') {
      root.innerHTML = '<div class="blog-error">This provider only supports Google Docs. Use data-provider="docs"</div>';
      return;
    }

    if (!opts.docId) {
      root.innerHTML = '<div class="blog-error">Missing data-doc-id or data-doc-url</div>';
      return;
    }

    return renderFromGoogleDocs(root, opts);
  }

  function autoBootstrap() {
    document.querySelectorAll('[data-blog-feed-docs]').forEach(el => initFromDataAttributes(el));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoBootstrap);
  } else {
    autoBootstrap();
  }

  // Expose programmatic API
  window.BlogFeedDocsWidget = {
    init: (container, opts) => {
      if (typeof container === 'string') container = document.querySelector(container);
      if (!container) throw new Error('Container not found');
      const config = { provider: 'docs', showDates: true, showImages: true, autoCaptions: true, ...(opts || {}) };
      if (!config.docId) throw new Error('docId required');
      return renderFromGoogleDocs(container, config);
    }
  };
})();