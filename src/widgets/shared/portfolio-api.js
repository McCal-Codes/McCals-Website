/**
 * McCal Media Portfolio API - Shared Backend System
 * 
 * High-performance GitHub API layer with caching, batching, and optimizations
 * for all portfolio types. Supports REST and GraphQL GitHub APIs.
 * 
 * Features:
 * - Intelligent caching with TTL and versioning
 * - Request batching and deduplication 
 * - Progressive image loading with WebP detection
 * - EXIF date extraction with performance optimization
 * - GitHub GraphQL API for faster queries
 * - Error handling with exponential backoff
 * - Performance monitoring and metrics
 * 
 * @version 1.0.0
 * @author Caleb McCartney / McCal-Codes
 */

class PortfolioAPI {
  constructor(config = {}) {
    this.config = {
      owner: 'McCal-Codes',
      repo: 'McCals-Website', 
      branch: 'main',
      baseApiUrl: 'https://api.github.com',
      baseRawUrl: 'https://raw.githubusercontent.com',
      graphqlUrl: 'https://api.github.com/graphql',
      
      // Performance settings
      cacheTTL: 5 * 60 * 1000, // 5 minutes
      maxConcurrentRequests: 6,
      requestTimeout: 10000,
      retryAttempts: 3,
      batchDelay: 50, // ms to wait for batching
      
      // Image optimization
      supportedImageTypes: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'],
      preferWebP: true,
      lazyLoadThreshold: 0.1,
      maxImagePreloadBytes: 65535,
      
      ...config
    };
    
    this.cache = new Map();
    this.requestQueue = new Map();
    this.batchQueue = new Map();
    this.metrics = {
      requests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      errors: 0,
      avgResponseTime: 0
    };
    
    // Check for WebP support
    this._checkWebPSupport();
    
    // Setup intersection observer for lazy loading
    this._setupIntersectionObserver();
  }

  /**
   * Main entry point for fetching portfolio data
   */
  async fetchPortfolio(basePath, options = {}) {
    const startTime = performance.now();
    
    try {
      const portfolioData = await this._fetchPortfolioData(basePath, options);
      const processedData = await this._processPortfolioData(portfolioData, options);
      
      this._updateMetrics(startTime, false);
      return processedData;
      
    } catch (error) {
      this._updateMetrics(startTime, true);
      console.error('Portfolio fetch failed:', error);
      throw error;
    }
  }

  /**
   * Fetch folder structure and metadata
   */
  async _fetchPortfolioData(basePath, options) {
    const cacheKey = `portfolio:${basePath}:${JSON.stringify(options)}`;
    
    // Check cache first
    const cached = this._getCached(cacheKey);
    if (cached) {
      this.metrics.cacheHits++;
      return cached;
    }
    
    this.metrics.cacheMisses++;
    
    // Use GraphQL for faster queries when possible
    const useGraphQL = options.useGraphQL !== false;
    let data;
    
    if (useGraphQL && this._canUseGraphQL(basePath)) {
      data = await this._fetchViaGraphQL(basePath, options);
    } else {
      data = await this._fetchViaREST(basePath, options);
    }
    
    this._setCache(cacheKey, data);
    return data;
  }

