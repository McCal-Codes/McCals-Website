/**
 * McCal Media Widget Utilities
 * Version: 2.0.0
 *
 * Shared utility functions for widget development.
 *
 * IMPORTANT: These utilities are meant to be INLINED into individual widgets
 * for Squarespace self-contained compatibility. Do not import this file directly
 * in widget code - copy the functions you need into your widget's <script> tag.
 *
 * Usage:
 * 1. Copy functions needed into widget
 * 2. Use modern JavaScript (const/let, strict equality, arrow functions)
 * 3. Keep widgets self-contained (no external dependencies)
 *
 * Documentation: docs/standards/javascript-patterns.md
 */

/* ============================================================================
   DOM UTILITIES
   ============================================================================ */

/**
 * Safely query a single element
 * @param {string} selector - CSS selector
 * @param {Element} [context=document] - Context element
 * @returns {Element|null} - Found element or null
 */
const $ = (selector, context = document) => {
  try {
    return context.querySelector(selector);
  } catch (e) {
    console.warn(`Invalid selector: ${selector}`, e);
    return null;
  }
};

/**
 * Safely query multiple elements
 * @param {string} selector - CSS selector
 * @param {Element} [context=document] - Context element
 * @returns {Element[]} - Array of elements
 */
const $$ = (selector, context = document) => {
  try {
    return Array.from(context.querySelectorAll(selector));
  } catch (e) {
    console.warn(`Invalid selector: ${selector}`, e);
    return [];
  }
};

/**
 * Set text content safely
 * @param {Element|string} element - Element or selector
 * @param {string} text - Text content
 */
const setText = (element, text) => {
  const el = typeof element === "string" ? $(element) : element;
  if (el) {
    el.textContent = String(text);
  }
};

/**
 * Set HTML content safely
 * @param {Element|string} element - Element or selector
 * @param {string} html - HTML content
 */
const setHTML = (element, html) => {
  const el = typeof element === "string" ? $(element) : element;
  if (el) {
    el.innerHTML = html;
  }
};

/**
 * Toggle class on element
 * @param {Element|string} element - Element or selector
 * @param {string} className - Class name to toggle
 * @param {boolean} [force] - Force add (true) or remove (false)
 */
const toggleClass = (element, className, force) => {
  const el = typeof element === "string" ? $(element) : element;
  if (el) {
    el.classList.toggle(className, force);
  }
};

/**
 * Add event listener with cleanup tracking
 * @param {Element|string} element - Element or selector
 * @param {string} event - Event name
 * @param {Function} handler - Event handler
 * @param {Object} [options] - Event options
 * @returns {Function} - Cleanup function
 */
const on = (element, event, handler, options) => {
  const el = typeof element === "string" ? $(element) : element;
  if (!el) return () => {};

  el.addEventListener(event, handler, options);
  return () => el.removeEventListener(event, handler, options);
};

/* ============================================================================
   STORAGE UTILITIES
   ============================================================================ */

/**
 * Get item from localStorage with JSON parsing
 * @param {string} key - Storage key
 * @param {*} [defaultValue=null] - Default value if key not found
 * @returns {*} - Parsed value or default
 */
const getStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.warn(`Storage read failed for ${key}:`, e);
    return defaultValue;
  }
};

/**
 * Set item in localStorage with JSON stringification
 * @param {string} key - Storage key
 * @param {*} value - Value to store
 * @returns {boolean} - Success status
 */
const setStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.warn(`Storage write failed for ${key}:`, e);
    return false;
  }
};

/**
 * Remove item from localStorage
 * @param {string} key - Storage key
 * @returns {boolean} - Success status
 */
const removeStorage = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (e) {
    console.warn(`Storage remove failed for ${key}:`, e);
    return false;
  }
};

/* ============================================================================
   CACHE UTILITIES
   ============================================================================ */

/**
 * Create a simple cache manager
 * @param {string} prefix - Cache key prefix
 * @param {number} duration - Cache duration in milliseconds
 * @returns {Object} - Cache manager object
 */
const createCache = (prefix, duration = 10 * 60 * 1000) => {
  return {
    /**
     * Get cached data
     * @param {string} key - Cache key
     * @returns {*|null} - Cached data or null if expired/missing
     */
    get: (key) => {
      const fullKey = `${prefix}-${key}`;
      const cached = getStorage(fullKey);

      if (!cached) return null;

      const age = Date.now() - (cached.timestamp || 0);
      if (age > duration) {
        removeStorage(fullKey);
        return null;
      }

      return cached.data;
    },

    /**
     * Set cached data
     * @param {string} key - Cache key
     * @param {*} data - Data to cache
     * @returns {boolean} - Success status
     */
    set: (key, data) => {
      const fullKey = `${prefix}-${key}`;
      return setStorage(fullKey, {
        data,
        timestamp: Date.now(),
      });
    },

    /**
     * Clear specific cache key
     * @param {string} key - Cache key
     * @returns {boolean} - Success status
     */
    clear: (key) => {
      return removeStorage(`${prefix}-${key}`);
    },

    /**
     * Clear all cache keys with prefix
     */
    clearAll: () => {
      try {
        Object.keys(localStorage)
          .filter((k) => k.startsWith(prefix))
          .forEach((k) => localStorage.removeItem(k));
        return true;
      } catch (e) {
        console.warn("Cache clear failed:", e);
        return false;
      }
    },
  };
};

/* ============================================================================
   FETCH UTILITIES
   ============================================================================ */

