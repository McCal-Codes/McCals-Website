// McCal CDN/jsDelivr Widget Loader
// Finds `.mccal-widget` (or `[data-cdn-widget]`) containers and supports:
// - data-src (full URL) OR data-repo + data-path (+ optional data-version)
// - data-fallback (optional URL/path)
// - data-mode: inline|iframe
// - data-replace: true|false (when true, clears container before injection)
// - data-debug: true|false (or ?mccalWidgetDebug=1)
// - data-dev-src (optional override when dev mode enabled)
(function () {
  'use strict';

  var LOADER_VERSION = '1.1.0';
  var GLOBAL_KEY = '__mccalJsDelivrWidgetLoader__';
  var globalState = window[GLOBAL_KEY] || (window[GLOBAL_KEY] = {});
  if (globalState.booted) return;
  globalState.booted = true;
  globalState.version = LOADER_VERSION;

  var inFlight = globalState.inFlight || (globalState.inFlight = {});
  var textCache = globalState.textCache || (globalState.textCache = {});
  var stats =
    globalState.stats ||
    (globalState.stats = {
      requests: 0,
      deduped: 0,
      cacheHits: 0,
      failures: 0,
    });

  function nowMs() {
    return Date.now ? Date.now() : +new Date();
  }

  function forEachNode(list, fn) {
    for (var i = 0; i < list.length; i++) fn(list[i], i);
  }

  function getQueryParam(name) {
    var qs = '';
    try {
      qs = window.location && window.location.search ? window.location.search : '';
    } catch (e) {
      qs = '';
    }
    if (!qs) return null;
    if (qs.charAt(0) === '?') qs = qs.slice(1);

    var parts = qs.split('&');
    for (var i = 0; i < parts.length; i++) {
      if (!parts[i]) continue;
      var kv = parts[i].split('=');
      var k = '';
      var v = '';
      try {
        k = decodeURIComponent((kv[0] || '').replace(/\+/g, ' '));
        v = decodeURIComponent((kv[1] || '').replace(/\+/g, ' '));
      } catch (e) {
        k = kv[0] || '';
        v = kv[1] || '';
      }
      if (k === name) return v;
    }
    return null;
  }

  function isTruthy(v) {
    if (v === true) return true;
    if (v === false || v == null) return false;
    var s = String(v).toLowerCase();
    return s === '1' || s === 'true' || s === 'yes' || s === 'on';
  }

  function toInt(v, fallback) {
    var n = parseInt(v, 10);
    return isFinite(n) ? n : fallback;
  }

  function isDevHost() {
    try {
      var h = window.location && window.location.hostname ? window.location.hostname : '';
      if (!h) return false;
      if (h === 'localhost' || h === '127.0.0.1') return true;
      if (h.indexOf('.local') !== -1) return true;
      return false;
    } catch (e) {
      return false;
    }
  }

  function isDebug(container, opts) {
    if (opts && isTruthy(opts.debug)) return true;
    if (container && isTruthy(container.getAttribute('data-debug'))) return true;
    if (isTruthy(window.MCCAL_WIDGET_DEBUG)) return true;
    var q = getQueryParam('mccalWidgetDebug');
    return q != null && isTruthy(q);
  }

  function isDevMode(container, opts) {
    if (opts && isTruthy(opts.dev)) return true;
    if (container && isTruthy(container.getAttribute('data-dev'))) return true;
    if (isTruthy(window.MCCAL_WIDGET_DEV)) return true;
    var q = getQueryParam('mccalWidgetDev');
    if (q != null && isTruthy(q)) return true;
    return isDevHost();
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function clearContainer(container) {
    while (container.firstChild) container.removeChild(container.firstChild);
  }

  function renderMessage(container, kind, message, details) {
    var bg = kind === 'error' ? '#fff5f5' : '#f6f6f6';
    var border = kind === 'error' ? '#f5c2c2' : '#eee';
    var title = kind === 'error' ? 'Widget failed to load' : 'Loading widget…';
    var extra = details
      ? '<pre style="margin:10px 0 0; white-space:pre-wrap; overflow:auto;">' +
        escapeHtml(details) +
        '</pre>'
      : '';
    container.innerHTML =
      '<div style="padding:12px;background:' +
      bg +
      ';border:1px solid ' +
      border +
      ";color:#333;font-family:system-ui,-apple-system,'Segoe UI',Roboto,'Helvetica Neue',Arial;\">" +
      '<div style="font-weight:600;margin-bottom:4px;">' +
      escapeHtml(title) +
      '</div>' +
      '<div style="color:#444;">' +
      escapeHtml(message || '') +
      '</div>' +
      extra +
      '</div>';
  }

  function getFetchInit(url) {
    var init = { mode: 'cors', credentials: 'omit' };
    try {
      var u = new URL(
        url,
        window.location && window.location.href ? window.location.href : undefined,
      );
      if (window.location && u.origin === window.location.origin) {
        init.mode = 'same-origin';
        init.credentials = 'same-origin';
      }
    } catch (e) {
      // Keep defaults.
    }
    return init;
  }

  function shouldRewriteUrl(v) {
    if (!v) return false;
    if (v.charAt(0) === '#') return false;
    if (v.indexOf('//') === 0) return false;
    if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(v)) return false;
    return true;
  }

  function computeBaseUrl(url) {
    try {
      var u = new URL(url);
      return u.origin + u.pathname.replace(/\/[^/]*$/, '/');
    } catch (e) {
      return null;
    }
  }

  function buildJsDelivrUrl(repo, path, version) {
    if (!repo || !path) return null;
    // jsDelivr format: https://cdn.jsdelivr.net/gh/<owner>/<repo>@<tag-or-branch>/<path>
    var base = 'https://cdn.jsdelivr.net/gh/' + repo;
    if (version) {
      version = String(version);
      if (version.charAt(0) === '@') version = version.slice(1);
      base += '@' + version;
    }
    base += '/';
    // path may start with a leading slash — remove it for jsDelivr
    if (path.charAt(0) === '/') path = path.slice(1);
    return base + path;
  }

  function runInlineInjection(container, html, baseUrl, opts) {
    var tpl = document.createElement('template');
    tpl.innerHTML = html;

    if (opts && opts.replace) clearContainer(container);

    // Fix relative URLs for <link>, <img>, <a>, and script src when a baseUrl is provided
    if (baseUrl) {
      var elems = tpl.content.querySelectorAll('link[href], img[src], script[src], a[href]');
      forEachNode(elems, function (el) {
        var attr = el.hasAttribute('href') ? 'href' : el.hasAttribute('src') ? 'src' : 'href';
        var v = el.getAttribute(attr);
        if (v && shouldRewriteUrl(v)) {
          try {
            el.setAttribute(attr, new URL(v, baseUrl).toString());
          } catch (e) {
            /* ignore */
          }
        }
      });
    }

    // Append non-script nodes
    var childNodes = tpl.content.childNodes;
    forEachNode(childNodes, function (node) {
      if (node.tagName && node.tagName.toLowerCase() === 'script') return;
      container.appendChild(node.cloneNode(true));
    });

    // Execute scripts: inline and external
    var scripts = tpl.content.querySelectorAll('script');
    forEachNode(scripts, function (s) {
      var newScript = document.createElement('script');
      for (var i = 0; i < s.attributes.length; i++) {
        var a = s.attributes[i];
        newScript.setAttribute(a.name, a.value);
      }
      if (s.src) {
        var src = s.getAttribute('src');
        if (baseUrl && src && shouldRewriteUrl(src)) {
          try {
            newScript.src = new URL(src, baseUrl).toString();
          } catch (e) {
            newScript.src = s.src;
          }
        } else {
          newScript.src = s.src;
        }
      } else {
        newScript.textContent = s.textContent || s.innerText || '';
      }
      container.appendChild(newScript);
    });
  }

  function insertIframe(container, url, opts) {
    if (opts && opts.replace) clearContainer(container);
    var iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.style.width = '100%';
    iframe.style.border = '0';
    iframe.style.display = 'block';
    iframe.setAttribute('loading', 'lazy');
    iframe.setAttribute('referrerpolicy', 'no-referrer');
    container.appendChild(iframe);
  }

  function fetchText(url, timeoutMs, cacheEnabled) {
    if (!url) return Promise.reject(new Error('Missing URL'));

    if (cacheEnabled !== false && textCache[url]) {
      stats.cacheHits++;
      return Promise.resolve(textCache[url]);
    }

    if (inFlight[url]) {
      stats.deduped++;
      return inFlight[url];
    }

    stats.requests++;
    var started = nowMs();
    var controller = null;
    var timer = null;
    var init = getFetchInit(url);

    if (typeof AbortController !== 'undefined') {
      controller = new AbortController();
      init.signal = controller.signal;
    }
    if (controller && timeoutMs && timeoutMs > 0) {
      timer = setTimeout(function () {
        try {
          controller.abort();
        } catch (e) {
          /* ignore */
        }
      }, timeoutMs);
    }

    var p = fetch(url, init)
      .then(function (resp) {
        if (!resp.ok) throw new Error('Fetch failed: ' + resp.status);
        return resp.text();
      })
      .then(
        function (text) {
          if (timer) clearTimeout(timer);
          delete inFlight[url];
          if (cacheEnabled !== false) textCache[url] = text;
          globalState.lastMs = nowMs() - started;
          return text;
        },
        function (err) {
          if (timer) clearTimeout(timer);
          delete inFlight[url];
          throw err;
        },
      );

    inFlight[url] = p;
    return p;
  }

  function fetchAndInject(container, url, fallback, opts) {
    var timeoutMs = (opts && opts.timeoutMs) || 10000;
    var cacheEnabled = opts && typeof opts.cache === 'boolean' ? opts.cache : true;
    var baseForRelative = computeBaseUrl(url);

    return fetchText(url, timeoutMs, cacheEnabled)
      .then(function (html) {
        runInlineInjection(container, html, baseForRelative, opts);
        return true;
      })
      .catch(function (err) {
        if (!fallback) throw err;
        var fbBase = computeBaseUrl(fallback);
        return fetchText(fallback, timeoutMs, cacheEnabled)
          .then(function (html) {
            runInlineInjection(container, html, fbBase, opts);
            return true;
          })
          .catch(function () {
            throw err;
          });
      });
  }

  function resolveWidgetUrl(container, opts) {
    var dev = isDevMode(container, opts);

    var devSrc =
      (opts && opts.devSrc) || (container && container.getAttribute('data-dev-src')) || null;
    var directSrc = (opts && opts.src) || (container && container.getAttribute('data-src')) || null;

    if (dev && devSrc) return devSrc;
    if (directSrc) return directSrc;

    var repo = (opts && opts.repo) || (container && container.getAttribute('data-repo'));
    var path = (opts && opts.path) || (container && container.getAttribute('data-path'));
    var version = (opts && opts.version) || (container && container.getAttribute('data-version'));

    if (repo && path) return buildJsDelivrUrl(repo, path, version);
    return null;
  }

  function initOne(container, opts) {
    if (!container) return Promise.resolve();

    opts = opts || {};
    var force = !!opts.force;

    if (container.__mccalCdnLoadState === 'loading' && !force) return Promise.resolve();
    if (container.__mccalCdnLoadState === 'loaded' && !force) return Promise.resolve();
    if (container.__mccalCdnLoaded && !force) return Promise.resolve();

    container.__mccalCdnLoaded = true;
    container.__mccalCdnLoadState = 'loading';
    if (!container.__mccalCdnStartedAt) container.__mccalCdnStartedAt = nowMs();

    var debug = isDebug(container, opts);
    var fallback = opts.fallback || container.getAttribute('data-fallback');
    var mode = (opts.mode || container.getAttribute('data-mode') || 'inline').toLowerCase();
    var replace = isTruthy(
      opts.replace != null ? opts.replace : container.getAttribute('data-replace'),
    );
    var timeoutMs = toInt(opts.timeoutMs || container.getAttribute('data-timeout-ms'), 10000);
    var cacheAttr = container.getAttribute('data-cache');
    var cacheEnabled =
      typeof opts.cache === 'boolean'
        ? opts.cache
        : !(cacheAttr && String(cacheAttr).toLowerCase() === 'false');

    var url = resolveWidgetUrl(container, opts);
    if (!url && !fallback) {
      renderMessage(
        container,
        'error',
        'Widget configuration missing. Provide data-src OR data-repo + data-path.',
        debug ? 'loader=' + LOADER_VERSION : null,
      );
      container.__mccalCdnLoadState = 'error';
      return Promise.resolve();
    }

    container.setAttribute('data-widget-loader', 'jsdelivr-loader@' + LOADER_VERSION);
    container.setAttribute('data-widget-mode', mode);
    if (url) container.setAttribute('data-widget-src', url);
    if (fallback) container.setAttribute('data-widget-fallback', fallback);

    if (mode === 'iframe') {
      insertIframe(container, url || fallback, { replace: replace });
      container.__mccalCdnLoadState = 'loaded';
      return Promise.resolve();
    }

    return fetchAndInject(container, url, fallback, {
      replace: replace,
      timeoutMs: timeoutMs,
      cache: cacheEnabled,
    })
      .then(function () {
        container.__mccalCdnLoadState = 'loaded';
        container.setAttribute(
          'data-widget-load-ms',
          String(nowMs() - container.__mccalCdnStartedAt),
        );
      })
      .catch(function (err) {
        stats.failures++;
        container.__mccalCdnLoadState = 'error';
        if (debug) {
          try {
            console.warn('McCalJsDelivrWidgetLoader: failed to load widget', {
              url: url,
              fallback: fallback,
              mode: mode,
              replace: replace,
              timeoutMs: timeoutMs,
              error: err,
            });
          } catch (e) {
            console.warn('McCalJsDelivrWidgetLoader: failed to load widget', err);
          }
        }
        renderMessage(container, 'error', 'Widget failed to load.', debug ? String(err) : null);
      });
  }

  function initAll(selector, opts) {
    selector = selector || '.mccal-widget, [data-cdn-widget]';
    var nodes = document.querySelectorAll(selector);
    forEachNode(nodes, function (n) {
      initOne(n, opts);
    });
  }

  var API = {
    loadInto: function (selectorOrNode, opts) {
      if (typeof selectorOrNode === 'string') return initAll(selectorOrNode, opts);
      if (selectorOrNode && selectorOrNode.nodeType) return initOne(selectorOrNode, opts);
      return initAll('.mccal-widget, [data-cdn-widget]', opts);
    },
    reloadInto: function (selectorOrNode, opts) {
      opts = opts || {};
      opts.force = true;
      return this.loadInto(selectorOrNode, opts);
    },
    version: LOADER_VERSION,
    getStats: function () {
      return {
        version: LOADER_VERSION,
        requests: stats.requests,
        deduped: stats.deduped,
        cacheHits: stats.cacheHits,
        failures: stats.failures,
        lastMs: globalState.lastMs,
      };
    },
  };

  window.McCalJsDelivrWidgetLoader = window.McCalJsDelivrWidgetLoader || API;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      API.loadInto('.mccal-widget, [data-cdn-widget]');
    });
  } else {
    API.loadInto('.mccal-widget, [data-cdn-widget]');
  }
})();
