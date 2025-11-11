// McCal Media — Embed loader
// Supports two modes:
//  - iframe: inserts an iframe with the provided URL (safe, scripts run in iframe)
//  - inline: fetches HTML and rehydrates <script> tags so they execute when injected
// Usage: add <div class="mccal-widget" data-src="URL" data-mode="inline|iframe"></div>
(function(){
  'use strict';
  function runInlineInjection(container, html){
    // Parse with template to preserve nodes
    var tpl = document.createElement('template');
    tpl.innerHTML = html;
    // Append non-script nodes
    Array.prototype.slice.call(tpl.content.childNodes).forEach(function(node){
      if(node.tagName && node.tagName.toLowerCase()==='script') return;
      container.appendChild(node.cloneNode(true));
    });
    // Execute scripts: inline and external
    var scripts = tpl.content.querySelectorAll('script');
    scripts.forEach(function(s){
      var newScript = document.createElement('script');
      // copy attributes
      for(var i=0;i<s.attributes.length;i++){ var a = s.attributes[i]; newScript.setAttribute(a.name,a.value); }
      if(s.src){
        newScript.src = s.src;
      } else {
        // Inline script: set textContent
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
    container.appendChild(iframe);
  }

  function initOne(container){
    if(!container || container.__mccalLoaded) return;
    container.__mccalLoaded = true;
    var src = container.getAttribute('data-src');
    if(!src) return;
    var mode = (container.getAttribute('data-mode') || 'inline').toLowerCase();
    if(mode === 'iframe'){
      insertIframe(container, src);
      return;
    }
    // Inline mode
    fetch(src, {mode: 'cors'}).then(function(resp){
      if(!resp.ok) throw new Error('Fetch failed: ' + resp.status);
      return resp.text();
    }).then(function(html){
      try{
        runInlineInjection(container, html);
      }catch(e){
        container.innerHTML = '<div style="padding:18px;color:#666">Widget load error.</div>';
        console.error('embedloader inline injection error - embed-loader.js:62', e);
      }
    }).catch(function(err){
      console.warn('embedloader failed to fetch - embed-loader.js:65', err);
      container.innerHTML = '<div style="padding:18px;color:#666">Widget failed to load.</div>';
    });
  }

  function initAll(){
    var widgets = document.querySelectorAll('.mccal-widget[data-src]');
    widgets = Array.prototype.slice.call(widgets);
    widgets.forEach(initOne);
  }

  // expose small API
  window.McCal = window.McCal || {};
  window.McCal.embedLoaderInit = initAll;

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', initAll);
  } else { initAll(); }
})();