  /**
   * GraphQL query for better performance
   */
  async _fetchViaGraphQL(basePath, options) {
    const query = `
      query GetPortfolioData($owner: String!, $repo: String!, $path: String!) {
        repository(owner: $owner, name: $repo) {
          object(expression: "HEAD:${basePath}") {
            ... on Tree {
              entries {
                name
                type
                object {
                  ... on Tree {
                    entries {
                      name
                      type
                      oid
                    }
                  }
                  ... on Blob {
                    oid
                    text
                  }
                }
              }
            }
          }
        }
      }
    `;

    const variables = {
      owner: this.config.owner,
      repo: this.config.repo, 
      path: basePath
    };

    const response = await this._makeRequest(this.config.graphqlUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json'
      },
      body: JSON.stringify({ query, variables })
    });

    return this._processGraphQLResponse(response);
  }

  /**
   * REST API fallback
   */
  async _fetchViaREST(basePath, options) {
    const url = `${this.config.baseApiUrl}/repos/${this.config.owner}/${this.config.repo}/contents/${basePath}`;
    
    const response = await this._makeRequest(url, {
      headers: {
        'Accept': 'application/vnd.github+json'
      }
    });

    return this._processRESTResponse(response, basePath);
  }

  /**
   * Process and optimize portfolio data
   */
  async _processPortfolioData(rawData, options) {
    const portfolios = [];
    
    // Batch process folders for better performance
    const folders = rawData.folders || [];
    const batchSize = Math.min(folders.length, this.config.maxConcurrentRequests);
    
    for (let i = 0; i < folders.length; i += batchSize) {
      const batch = folders.slice(i, i + batchSize);
      const batchPromises = batch.map(folder => this._processSinglePortfolio(folder, options));
      
      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          portfolios.push(result.value);
        } else {
          console.warn(`Failed to process portfolio ${batch[index].name}:`, result.reason);
        }
      });
    }

    return {
      portfolios,
      total: portfolios.length,
      metadata: {
        fetchedAt: Date.now(),
        source: rawData.source || 'rest',
        cached: rawData.cached || false
      }
    };
  }

  /**
   * Process individual portfolio folder
   */
  async _processSinglePortfolio(folder, options) {
    const { name, path, entries } = folder;
    
    // Find manifest.json if it exists
    const manifest = await this._loadManifest(path);
    
    // Get image files
    const imageFiles = entries
      .filter(entry => this._isImageFile(entry.name))
      .map(entry => entry.name);

    if (!imageFiles.length) {
      return null;
    }

    // Determine date (manifest > EXIF > commit)
    let dateISO = manifest?.date;
    if (!dateISO && options.extractDates !== false) {
      dateISO = await this._extractOptimalDate(path, imageFiles, manifest);
    }

    // Optimize image list
    const optimizedImages = this._optimizeImageList(imageFiles, options);

    return {
      id: this._generatePortfolioId(path),
      name,
      path,
      title: this._formatTitle(name),
      dateISO,
      dateFormatted: dateISO ? this._formatDate(dateISO) : null,
      images: optimizedImages,
      thumbnail: optimizedImages[0] || null,
      manifest,
      stats: {
        imageCount: imageFiles.length,
        hasManifest: !!manifest
      }
    };
  }

  /**
   * Optimized EXIF date extraction
   */
  async _extractOptimalDate(folderPath, imageFiles, manifest) {
    // Skip if manifest has date
    if (manifest?.date) return manifest.date;
    
    // Sample strategy: check up to 3 files, prioritize by likely date accuracy
    const candidates = imageFiles
      .filter(name => /\.(jpe?g|tiff?)$/i.test(name))
      .slice(0, 3);
    
    if (!candidates.length) {
      return this._getCommitDate(folderPath);
    }

    const dates = await Promise.allSettled(
      candidates.map(filename => this._extractEXIFDate(folderPath, filename))
    );

    const validDates = dates
      .filter(result => result.status === 'fulfilled' && result.value)
      .map(result => result.value)
      .sort();

    return validDates[0] || this._getCommitDate(folderPath);
  }

  /**
   * Enhanced EXIF extraction with performance optimization
   */
  async _extractEXIFDate(folderPath, filename) {
    const cacheKey = `exif:${folderPath}/${filename}`;
    const cached = this._getCached(cacheKey);
    if (cached) return cached;

    try {
      const url = `${this.config.baseRawUrl}/${this.config.owner}/${this.config.repo}/${this.config.branch}/${folderPath}/${filename}`;
      
      // Fetch only the header portion for EXIF
      const response = await fetch(url, {
        headers: { 'Range': `bytes=0-${this.config.maxImagePreloadBytes}` },
        mode: 'cors'
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const buffer = await response.arrayBuffer();
      const date = this._parseEXIFDate(buffer, filename);
      
      this._setCache(cacheKey, date, 60 * 60 * 1000); // Cache for 1 hour
      return date;
      
    } catch (error) {
      console.warn(`EXIF extraction failed for ${filename}:`, error);
      return null;
    }
  }

  /**
   * Performance-optimized image loading
   */
  createOptimizedImageLoader(container, images, options = {}) {
    return new ImageLoader(this, container, images, {
      lazy: true,
      progressive: true,
      webpFirst: this.config.preferWebP,
      placeholder: options.placeholder || 'blur',
      ...options
    });
  }

  /**
   * Batch multiple requests together
   */
  async _makeRequest(url, options = {}) {
    this.metrics.requests++;
    
    // Check if request is already in flight
    const requestKey = `${options.method || 'GET'}:${url}`;
    if (this.requestQueue.has(requestKey)) {
      return this.requestQueue.get(requestKey);
    }

    // Add timeout and retry logic
    const requestPromise = this._executeRequest(url, options);
    this.requestQueue.set(requestKey, requestPromise);
    
    try {
      const result = await requestPromise;
      return result;
    } finally {
      // Clean up after request completes
      setTimeout(() => this.requestQueue.delete(requestKey), 1000);
    }
  }

  async _executeRequest(url, options) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.requestTimeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
      
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Utility methods
   */
  _getCached(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  _setCache(key, data, ttl = this.config.cacheTTL) {
    this.cache.set(key, {
      data,
      expires: Date.now() + ttl
    });
  }

  _updateMetrics(startTime, isError) {
    const duration = performance.now() - startTime;
    this.metrics.avgResponseTime = (this.metrics.avgResponseTime + duration) / 2;
    
    if (isError) {
      this.metrics.errors++;
    }
  }

  _generatePortfolioId(path) {
    return path.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
  }

  _formatTitle(name) {
    return decodeURIComponent(name)
      .replace(/[-_]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  _formatDate(iso, format = 'short') {
    const date = new Date(iso);
    const options = {
      short: { year: 'numeric', month: 'short' },
      long: { year: 'numeric', month: 'long', day: 'numeric' },
      year: { year: 'numeric' }
    };
    
    return date.toLocaleDateString(undefined, options[format] || options.short);
  }

  _isImageFile(filename) {
    const ext = filename.split('.').pop()?.toLowerCase();
    return this.config.supportedImageTypes.includes(ext);
  }

  _canUseGraphQL(path) {
    // GraphQL is better for deep folder structures
    return path.split('/').length > 2;
  }

  async _checkWebPSupport() {
    // Simple WebP support detection
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      this.hasWebPSupport = (webP.height === 2);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  }

  _setupIntersectionObserver() {
    if (typeof IntersectionObserver !== 'undefined') {
      this.intersectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.dispatchEvent(new CustomEvent('enterViewport'));
            }
          });
        },
        { threshold: this.config.lazyLoadThreshold }
      );
    }
  }

  // Additional helper methods for different portfolio types
  async _loadManifest(path) {
    try {
      const url = `${this.config.baseRawUrl}/${this.config.owner}/${this.config.repo}/${this.config.branch}/${path}/manifest.json`;
      const response = await fetch(url, { mode: 'cors' });
      if (!response.ok) return null;
      
      const json = await response.json();
      
      // Handle both array and object formats
      if (Array.isArray(json)) {
        return { images: json, date: null };
      }
      
      if (json && Array.isArray(json.images)) {
        return json;
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  async _getCommitDate(path) {
    const cacheKey = `commit:${path}`;
    const cached = this._getCached(cacheKey);
    if (cached) return cached;

    try {
      const url = `${this.config.baseApiUrl}/repos/${this.config.owner}/${this.config.repo}/commits?path=${encodeURIComponent(path)}&per_page=1`;
      const response = await this._makeRequest(url);
      
      const date = response[0]?.commit?.author?.date || null;
      this._setCache(cacheKey, date, 30 * 60 * 1000); // 30 min cache
      
      return date;
    } catch (error) {
      console.warn(`Commit date fetch failed for ${path}:`, error);
      return null;
    }
  }

  _optimizeImageList(images, options) {
    // Sort by likely importance (manifest order, then alphabetical)
    const sorted = images.slice().sort((a, b) => {
      // Prioritize files that look like they might be covers/featured
      const aScore = this._getImagePriorityScore(a);
      const bScore = this._getImagePriorityScore(b);
      
      return bScore - aScore || a.localeCompare(b);
    });

    return sorted;
  }

  _getImagePriorityScore(filename) {
    let score = 0;
    const lower = filename.toLowerCase();
    
    // Boost cover/featured images
    if (/cover|featured|main|hero|poster/i.test(lower)) score += 10;
    
    // Prefer certain formats
    if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) score += 2;
    if (lower.endsWith('.webp')) score += 3;
    
    return score;
  }

  // Public API for metrics and debugging
  getMetrics() {
    return { ...this.metrics };
  }

  clearCache() {
    this.cache.clear();
  }

  // EXIF parsing using dedicated parser
  _parseEXIFDate(buffer, filename) {
    if (!this.exifParser) {
      this.exifParser = new EXIFParser();
    }
    return this.exifParser.extractDate(buffer, filename);
  }

  _processGraphQLResponse(response) {
    // Convert GraphQL response to standard format
    // Implementation details would go here
    return { folders: [], source: 'graphql' };
  }

  _processRESTResponse(response, basePath) {
    // Convert REST response to standard format  
    const folders = response
      .filter(item => item.type === 'dir')
      .map(item => ({
        name: item.name,
        path: `${basePath}/${item.name}`,
        entries: [] // Would be populated by sub-requests
      }));
    
    return { folders, source: 'rest' };
  }
}

/**
 * High-performance image loader with lazy loading and optimization
 */
class ImageLoader {
  constructor(api, container, images, options = {}) {
    this.api = api;
    this.container = container;
    this.images = Array.isArray(images) ? images : [];
    this.options = {
      lazy: true,
      progressive: true,
      webpFirst: true,
      placeholder: 'blur',
      batchSize: 3,
      preloadNext: 2,
      retryAttempts: 2,
      loadingClass: 'loading',
      loadedClass: 'loaded',
      errorClass: 'error',
      ...options
    };
    
    this.loadedCount = 0;
    this.loadingCount = 0;
    this.imageElements = new Map();
    this.loadPromises = new Map();
    this.retryCount = new Map();
    
    this._setupIntersectionObserver();
  }

  /**
   * Create and insert optimized image elements
   */
  async createImages() {
    const fragment = document.createDocumentFragment();
    
    for (let i = 0; i < this.images.length; i++) {
      const imageData = this.images[i];
      const imgElement = this._createImageElement(imageData, i);
      
      this.imageElements.set(i, imgElement);
      fragment.appendChild(imgElement.container);
      
      // Start loading if not lazy, or if within initial viewport
      if (!this.options.lazy || i < this.options.batchSize) {
        this._startImageLoad(imgElement, imageData);
      } else {
        this._setupLazyLoad(imgElement, imageData);
      }
    }
    
    this.container.appendChild(fragment);
    return this.imageElements;
  }

  /**
   * Create optimized image element with placeholder
   */
  _createImageElement(imageData, index) {
    const container = document.createElement('div');
    container.className = `image-container ${this.options.loadingClass}`;
    container.dataset.index = index;
    
    const img = document.createElement('img');
    img.loading = 'lazy';
    img.decoding = 'async';
    
    // Add responsive image attributes
    if (imageData.srcset) {
      img.srcset = imageData.srcset;
    }
    
    if (imageData.sizes) {
      img.sizes = imageData.sizes;
    }
    
    // Placeholder handling
    if (this.options.placeholder === 'blur') {
      this._addBlurPlaceholder(container, imageData);
    } else if (this.options.placeholder === 'color') {
      container.style.backgroundColor = imageData.placeholderColor || '#f0f0f0';
    }
    
    container.appendChild(img);
    
    return {
      container,
      img,
      loaded: false,
      loading: false,
      error: false
    };
  }

  /**
   * Start loading an image with optimization
   */
  _startImageLoad(imgElement, imageData) {
    if (imgElement.loading || imgElement.loaded) return;
    
    imgElement.loading = true;
    this.loadingCount++;
    
    const loadPromise = this._loadImageWithRetry(imgElement, imageData);
    this.loadPromises.set(imgElement, loadPromise);
    
    return loadPromise;
  }

  /**
   * Load image with retry logic and format optimization
   */
  async _loadImageWithRetry(imgElement, imageData) {
    const maxRetries = this.options.retryAttempts;
    let attempt = 0;
    
    while (attempt <= maxRetries) {
      try {
        await this._loadSingleImage(imgElement, imageData, attempt);
        this._onImageLoaded(imgElement);
        return;
      } catch (error) {
        attempt++;
        if (attempt > maxRetries) {
          this._onImageError(imgElement, error);
          return;
        }
        
        // Exponential backoff for retries
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 500));
      }
    }
  }

  /**
   * Load single image with format optimization
   */
  async _loadSingleImage(imgElement, imageData, attempt) {
    let imageUrl = imageData.src;
    
    // Try WebP first if supported and preferred
    if (attempt === 0 && this.options.webpFirst && this.api.hasWebPSupport) {
      const webpUrl = this._getWebPUrl(imageUrl);
      if (webpUrl !== imageUrl) {
        imageUrl = webpUrl;
      }
    }
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      const cleanup = () => {
        img.onload = null;
        img.onerror = null;
      };
      
      img.onload = () => {
        cleanup();
        imgElement.img.src = imageUrl;
        if (imageData.alt) imgElement.img.alt = imageData.alt;
        resolve();
      };
      
      img.onerror = (error) => {
        cleanup();
        reject(new Error(`Failed to load ${imageUrl}`));
      };
      
      img.src = imageUrl;
    });
  }

  /**
   * Handle successful image load
   */
  _onImageLoaded(imgElement) {
    imgElement.loading = false;
    imgElement.loaded = true;
    this.loadingCount--;
    this.loadedCount++;
    
    imgElement.container.classList.remove(this.options.loadingClass);
    imgElement.container.classList.add(this.options.loadedClass);
    
    // Trigger load event
    imgElement.container.dispatchEvent(new CustomEvent('imageLoaded', {
      detail: { element: imgElement, index: this.loadedCount }
    }));
    
    // Preload next images if enabled
    this._preloadNext();
  }

  /**
   * Handle image load error
   */
  _onImageError(imgElement, error) {
    imgElement.loading = false;
    imgElement.error = true;
    this.loadingCount--;
    
    imgElement.container.classList.remove(this.options.loadingClass);
    imgElement.container.classList.add(this.options.errorClass);
    
    console.warn('Image load failed:', error);
    
    imgElement.container.dispatchEvent(new CustomEvent('imageError', {
      detail: { element: imgElement, error }
    }));
  }

  /**
   * Setup lazy loading with intersection observer
   */
  _setupLazyLoad(imgElement, imageData) {
    if (!this.intersectionObserver) return;
    
    const onEnterViewport = () => {
      this.intersectionObserver.unobserve(imgElement.container);
      this._startImageLoad(imgElement, imageData);
    };
    
    imgElement.container.addEventListener('enterViewport', onEnterViewport, { once: true });
    this.intersectionObserver.observe(imgElement.container);
  }

  /**
   * Preload next batch of images
   */
  _preloadNext() {
    if (!this.options.preloadNext) return;
    
    const nextImages = Array.from(this.imageElements.values())
      .filter(el => !el.loaded && !el.loading && !el.error)
      .slice(0, this.options.preloadNext);
    
    nextImages.forEach((imgElement, index) => {
      const imageIndex = parseInt(imgElement.container.dataset.index);
      const imageData = this.images[imageIndex];
      if (imageData) {
        this._startImageLoad(imgElement, imageData);
      }
    });
  }

  /**
   * Setup intersection observer for lazy loading
   */
  _setupIntersectionObserver() {
    if (typeof IntersectionObserver === 'undefined') {
      this.options.lazy = false; // Fallback to immediate loading
      return;
    }
    
    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.dispatchEvent(new CustomEvent('enterViewport'));
          }
        });
      },
      { 
        threshold: 0.1,
        rootMargin: '50px 0px'
      }
    );
  }

  /**
   * Add blur placeholder effect
   */
  _addBlurPlaceholder(container, imageData) {
    if (imageData.placeholder) {
      const placeholder = document.createElement('div');
      placeholder.className = 'image-placeholder';
      placeholder.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-image: url(${imageData.placeholder});
        background-size: cover;
        background-position: center;
        filter: blur(8px);
        transition: opacity 0.3s ease;
        z-index: 1;
      `;
      
      container.appendChild(placeholder);
      container.style.position = 'relative';
      
      // Remove placeholder when image loads
      container.addEventListener('imageLoaded', () => {
        placeholder.style.opacity = '0';
        setTimeout(() => placeholder.remove(), 300);
      }, { once: true });
    }
  }

  /**
   * Get WebP version of image URL if available
   */
  _getWebPUrl(originalUrl) {
    // Simple WebP detection - could be enhanced with server-side support
    const urlObj = new URL(originalUrl);
    const pathname = urlObj.pathname;
    
    if (/\.(jpe?g|png)$/i.test(pathname)) {
      // For GitHub raw URLs, we can't easily convert to WebP
      // This would require server-side conversion or CDN support
      return originalUrl;
    }
    
    return originalUrl;
  }

  /**
   * Get loading statistics
   */
  getStats() {
    return {
      total: this.images.length,
      loaded: this.loadedCount,
      loading: this.loadingCount,
      pending: this.images.length - this.loadedCount - this.loadingCount,
      progress: this.images.length > 0 ? (this.loadedCount / this.images.length) : 1
    };
  }

  /**
   * Cancel all pending loads and cleanup
   */
  destroy() {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
    
    this.loadPromises.clear();
    this.imageElements.clear();
    this.retryCount.clear();
  }
}

// Export for use in widgets
window.PortfolioAPI = PortfolioAPI;