/*
 * jsDelivr Widget Loader
 *  - Loads HTML/JS/CSS fragments from jsDelivr (GitHub) into the page
 *  - Non-destructive: will inject into a target container and fall back to a local path if CDN fetch fails
 *  - Usage (example):
 *    <div class="mccal-widget" data-repo="McCal-Codes/McCals-Website" data-path="src/widgets/my-widget/versions/v1.2.0-my-widget.html" data-version="v1.2.0"></div>
 *    <script src="/src/widgets/cdn/jsdelivr-loader.js" async></script>
 *
 *  Or load loader itself from jsDelivr once published:
 *    <script src="https://cdn.jsdelivr.net/gh/McCal-Codes/McCals-Website@main/src/widgets/cdn/jsdelivr-loader.js" async></script>
 *
 * The loader finds elements with class `mccal-widget` (or `data-cdn-widget`) and replaces their contents
 * with the fetched HTML. The original element is preserved (nondestructive) and used as the injection root.
 */
(function () {
  'use strict';

  var SELECTOR = '[data-cdn-widget], .mccal-widget';

  function qs(el, sel) { return (el || document).querySelector(sel); }
  function qsa(el, sel) { return (el || document).querySelectorAll(sel); }

  function buildJsDelivrUrl(repo, filePath, version) {
    // repo: owner/repo
    // filePath: path inside repo
    // version: tag/commit (optional)
    var v = version ? '@' + version : '';
    return 'https://cdn.jsdelivr.net/gh/' + repo + v + '/' + filePath;
  }

  function safeInsertHTML(container, html) {
    // Insert nodes, execute scripts, keep original container element (nondestructive)
    container.innerHTML = html;

    // Execute scripts safely: replace <script> with new script elements to run them.
    var scripts = container.querySelectorAll('script');
    Array.prototype.forEach.call(scripts, function (oldScript) {
      var script = document.createElement('script');
      // copy attributes
      for (var i = 0; i < oldScript.attributes.length; i++) {
        var attr = oldScript.attributes[i];
        script.setAttribute(attr.name, attr.value);
      }
      var text = oldScript.textContent;
      // remove original before executing to avoid double-run in some environments
      var parent = oldScript.parentNode;
      if (parent) parent.removeChild(oldScript);
      if (text) script.text = text;
      parent && parent.appendChild(script);
    });
  }

  function fetchText(url, timeoutMs) {
    timeoutMs = timeoutMs || 8000;
    return new Promise(function (resolve, reject) {
      var didTimeout = false;
      var timer = setTimeout(function () {
        didTimeout = true;
        reject(new Error('Timeout loading ' + url));
      }, timeoutMs);

      fetch(url, { credentials: 'omit', cache: 'force-cache' }).then(function (res) {
        clearTimeout(timer);
        if (didTimeout) return;
        if (!res.ok) return reject(new Error('Fetch failed ' + res.status + ' ' + url));
        res.text().then(resolve, reject);
      }, function (err) {
        clearTimeout(timer);
        if (didTimeout) return;
        reject(err);
      });
    });
  }

  function processElement(el) {
    var repo = el.getAttribute('data-repo');
    var path = el.getAttribute('data-path') || el.getAttribute('data-file');
    var version = el.getAttribute('data-version');
    var fallback = el.getAttribute('data-fallback'); // local path

    if (!repo || !path) {
      // nothing to do
      return;
    }

    var cdnUrl = buildJsDelivrUrl(repo, path, version);

    fetchText(cdnUrl).then(function (html) {
      safeInsertHTML(el, html);
    }).catch(function (err) {
      // on any failure, attempt fallback to local path if provided
      console.warn('jsDelivr loader: cdn fetch failed for - jsdelivr-loader.js:92', cdnUrl, err && err.message);
      if (fallback) {
        fetchText(fallback).then(function (html) {
          safeInsertHTML(el, html);
        }).catch(function (err2) {
          console.error('jsDelivr loader: fallback fetch failed for - jsdelivr-loader.js:97', fallback, err2 && err2.message);
        });
      }
    });
  }

  function init() {
    try {
      var els = qsa(document, SELECTOR);
      if (!els || els.length === 0) return;
      Array.prototype.forEach.call(els, function (el) { processElement(el); });
    } catch (e) {
      console.error('jsDelivr loader init error - jsdelivr-loader.js:109', e && e.message);
    }
  }

  // Initialize on DOMContentLoaded or immediately if ready
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(init, 0);
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }

  // Expose helper for programmatic use
  window.McCalJsDelivrWidgetLoader = {
    buildUrl: buildJsDelivrUrl,
    loadInto: function (elementOrSelector, options) {
      var el = typeof elementOrSelector === 'string' ? qs(document, elementOrSelector) : elementOrSelector;
      if (!el) throw new Error('No element');
      if (options && options.repo) el.setAttribute('data-repo', options.repo);
      if (options && options.path) el.setAttribute('data-path', options.path);
      if (options && options.version) el.setAttribute('data-version', options.version);
      if (options && options.fallback) el.setAttribute('data-fallback', options.fallback);
      processElement(el);
    }
  };

})();