/**
 * Fetch JSON with error handling and retries
 * @param {string} url - URL to fetch
 * @param {Object} [options] - Fetch options
 * @param {number} [options.retries=3] - Number of retries
 * @param {number} [options.retryDelay=1000] - Delay between retries (ms)
 * @param {number} [options.timeout=10000] - Request timeout (ms)
 * @returns {Promise<Object>} - Parsed JSON response
 */
const fetchJSON = async (
  url,
  { retries = 3, retryDelay = 1000, timeout = 10000, ...fetchOptions } = {}
) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      clearTimeout(timeoutId);

      if (attempt === retries) {
        throw error;
      }

      // Wait before retry
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
  }
};

/* ============================================================================
   DEBOUNCE & THROTTLE
   ============================================================================ */

/**
 * Debounce function - delays execution until after wait time
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function - limits execution frequency
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} - Throttled function
 */
const throttle = (func, limit = 300) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/* ============================================================================
   DATE & TIME UTILITIES
   ============================================================================ */

/**
 * Format date to readable string
 * @param {Date|string|number} date - Date to format
 * @param {Object} [options] - Intl.DateTimeFormat options
 * @returns {string} - Formatted date string
 */
const formatDate = (
  date,
  options = { year: "numeric", month: "long", day: "numeric" }
) => {
  try {
    const d = date instanceof Date ? date : new Date(date);
    return new Intl.DateTimeFormat("en-US", options).format(d);
  } catch (e) {
    console.warn("Date formatting failed:", e);
    return String(date);
  }
};

/**
 * Get relative time string (e.g., "2 hours ago")
 * @param {Date|string|number} date - Date to compare
 * @returns {string} - Relative time string
 */
const relativeTime = (date) => {
  try {
    const d = date instanceof Date ? date : new Date(date);
    const now = new Date();
    const diffMs = now - d;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return "just now";
    if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? "s" : ""} ago`;
    if (diffHour < 24)
      return `${diffHour} hour${diffHour !== 1 ? "s" : ""} ago`;
    if (diffDay < 30) return `${diffDay} day${diffDay !== 1 ? "s" : ""} ago`;
    return formatDate(d);
  } catch (e) {
    console.warn("Relative time failed:", e);
    return String(date);
  }
};

/* ============================================================================
   ARRAY UTILITIES
   ============================================================================ */

/**
 * Shuffle array using Fisher-Yates algorithm
 * @param {Array} array - Array to shuffle
 * @returns {Array} - New shuffled array
 */
const shuffle = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

/**
 * Get random item from array
 * @param {Array} array - Source array
 * @returns {*} - Random item
 */
const randomItem = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

/**
 * Chunk array into smaller arrays
 * @param {Array} array - Source array
 * @param {number} size - Chunk size
 * @returns {Array[]} - Array of chunks
 */
const chunk = (array, size = 10) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

/**
 * Remove duplicates from array
 * @param {Array} array - Source array
 * @param {Function} [keyFn] - Optional key function for objects
 * @returns {Array} - Array without duplicates
 */
const unique = (array, keyFn = null) => {
  if (!keyFn) return [...new Set(array)];

  const seen = new Set();
  return array.filter((item) => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

/* ============================================================================
   STRING UTILITIES
   ============================================================================ */

/**
 * Truncate string with ellipsis
 * @param {string} str - String to truncate
 * @param {number} maxLength - Maximum length
 * @param {string} [suffix='...'] - Suffix to add
 * @returns {string} - Truncated string
 */
const truncate = (str, maxLength = 100, suffix = "...") => {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - suffix.length) + suffix;
};

/**
 * Slugify string (make URL-friendly)
 * @param {string} str - String to slugify
 * @returns {string} - Slugified string
 */
const slugify = (str) => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

/* ============================================================================
   NUMBER UTILITIES
   ============================================================================ */

/**
 * Clamp number between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} - Clamped value
 */
const clamp = (value, min, max) => {
  return Math.min(Math.max(value, min), max);
};

/**
 * Format number with commas
 * @param {number} num - Number to format
 * @returns {string} - Formatted number
 */
const formatNumber = (num) => {
  return new Intl.NumberFormat("en-US").format(num);
};

/* ============================================================================
   ANIMATION UTILITIES
   ============================================================================ */

/**
 * Wait for specified time
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise<void>}
 */
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Request animation frame as promise
 * @returns {Promise<number>} - Frame timestamp
 */
const nextFrame = () =>
  new Promise((resolve) => requestAnimationFrame(resolve));

/**
 * Check if user prefers reduced motion
 * @returns {boolean} - True if reduced motion preferred
 */
const prefersReducedMotion = () => {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

/* ============================================================================
   EXPORT (for reference only - inline into widgets)
   ============================================================================ */

// DO NOT use these exports in widgets - copy functions directly
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    // DOM
    $,
    $$,
    setText,
    setHTML,
    toggleClass,
    on,
    // Storage
    getStorage,
    setStorage,
    removeStorage,
    createCache,
    // Fetch
    fetchJSON,
    // Debounce/Throttle
    debounce,
    throttle,
    // Date/Time
    formatDate,
    relativeTime,
    // Array
    shuffle,
    randomItem,
    chunk,
    unique,
    // String
    truncate,
    slugify,
    // Number
    clamp,
    formatNumber,
    // Animation
    wait,
    nextFrame,
    prefersReducedMotion,
  };
}
