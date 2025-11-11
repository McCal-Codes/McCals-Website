// McCal CDN/jsDelivr Widget Loader
// Finds elements with class `mccal-widget` and attributes `data-repo`, `data-path`, `data-version`, `data-fallback`
// Usage (example):
// <div class="mccal-widget" data-repo="McCal-Codes/McCals-Website" data-path="src/widgets/example/versions/v1.0.0.html" data-version="v1.0.0" data-mode="inline" data-fallback="/src/widgets/example/versions/v1.0.0.html"></div>
(function(){
  'use strict';

  function buildJsDelivrUrl(repo, path, version){
    if(!repo || !path) return null;
    var base = 'https://cdn.jsdelivr.net/gh/' + repo + '/';
    if(version) base += encodeURIComponent(version) + '/';
    // path may start with a leading slash — remove it for jsDelivr
    if(path.charAt(0) === '/') path = path.slice(1);
    return base + path;
  }

  function runInlineInjection(container, html, baseUrl){
    var tpl = document.createElement('template');
    tpl.innerHTML = html;

    // Fix relative URLs for <link>, <img>, <a>, and script src when a baseUrl is provided
    if(baseUrl){
      var elems = tpl.content.querySelectorAll('link[href], img[src], script[src], a[href]');
      elems.forEach(function(el){
        var attr = el.hasAttribute('href') ? 'href' : (el.hasAttribute('src') ? 'src' : 'href');
        var v = el.getAttribute(attr);
        if(v && v.indexOf('://') === -1 && v.indexOf('//') !== 0 && v.charAt(0) !== '#'){
          // convert relative path to absolute based on baseUrl
          try{ el.setAttribute(attr, new URL(v, baseUrl).toString()); } catch(e){}
        }
      });
    }

    // Append non-script nodes
    Array.prototype.slice.call(tpl.content.childNodes).forEach(function(node){
      if(node.tagName && node.tagName.toLowerCase() === 'script') return;
      container.appendChild(node.cloneNode(true));
    });

    // Execute scripts: inline and external
    var scripts = tpl.content.querySelectorAll('script');
    scripts.forEach(function(s){
      var newScript = document.createElement('script');
      // copy attributes
      for(var i=0;i<s.attributes.length;i++){ var a = s.attributes[i]; newScript.setAttribute(a.name,a.value); }
      if(s.src){
        // make absolute if needed
        var src = s.getAttribute('src');
        if(baseUrl && src && src.indexOf('://') === -1 && src.charAt(0) !== '/'){
          try{ src = new URL(src, baseUrl).toString(); newScript.src = src; } catch(e){ newScript.src = s.src; }
        } else {
          newScript.src = s.src;
        }
      } else {
        newScript.textContent = s.textContent || s.innerText || '';
      }
      // Append to container so it executes in document context
      container.appendChild(newScript);
    });
  }

  function insertIframe(container, url){
    var iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.style.width = '100%';
    iframe.style.border = '0';
    iframe.setAttribute('loading','lazy');
    iframe.setAttribute('referrerpolicy','no-referrer');
    container.appendChild(iframe);
  }

  function fetchAndInject(container, url, fallback){
    var baseForRelative = null;
    try{ baseForRelative = new URL(url).origin + new URL(url).pathname.replace(/\/[^/]*$/, '/'); }catch(e){ baseForRelative = null; }
    return fetch(url, {mode:'cors'}).then(function(resp){
      if(!resp.ok) throw new Error('Fetch failed: ' + resp.status);
      return resp.text();
    }).then(function(html){
      runInlineInjection(container, html, baseForRelative);
      return true;
    }).catch(function(err){
      // try fallback
      if(fallback){
        return fetch(fallback, {mode:'same-origin'}).then(function(r){ if(!r.ok) throw new Error('Fallback fetch failed'); return r.text(); }).then(function(html){ runInlineInjection(container, html); return true; });
      }
      throw err;
    });
  }

  function initOne(container){
    if(!container || container.__mccalCdnLoaded) return;
    container.__mccalCdnLoaded = true;

    // Allow two modes of configuration: compact data-src (full URL) OR data-repo+data-path(+data-version)
    var directSrc = container.getAttribute('data-src');
    var repo = container.getAttribute('data-repo');
    var path = container.getAttribute('data-path');
    var version = container.getAttribute('data-version');
    var fallback = container.getAttribute('data-fallback');
    var mode = (container.getAttribute('data-mode') || 'inline').toLowerCase();

    var url = directSrc || (repo && path ? buildJsDelivrUrl(repo, path, version) : null);
    if(!url && !fallback){
      container.innerHTML = '<div style="padding:18px;color:#666">Widget configuration missing (data-src or data-repo+data-path required).</div>';
      return Promise.resolve();
    }

    if(mode === 'iframe'){
      // prefer direct url; if missing, use fallback
      insertIframe(container, url || fallback);
      return Promise.resolve();
    }

    // Inline mode: fetch and inject
    return fetchAndInject(container, url, fallback).catch(function(err){
      console.warn('McCalJsDelivrWidgetLoader: failed to load widget - jsdelivr-loader.js:116', err);
      container.innerHTML = '<div style="padding:18px;color:#666">Widget failed to load.</div>';
    });
  }

  function initAll(selector){
    selector = selector || '.mccal-widget';
    var nodes = document.querySelectorAll(selector);
    nodes = Array.prototype.slice.call(nodes);
    nodes.forEach(initOne);
  }

  // public API
  var API = {
    loadInto: function(selectorOrNode, opts){
      if(typeof selectorOrNode === 'string') return initAll(selectorOrNode);
      if(selectorOrNode && selectorOrNode.nodeType) return initOne(selectorOrNode);
      return initAll('.mccal-widget');
    }
  };

  // expose
  window.McCalJsDelivrWidgetLoader = window.McCalJsDelivrWidgetLoader || API;

  // auto-init when script loads (non-blocking)
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){ API.loadInto('.mccal-widget'); });
  } else { API.loadInto('.mccal-widget'); }

})();
