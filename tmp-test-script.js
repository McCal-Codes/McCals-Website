
(() => {
  const pf = document.getElementById('featuredPf');
  if (!pf) return;

  const grid = document.getElementById('featuredGrid');
  const loading = document.getElementById('featuredLoading');
  const debugToggle = document.getElementById('debugToggle');
  const debugPanel = document.getElementById('debugInfo');
  const debugStatus = document.getElementById('debugStatus');
  const hasDebugPanel = !!(debugToggle && debugPanel && debugStatus);
  const metaCount = document.getElementById('metaCount');
  const metaUpdated = document.getElementById('metaUpdated');
  const metaSource = document.getElementById('metaSource');
  const versionIndicator = document.getElementById('versionIndicator');

  const lb = document.getElementById('featuredLightbox');
  const lbDialog = lb.querySelector('.fp-dialog');
  const lbGallery = document.getElementById('fpGallery');
  const lbTitle = document.getElementById('fpTitle');
  const lbMeta = document.getElementById('fpMeta');
  const lbClose = lb.querySelector('.fp-close');

  const AUTO_REFRESH_INTERVAL = 15 * 60 * 1000;
  const CACHE_TTL = 15 * 60 * 1000;
  const CACHE_KEY_PREFIX = 'featured-portfolio-cache:v1.5:';
  const MAX_LIGHTBOX_IMAGES = Math.max(1, parseInt(pf.dataset.lightboxLimit || '24', 10));
  const TARGET_PANES = Math.max(1, parseInt(pf.dataset.panes || '8', 10));
  const rangeDaysRaw = parseInt(pf.dataset.rangeDays || '0', 10);
  const RANGE_DAYS = Number.isFinite(rangeDaysRaw) ? rangeDaysRaw : 0;
  const FORCE_DIVERSE = (pf.dataset.forceDiverse || 'true').toLowerCase() === 'true';
  const CARDS_STAGGER = 100;

  const debugMetrics = {
    startTime: performance.now(),
    apiCalls: 0,
    itemCount: 0,
    imageCount: 0,
    lastRefresh: 'Never',
    manifest: '--'
  };

  let autoRefreshTimer = null;
  let nextRefreshTimer = null;
  let debugActive = false;
  let isTabVisible = true;
  let activeManifestUrl = '';

  const GH = { owner: 'McCal-Codes', repo: 'McCals-Website', branch: 'main' };
  const RAW_ROOT = `https://raw.githubusercontent.com/${GH.owner}/${GH.repo}/${GH.branch}/`;
  const PATH_PREFIX = 'src/images/Portfolios/';

  const manifestCandidates = ['src/images/Portfolios/featured-manifest.json'];

  const manifestSources = Array.from(new Set(manifestCandidates.filter(Boolean)));

  function logDebug(message, data = null) {
    if (debugActive && hasDebugPanel) {
      console.log('[Featured Debug v1.5]', message, data || '');
      if (debugStatus) {
        debugStatus.textContent = message;
        updateDebugMetrics();
      }
    }
    if (typeof message === 'string' && (message.toLowerCase().includes('error') || message.toLowerCase().includes('failed'))) {
      console.error('[Featured Portfolio v1.5]', message, data || '');
    }
  }

  function toggleDebug() {
    if (!hasDebugPanel) return;
    debugActive = !debugActive;
    debugPanel.classList.toggle('active', debugActive);
    if (debugActive) {
      updateDebugMetrics();
    }
  }

  if (debugToggle && hasDebugPanel) {
    debugToggle.addEventListener('click', toggleDebug);
  }
  document.addEventListener('visibilitychange', () => {
    isTabVisible = !document.hidden;
  });

  function cacheKey(url) {
    return `${CACHE_KEY_PREFIX}${url}`;
  }

  function readCache(url) {
    try {
      const payload = localStorage.getItem(cacheKey(url));
      if (!payload) return null;
      const parsed = JSON.parse(payload);
      if (!parsed || typeof parsed !== 'object') return null;
      const age = Date.now() - parsed.timestamp;
      if (age > CACHE_TTL) return null;
      return parsed.manifest;
    } catch (error) {
      logDebug('Cache read failed', error.message);
      return null;
    }
  }

  function writeCache(url, manifest) {
    try {
      const payload = { timestamp: Date.now(), manifest };
      localStorage.setItem(cacheKey(url), JSON.stringify(payload));
    } catch (error) {
      logDebug('Cache write failed', error.message);
    }
  }

  function resolveManifestUrl(candidate) {
    if (/^https?:/i.test(candidate)) return candidate;
    const cleaned = candidate
      .replace(/^(\.\.?\/)+/, '')
      .replace(/^\.\/+/, '')
      .replace(/^\/+/, '');
    return RAW_ROOT + cleaned;
  }

  async function fetchManifest(url, forceRefresh = false) {
    if (!forceRefresh) {
      const cacheHit = readCache(url);
      if (cacheHit) {
        logDebug('Using cached manifest', url);
        return cacheHit;
      }
    }

    debugMetrics.apiCalls += 1;
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const json = await response.json();
    writeCache(url, json);
    return json;
  }

  function cleanPath(value) {
    if (!value) return '';
    return String(value).replace(/\\+/g, '/').trim();
  }

  function canonicalizeType(value) {
    if (!value) return 'portfolio';
    const normalized = String(value).trim().toLowerCase();
    if (!normalized) return 'portfolio';
    if (['concert', 'concerts', 'music', 'music photography', 'concert photography'].includes(normalized)) return 'concert';
    if (['event', 'events', 'event photography', 'corporate', 'events photography'].includes(normalized)) return 'events';
    if (['journalism', 'photojournalism', 'photo journalism', 'documentary', 'journalism photography', 'politics'].includes(normalized)) return 'journalism';
    if (['portfolio', 'work', 'projects', 'featured'].includes(normalized)) return 'portfolio';
    return normalized;
  }

  function titleCase(value) {
    if (!value) return '';
    return String(value)
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\b\w/g, char => char.toUpperCase());
  }

  function ensurePrefix(parts, prefix) {
    if (!Array.isArray(prefix) || !prefix.length) {
      return parts.slice();
    }
    const prefixLower = prefix.map(seg => seg.toLowerCase());
    const currentLower = parts.slice(0, prefix.length).map(seg => seg.toLowerCase());
    if (currentLower.join('/') === prefixLower.join('/')) {
      return parts.slice();
    }
    return prefix.concat(parts);
  }

  function resolvePathSegments(parts, item, rootSegments) {
    let resolved = parts.slice();
    const itemBase = cleanPath(item.basePath || item.base || item.collectionPath || item.rootPath || item.folderRoot || '');
    if (itemBase) {
      const baseParts = itemBase.split('/').filter(Boolean);
      resolved = ensurePrefix(resolved, baseParts);
    }
    if (item.collection && typeof item.collection === 'string') {
      const collectionParts = cleanPath(item.collection).split('/').filter(Boolean);
      resolved = ensurePrefix(resolved, collectionParts);
    }
    resolved = ensurePrefix(resolved, rootSegments);
    return resolved;
  }

  function extractRootSegments(url) {
    try {
      const parsed = new URL(url);
      const segments = parsed.pathname.split('/').filter(Boolean);
      const marker = segments.lastIndexOf('Portfolios');
      if (marker === -1) return [];
      return segments.slice(marker + 1, segments.length - 1);
    } catch {
      return [];
    }
  }

  function normalizeImageRef(value) {
    if (!value) return null;
    const str = String(value).trim();
    if (!str) return null;
    return str.replace(/\\+/g, '/');
  }

  function normalizeImageEntries(images, cover) {
    const list = [];
    for (const entry of images) {
      const ref = normalizeImageRef(
        typeof entry === 'object'
          ? (entry && (entry.src || entry.file || entry.filename || entry.path || entry.url))
          : entry
      );
      if (ref) list.push(ref);
    }
    const coverRef = normalizeImageRef(cover);
    if (coverRef) {
      if (!list.includes(coverRef)) list.unshift(coverRef);
    }
    return list.slice(0, MAX_LIGHTBOX_IMAGES);
  }

  function encodeSegments(path) {
    return path.split('/').filter(Boolean).map(seg => encodeURIComponent(seg)).join('/');
  }

  function buildImageUrl(pathSegments, imageRef) {
    if (!imageRef) return '';
    if (/^(https?:)?\/\//i.test(imageRef) || imageRef.startsWith('data:')) {
      return imageRef;
    }
    const normalized = normalizeImageRef(imageRef);
    if (!normalized) return '';
    if (normalized.startsWith('src/')) {
      return RAW_ROOT + normalized;
    }
    if (normalized.startsWith('images/')) {
      return RAW_ROOT + normalized;
    }
    if (normalized.startsWith('Portfolios/')) {
      return `${RAW_ROOT}src/images/${encodeSegments(normalized)}`;
    }
    if (normalized.startsWith('../')) {
      const trimmed = normalized.replace(/^\.\.\/+/, '');
      return `${RAW_ROOT}${encodeSegments(trimmed)}`;
    }
    if (normalized.includes('/')) {
      return `${RAW_ROOT}${PATH_PREFIX}${encodeSegments(normalized)}`;
    }
    const basePath = pathSegments.map(seg => encodeURIComponent(seg)).join('/');
    return `${RAW_ROOT}${PATH_PREFIX}${basePath}/${encodeURIComponent(normalized)}`;
  }

  function dedupeItems(items) {
    const seen = new Set();
    const result = [];
    for (const item of items) {
      const key = `${item.id || ''}|${item.folderKey}|${item.cover || ''}`;
      if (seen.has(key)) continue;
      seen.add(key);
      result.push(item);
    }
    return result;
  }

  function extractDate(entry) {
    const dateData = entry.date || entry.datetime || entry.metaDate || null;
    const displayCandidates = [entry.dateDisplay, entry.displayDate, entry.prettyDate, entry.dateText];
    const isoCandidates = [];
    if (typeof entry.dateISO === 'string') isoCandidates.push(entry.dateISO);
    if (typeof entry.dateIso === 'string') isoCandidates.push(entry.dateIso);
    if (typeof entry.date === 'string') isoCandidates.push(entry.date);
    if (typeof entry.lastUpdated === 'string') isoCandidates.push(entry.lastUpdated);
    if (typeof entry.generatedAt === 'string') isoCandidates.push(entry.generatedAt);
    if (typeof entry.generated === 'string') isoCandidates.push(entry.generated);

    if (dateData && typeof dateData === 'object') {
      if (typeof dateData.iso === 'string') isoCandidates.push(dateData.iso);
      if (typeof dateData.utc === 'string') isoCandidates.push(dateData.utc);
      if (typeof dateData.value === 'string') isoCandidates.push(dateData.value);
      if (dateData.year && dateData.month) {
        const day = dateData.day || 1;
        const iso = `${dateData.year}-${String(dateData.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        isoCandidates.push(iso);
      }
      if (dateData.display) displayCandidates.push(dateData.display);
      if (dateData.dateDisplay) displayCandidates.push(dateData.dateDisplay);
      if (dateData.monthName && dateData.year) {
        displayCandidates.push(`${dateData.monthName} ${dateData.year}`);
      }
    }

    let iso = isoCandidates.find(Boolean) || null;
    let value = iso ? Date.parse(iso.replace(/\//g, '-')) : NaN;
    if (!Number.isFinite(value)) {
      value = 0;
      iso = null;
    }
    let display = displayCandidates.find(Boolean) || '';
    if (!display && iso) {
      try {
        display = new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'long' });
      } catch {
        display = iso;
      }
    }
    return { iso, display, value };
  }

  function normalizeItems(manifest, rootSegments = []) {
    const rawItems = Array.isArray(manifest?.items) ? manifest.items : [];
    return rawItems
      .map((item, index) => {
        const folderPath = cleanPath(item.folderPath || item.path || item.source || '');
        const rawParts = folderPath ? folderPath.split('/').filter(Boolean) : [];
        const parts = rawParts.length ? rawParts : [];
        if (!parts.length) return null;

        const pathSegments = resolvePathSegments(parts, item, rootSegments);
        if (!pathSegments.length) return null;

        const rawImages = Array.isArray(item.images) ? item.images : [];
        const coverCandidate = item.coverImage || item.cover || item.heroImage || item.thumbnail || null;
        const images = normalizeImageEntries(rawImages, coverCandidate);
        if (!images.length) return null;
        
        // Shuffle the images array to randomize the cover selection
        const shuffledImages = [...images];
        for (let i = shuffledImages.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledImages[i], shuffledImages[j]] = [shuffledImages[j], shuffledImages[i]];
        }

        const { iso, display, value } = extractDate(item);
        const id = item.id || item.slug || item.uid || `${pathSegments.join('-')}-${index}`;
        const type = canonicalizeType(item.type || item.category || pathSegments[0] || 'portfolio');
        const typeLabel = titleCase(type).trim();
        
        // Enhanced title extraction - prioritize specific names by content type
        let title;
        
        // For journalism, extract the actual article title from folder path
        if (type === 'journalism') {
          // Path format: "Journalism/Events/The Rooney Rule" or "Journalism/Politics/Butler Protest"
          // We want the last segment which is the actual article title
          const folderSegments = folderPath.split('/').filter(Boolean);
          if (folderSegments.length >= 3) {
            // Use the last segment as the article title
            title = folderSegments[folderSegments.length - 1];
          } else if (folderSegments.length >= 2) {
            // Fallback to second-to-last segment
            title = folderSegments[folderSegments.length - 1];
          }
          
          // If we still don't have a good title, try image filename
          if (!title || title === 'Events' || title === 'Politics') {
            const firstImage = rawImages[0];
            if (typeof firstImage === 'string') {
              // Extract title from filename like "250417 The Rooney Rule_CAL3148.jpg"
              const match = firstImage.match(/^\d+\s+(.+?)_/);
              if (match) {
                title = match[1];
              }
            }
          }
        }
        
        // For other types, use standard fields
        if (!title) {
          const titleCandidates = [
            item.title,
            item.name,
            item.eventName,
            item.bandName,
            item.articleTitle,
            item.headline
          ].filter(Boolean);
          
          if (titleCandidates.length > 0) {
            title = titleCandidates[0];
          } else {
            // Fallback to folder name or path segment
            title = pathSegments[pathSegments.length - 1] || `Item ${index + 1}`;
          }
        }
        
        // Clean the title
        title = String(title).replace(/\s+/g, ' ').trim();
        
        // If title is still generic or matches type, try harder
        if (title === type || title === typeLabel || 
            title === 'Events' || title === 'Politics' || title === 'Journalism' ||
            title === 'Concert' || title === 'Event') {
          
          // Try other fields or use folder name
          title = item.eventName || item.name || item.id || 
                  pathSegments[pathSegments.length - 1] || 
                  `${typeLabel} ${index + 1}`;
        }

        // Get tags and handle journalism vs other types differently
        let tags = Array.isArray(item.tags) ? item.tags.filter(Boolean) : [];
        let primaryTag;
        if (type === 'journalism') {
          primaryTag = 'Journalism';
        } else {
          primaryTag = item.category || `${typeLabel} Photography`;
        }
        
        if (!tags.includes(primaryTag) && !tags.some(tag => tag.toLowerCase().includes(typeLabel.toLowerCase()))) {
          tags.unshift(primaryTag);
        }
        
        const sourceLabel = titleCase(
          item.collection || item.collectionName || item.source || pathSegments[0] || typeLabel || 'Portfolio'
        );

        // Clean up date display
        let cleanDateDisplay = display ? String(display).replace(/\s+/g, ' ').replace(/undefined\s*/g, '').replace(/^\s+|\s+$/g, '') : '';
        if (!cleanDateDisplay && iso) {
          try {
            cleanDateDisplay = new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'long' });
          } catch {
            cleanDateDisplay = iso;
          }
        }

        return {
          id,
          title,
          type,
          typeLabel,
          source: sourceLabel,
          pathSegments,
          folderKey: pathSegments.join('/'),
          dateDisplay: cleanDateDisplay,
          dateValue: value,
          isoDate: iso,
          cover: shuffledImages[0], // Use first image from shuffled array
          images: shuffledImages,   // Use shuffled order for lightbox too
          tags: tags.slice(0, 4)
        };
      })
      .filter(Boolean);
  }

  function applyRangeFilter(items) {
    if (!Number.isFinite(RANGE_DAYS) || RANGE_DAYS <= 0) {
      logDebug('Range filter disabled - showing all items');
      return items;
    }
    
    const cutoff = Date.now() - RANGE_DAYS * 24 * 60 * 60 * 1000;
    const filtered = items.filter(item => item.dateValue >= cutoff);
    logDebug(`Range filter: ${items.length} items -> ${filtered.length} items after filtering`);
    
    return filtered.length ? filtered : items;
  }

  function ensureDiverseSelection(items, targetCount) {
    if (items.length <= targetCount) return items;
    
    const byType = {};
    items.forEach(item => {
      const type = canonicalizeType(item.type);
      if (!byType[type]) byType[type] = [];
      byType[type].push(item);
    });
    
    const types = Object.keys(byType);
    const itemsPerType = Math.floor(targetCount / types.length);
    const remainder = targetCount % types.length;
    
    logDebug(`Diverse selection: ${types.length} types, ${itemsPerType} items per type, ${remainder} remainder`);
    
    const selected = [];
    types.forEach((type, index) => {
      const typeItems = byType[type].sort((a, b) => b.dateValue - a.dateValue);
      const limit = itemsPerType + (index < remainder ? 1 : 0);
      selected.push(...typeItems.slice(0, limit));
      logDebug(`Type "${type}": ${typeItems.length} available, selected ${Math.min(limit, typeItems.length)}`);
    });
    
    return selected.sort((a, b) => b.dateValue - a.dateValue);
  }

  async function loadAndRender(forceRefresh = false) {
    try {
      debugMetrics.lastRefresh = new Date().toLocaleTimeString();
      logDebug('Loading featured portfolio...', { forceRefresh, sources: manifestSources.length });

      let manifest = null;
      let usedUrl = '';
      
      for (const candidate of manifestSources) {
        try {
          const url = resolveManifestUrl(candidate);
          logDebug(`Trying manifest: ${candidate} -> ${url}`);
          manifest = await fetchManifest(url, forceRefresh);
          usedUrl = candidate;
          break;
        } catch (error) {
          logDebug(`Manifest failed: ${candidate}`, error.message);
          console.warn(`Failed to load manifest ${candidate}:`, error.message);
        }
      }

      if (!manifest) {
        throw new Error('No valid manifest found');
      }

      activeManifestUrl = usedUrl;
      debugMetrics.manifest = usedUrl.split('/').pop() || usedUrl;
      logDebug('Manifest loaded successfully', usedUrl);

      const rootSegments = extractRootSegments(resolveManifestUrl(usedUrl));
      const allItems = normalizeItems(manifest, rootSegments);
      
      logDebug(`Normalized ${allItems.length} items from manifest`);
      
      const rangeFiltered = applyRangeFilter(allItems);
      logDebug(`After range filter: ${rangeFiltered.length} items`);
      
      let selectedItems;
      if (FORCE_DIVERSE && rangeFiltered.length > TARGET_PANES) {
        selectedItems = ensureDiverseSelection(rangeFiltered, TARGET_PANES);
        logDebug(`After diverse selection: ${selectedItems.length} items`);
      } else {
        selectedItems = rangeFiltered
          .sort((a, b) => b.dateValue - a.dateValue)
          .slice(0, TARGET_PANES);
        logDebug(`After simple selection: ${selectedItems.length} items`);
      }

      const uniqueItems = dedupeItems(selectedItems);
      logDebug(`After deduplication: ${uniqueItems.length} items`);

      debugMetrics.itemCount = uniqueItems.length;
      debugMetrics.imageCount = uniqueItems.reduce((sum, item) => sum + (item.images?.length || 0), 0);

      renderGallery(uniqueItems);
      
      const typeDistribution = {};
      uniqueItems.forEach(item => {
        typeDistribution[item.type] = (typeDistribution[item.type] || 0) + 1;
      });
      logDebug('Type distribution:', typeDistribution);

    } catch (error) {
      console.error('Featured portfolio loading failed:', error);
      showError(`Failed to load featured portfolio: ${error.message}`);
    }
  }

  function showError(message) {
    loading.style.display = 'none';
    grid.innerHTML = `<div class="featured-error" role="alert">${message}</div>`;
    metaCount.textContent = '0';
    metaUpdated.textContent = 'Failed';
    metaSource.textContent = 'Error';
  }

  function renderGallery(slots) {
    try {
      loading.style.display = 'none';
      grid.innerHTML = '';
      grid.classList.remove('loaded');

      if (!slots.length) {
        grid.innerHTML = '<div class="featured-empty">No featured items available.</div>';
        return;
      }

      metaCount.textContent = slots.length;
      metaUpdated.textContent = new Date().toLocaleDateString();
      metaSource.textContent = debugMetrics.manifest;

      const fragment = document.createDocumentFragment();
      const cards = [];

      slots.forEach((slot, index) => {
        const card = document.createElement('article');
        card.className = 'featured-card loading';
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-label', `View ${slot.title} gallery`);

        const img = document.createElement('img');
        img.loading = 'lazy';
        img.decoding = 'async';
        img.alt = slot.title;

        const info = document.createElement('div');
        info.className = 'featured-info';
        
        const title = document.createElement('h3');
        title.className = 'featured-title';
        title.textContent = slot.title;
        
        const meta = document.createElement('div');
        meta.className = 'featured-meta';
        
        // For journalism, show just "Journalism", for others show full typeLabel
        const displayType = slot.type === 'journalism' ? 'Journalism' : slot.typeLabel;
        const metaParts = [displayType, slot.dateDisplay]
          .filter(Boolean)
          .map(part => String(part).replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, ''));
        meta.textContent = metaParts.join(' | ');
        
        info.appendChild(title);
        info.appendChild(meta);
        
        // Always show tags
        const tags = document.createElement('div');
        tags.className = 'featured-tags';
        
        if (slot.tags && slot.tags.length > 0) {
          slot.tags.slice(0, 3).forEach((tag, tagIndex) => {
            const tagEl = document.createElement('span');
            tagEl.className = tagIndex === 0 ? 'featured-tag featured-tag-category' : 'featured-tag';
            tagEl.textContent = String(tag).replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '');
            tags.appendChild(tagEl);
          });
        } else {
          // Fallback tag based on type
          const fallbackTag = slot.type === 'journalism' ? 'Journalism' : slot.typeLabel;
          const tagEl = document.createElement('span');
          tagEl.className = 'featured-tag featured-tag-category';
          tagEl.textContent = fallbackTag;
          tags.appendChild(tagEl);
        }
        
        info.appendChild(tags);

        card.appendChild(img);
        card.appendChild(info);
        fragment.appendChild(card);

        cards.push({ card, slot, img, index });

        const openLightbox = () => openLightboxFor(slot);
        card.addEventListener('click', openLightbox);
        card.addEventListener('keydown', evt => {
          if (evt.key === 'Enter' || evt.key === ' ') {
            evt.preventDefault();
            openLightbox();
          }
        });
      });

      grid.appendChild(fragment);
      grid.style.display = 'block';

      cards.forEach(({ card, slot, img, index }) => {
        setTimeout(() => loadCardImage({ card, slot, img }), index * CARDS_STAGGER);
      });

      requestAnimationFrame(() => {
        grid.classList.add('loaded');
      });

      updateDebugMetrics();
      logDebug('Featured gallery loaded', `${slots.length} items from ${debugMetrics.manifest}`);
    } catch (error) {
      console.error('Featured gallery failed:', error);
      showError(`Error loading featured gallery: ${error.message}`);
    }
  }

  async function loadCardImage({ card, slot, img }) {
    try {
      const coverRef = slot.cover || slot.images[0];
      const src = buildImageUrl(slot.pathSegments, coverRef);
      await loadImageWithRetry(img, src, 2);
      card.classList.remove('loading');
      card.classList.add('loaded');
    } catch (error) {
      console.warn(`Failed to load image for ${slot.title}:`, error);
      card.classList.remove('loading');
      card.classList.add('error');
    }
  }

  function loadImageWithRetry(img, src, maxRetries = 2) {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const attempt = () => {
        const probe = new Image();
        probe.onload = () => {
          img.src = src;
          img.classList.add('loaded');
          resolve();
        };
        probe.onerror = () => {
          attempts += 1;
          if (attempts > maxRetries) {
            reject(new Error('Image failed to load'));
          } else {
            const backoff = Math.pow(2, attempts) * 1000;
            setTimeout(attempt, backoff);
          }
        };
        probe.src = src;
      };
      attempt();
    });
  }

  function openLightboxFor(slot) {
    lbGallery.innerHTML = '<div class="fp-hint">Scroll -></div>';

    slot.images.forEach(fileName => {
      const img = document.createElement('img');
      img.loading = 'lazy';
      img.decoding = 'async';
      img.alt = `${slot.title} photo`;
      img.className = 'loading';
      img.src = buildImageUrl(slot.pathSegments, fileName);
      img.addEventListener('load', () => {
        img.classList.remove('loading');
        img.classList.add('loaded');
      });
      lbGallery.appendChild(img);
    });

    lbTitle.textContent = slot.title;
    const metaBits = [
      slot.typeLabel,
      slot.dateDisplay,
      `${slot.images.length} photo${slot.images.length === 1 ? '' : 's'}`
    ].filter(Boolean);
    lbMeta.textContent = metaBits.join(' | ');

    lb.classList.add('is-open');
    lb.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('fp-open');
    document.body.classList.add('fp-open');
    lbDialog.focus();

    const hint = lbGallery.querySelector('.fp-hint');
    if (hint && slot.images.length > 1) {
      setTimeout(() => hint.classList.add('fade'), 3000);
    }
  }

  function closeLightbox() {
    lb.classList.remove('is-open');
    lb.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('fp-open');
    document.body.classList.remove('fp-open');
  }

  lbClose.addEventListener('click', closeLightbox);
  lb.addEventListener('click', evt => {
    if (evt.target === lb) closeLightbox();
  });
  document.addEventListener('keydown', evt => {
    if (evt.key === 'Escape' && lb.classList.contains('is-open')) {
      evt.preventDefault();
      closeLightbox();
    }
  });

  function updateDebugMetrics() {
    if (!hasDebugPanel) return;
    const loadTime = Math.round(performance.now() - debugMetrics.startTime);
    const setText = id => {
      const el = document.getElementById(id);
      if (!el) return null;
      return el;
    };
    const loadEl = setText('debugLoadTime'); if (loadEl) loadEl.textContent = loadTime;
    const itemEl = setText('debugItemCount'); if (itemEl) itemEl.textContent = debugMetrics.itemCount;
    const imageEl = setText('debugImageCount'); if (imageEl) imageEl.textContent = debugMetrics.imageCount;
    const apiEl = setText('debugApiCalls'); if (apiEl) apiEl.textContent = debugMetrics.apiCalls;
    const lastEl = setText('debugLastRefresh'); if (lastEl) lastEl.textContent = debugMetrics.lastRefresh;
    const manifestEl = setText('debugManifest'); if (manifestEl) manifestEl.textContent = debugMetrics.manifest;
  }

  function updateNextRefreshIndicator() {
    const indicator = document.getElementById('autoRefreshIndicator');
    if (!indicator) return;

    let timeLeft = AUTO_REFRESH_INTERVAL;
    function tick() {
      const minutes = Math.floor(timeLeft / 60000);
      const seconds = Math.floor((timeLeft % 60000) / 1000);
      indicator.textContent = `Next refresh: ${minutes}:${String(seconds).padStart(2, '0')}`;
      if (timeLeft > 0) {
        timeLeft -= 1000;
        nextRefreshTimer = setTimeout(tick, 1000);
      }
    }
    tick();
  }

  function setupAutoRefresh() {
    if (autoRefreshTimer) clearInterval(autoRefreshTimer);
    autoRefreshTimer = setInterval(() => {
      if (isTabVisible) {
        debugMetrics.startTime = performance.now();
        loadAndRender(true);
        updateNextRefreshIndicator();
      }
    }, AUTO_REFRESH_INTERVAL);
    updateNextRefreshIndicator();
  }

  // Changelog modal functions
  function showChangelog() {
    const modal = document.getElementById('changelog-modal');
    if (modal) {
      modal.style.display = 'block';
    }
  }
  
  function hideChangelog() {
    const modal = document.getElementById('changelog-modal');
    if (modal) {
      modal.style.display = 'none';
    }
  }
  
  // Make functions global for onclick handlers
  window.showChangelog = showChangelog;
  window.hideChangelog = hideChangelog;

  versionIndicator.addEventListener('click', showChangelog);

  loadAndRender();
  setupAutoRefresh();

  window.addEventListener('beforeunload', () => {
    if (autoRefreshTimer) clearInterval(autoRefreshTimer);
    if (nextRefreshTimer) clearTimeout(nextRefreshTimer);
  });
})();







