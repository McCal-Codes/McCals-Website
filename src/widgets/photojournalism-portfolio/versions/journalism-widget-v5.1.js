// journalism-widget-v5.1.js
console.log("[DEBUG] Widget JS loaded - journalism-widget-v5.1.js:2");
if (typeof window === "undefined" || typeof document === "undefined") {
  // Node.js or non-browser environment
  console.error("ERROR:  must be run in a browser (DOM environment). - journalism-widget-v5.1.js:5");
  if (typeof process !== "undefined" && process.exit) process.exit(1);
}

// v5.1 Implementation (restored from v4.9)
(function(){
  const CFG={RAW:`https://raw.githubusercontent.com/McCal-Codes/McCals-Website/main/`,MANIFEST_PATH:`src/images/Portfolios/Journalism/journalism-manifest.json`,VERSION:'5.1'};
  let DEBUG=false, BUST=0, manifestGenerated='';
  let cacheBase='journalism-manifest-cache-v5_1';
  const sel=s=>document.querySelector(s); const all=s=>Array.prototype.slice.call(document.querySelectorAll(s));
  const encodePath=path=>path.split('/').map(segment=>encodeURIComponent(segment)).join('/');
  const normalizeFolder=value=>value?value.replace(/^\/+/g,'').replace(/\/+$/g,''):'';
  const resolveImagePath=(event,image)=>{
    if(!image) return '';
    const raw=(image.path||image.src||image.url||image.filename||'').trim();
    if(!raw) return '';
    if(/^https?:\/\//i.test(raw)) return raw;
    let relative=raw.replace(/^\.?\//,'');
    if(relative.startsWith('src/')){
      return `${CFG.RAW}${encodePath(relative)}`;
    }
    if(relative.includes('/')){
      return `${CFG.RAW}src/images/Portfolios/Journalism/${encodePath(relative)}`;
    }
    const folder=normalizeFolder(image.folderPath||event.folderPath||'');
    const composed=folder?`${folder}/${relative}`:relative;
    return `${CFG.RAW}src/images/Portfolios/Journalism/${encodePath(composed)}`;
  };
  const grid=sel('#journalismGrid'), loading=sel('#journalismLoading');
  console.log("[DEBUG] DOM elements: - journalism-widget-v5.1.js:34", {grid, loading});
  const dbg={panel:sel('#debugInfo'),status:sel('#debugStatus'),load:sel('#debugLoadTime'),ev:sel('#debugEventCount'),img:sel('#debugImageCount'),api:sel('#debugApiCalls'),last:sel('#debugLastRefresh'),gen:sel('#debugGenerated'),b:sel('#debugBust'),logsBtn:sel('#dbgLogs')};
  let metrics={start:performance.now(),api:0,events:0,images:0,last:'Never'};
  function log(){if(!DEBUG)return; try{console.log.apply(console,['[Journalism v5.1]'].concat([].slice.call(arguments)))}catch(e){}}
  function setText(el,v){if(!el)return; el.textContent=v}
  function showChangelog(){const m=sel('#changelogModal'); if(m){m.classList.add('active'); document.body.style.overflow='hidden'}}
  function hideChangelog(){const m=sel('#changelogModal'); if(m){m.classList.remove('active'); document.body.style.overflow=''}}
  window.showChangelog=showChangelog; window.hideChangelog=hideChangelog;
  console.log('[DEBUG] window.showChangelog: - journalism-widget-v5.1.js:42', typeof window.showChangelog, 'window.hideChangelog:', typeof window.hideChangelog);
  document.addEventListener('click',e=>{if(e.target&&e.target.id==='changelogModal')hideChangelog()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){ if(document.documentElement.classList.contains('lb-open')) closeLB(); else hideChangelog(); }});
  function cacheKey(){return cacheBase+(manifestGenerated?('::'+manifestGenerated):'')}
  function getCache(){try{const raw=localStorage.getItem(cacheKey()); if(!raw)return null; const d=JSON.parse(raw); if(Date.now()-d.t < 10*60*1000) return d.m;}catch(e){} return null}
  function setCache(m){try{localStorage.setItem(cacheKey(),JSON.stringify({m,t:Date.now()}))}catch(e){}}
  function clearCache(){try{Object.keys(localStorage).filter(k=>k.startsWith(cacheBase)).forEach(k=>localStorage.removeItem(k))}catch(e){}}
  function manifestUrl(){let u=CFG.RAW+CFG.MANIFEST_PATH; if(BUST) u += (u.includes('?')?'&':'?')+'b='+BUST; return u}
  async function fetchManifest(force){
    if(force)BUST=Date.now();
    let cached=!force&&getCache();
    if(cached){log('cache hit'); return cached;}
    metrics.api++;
    const url=manifestUrl();
    console.log("[DEBUG] Fetching manifest from - journalism-widget-v5.1.js:56", url);
    log('fetch',url);
    const txt=await fetch(url,{cache:'no-store'}).then(r=>{if(!r.ok) throw new Error('HTTP '+r.status); return r.text()});
    const json=JSON.parse(txt);
    console.log("[DEBUG] Manifest loaded - journalism-widget-v5.1.js:60", json);
    if(!json || !Array.isArray(json.events)) throw new Error('Bad manifest shape');
    manifestGenerated=json.generated||'';
    setCache(json);
    return json;
  }
  function shuffle(a){for(let i=a.length-1;i>0;i--){let j=(Math.random()*(i+1))|0; [a[i],a[j]]=[a[j],a[i]]} return a}
  function buildCard(ev){
    console.log("[DEBUG] Building card for event: - journalism-widget-v5.1.js:68", ev.eventName, ev);
    const card=document.createElement('article'); card.className='journalism-card loading'; card.tabIndex=0; 
    const isPublished = ev.tags && ev.tags.includes('Published Work');
    card.dataset.category = ev.category||'Other';
    card.dataset.published = isPublished ? 'true' : 'false';
    const img=document.createElement('img'); img.loading='lazy'; img.decoding='async'; img.alt=ev.eventName+' journalism photos'; const info=document.createElement('div'); info.className='journalism-info'; info.innerHTML=`<h3 class="journalism-title">${ev.eventName}</h3><p class="journalism-meta">${ev.dateDisplay} • ${ev.category}</p>`; 
    if(isPublished){const b=document.createElement('div'); b.className='published-badge'; b.textContent='•'; card.appendChild(b)} 
    if(ev.totalImages>1){const c=document.createElement('div'); c.className='image-count-badge'; c.textContent=ev.totalImages+' photos'; card.appendChild(c);}
    card.appendChild(img); card.appendChild(info);
  const open=()=>{console.log('[DEBUG] openLB called for - journalism-widget-v5.1.js:77', ev); openLB(ev);};
  card.addEventListener('click - journalism-widget-v5.1.js:78',()=>{console.log('[DEBUG] Card clicked for', ev.eventName); open();});
  card.addEventListener('keydown - journalism-widget-v5.1.js:79',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();console.log('[DEBUG] Card keydown for', ev.eventName); open();}});
    console.log('[DEBUG] buildCard created card for - journalism-widget-v5.1.js:80', ev.eventName, 'with click listener:', !!card.onclick);
    const thumbUrl=resolveImagePath(ev,ev.thumbnail);
    console.log('[DEBUG] Resolved thumbnail URL for - journalism-widget-v5.1.js:82', ev.eventName, ':', thumbUrl);
    if(thumbUrl){img.onload=()=>{card.classList.remove('loading'); card.classList.add('loaded')}; img.onerror=()=>{card.classList.remove('loading'); card.classList.add('error')}; img.src=thumbUrl;} else {card.classList.remove('loading'); card.classList.add('error')}
    return card;
  }
  function openLB(ev){
    console.log('[DEBUG] openLB triggered for - journalism-widget-v5.1.js:87', ev.eventName, 'images:', ev.images);
    const lb=sel('#journalismLightbox'), gal=sel('#jlGallery');
    if(!lb||!gal){console.log('[DEBUG] Lightbox or gallery element missing! - journalism-widget-v5.1.js:89'); return;}
    gal.innerHTML='<div class="jl-hint">Scroll Up/Down</div>';
    (ev.images||[]).forEach((it,i)=>{
      const url=resolveImagePath(ev,it);
      console.log('[DEBUG] Lightbox image - journalism-widget-v5.1.js:93', i, 'url:', url, 'image:', it);
      const im=new Image(); im.loading='lazy'; im.alt=ev.eventName+' - '+(i+1); im.classList.add('loading'); im.onload=()=>{im.classList.remove('loading'); im.classList.add('loaded')}; im.onerror=()=>{im.classList.remove('loading'); im.classList.add('error'); im.alt='Image failed'}; im.src=url; gal.appendChild(im);
    });
    sel('#jlLbTitle').textContent=ev.eventName;
    sel('#jlLbMeta').textContent=`${ev.dateDisplay} • ${ev.category} • ${ev.totalImages} images`;
    lb.classList.add('is-open');
    lb.setAttribute('aria-hidden','false');
  }

  // --- v4.9 controls and init ---
  function closeLB(){const lb=sel('#journalismLightbox'); if(lb){lb.classList.remove('is-open'); lb.setAttribute('aria-hidden','true'); document.documentElement.classList.remove('lb-open'); document.body.style.overflow='';}}
  document.addEventListener('click',e=>{if(e.target.closest('.jl-close')||e.target.id==='journalismLightbox') closeLB()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape') closeLB()});
  function applyFilter(val){all('.journalism-card').forEach(c=>{
    const show = (val==='*') || c.dataset.category===val || (val==='Published' && c.dataset.published==='true');
    c.classList.toggle('is-hidden',!show)
  }); log('filter',val)}
  all('.filter-btn').forEach(btn=>btn.addEventListener('click',()=>{all('.filter-btn').forEach(b=>b.setAttribute('aria-pressed','false')); btn.setAttribute('aria-pressed','true'); applyFilter(btn.dataset.filter||'*')}));
  function toggleDebug(){const p=dbg.panel; if(!p)return; p.classList.toggle('active'); if(p.classList.contains('active')) updateDbg(); }
  window.toggleDebug=toggleDebug;
  function updateDbg(){setText(dbg.load,Math.round(performance.now()-metrics.start)); setText(dbg.ev,metrics.events); setText(dbg.img,metrics.images); setText(dbg.api,metrics.api); setText(dbg.last,metrics.last); setText(dbg.gen,manifestGenerated||''); setText(dbg.b,BUST||'--'); }
  function buildEventModel(manifest){return manifest.events.map(ev=>{const sh=shuffle(ev.images.slice()); return {...ev,thumbnail:sh[0]||ev.images[0]};})}
  async function build(force){metrics.start=performance.now(); loading.style.display='flex'; grid.style.display='none'; try{const data=await fetchManifest(force); metrics.last=new Date().toLocaleTimeString(); const model=buildEventModel(data); metrics.events=model.length; metrics.images=model.reduce((s,e)=>s+(e.totalImages||e.images.length||0),0); grid.innerHTML=''; const frag=document.createDocumentFragment(); model.forEach(ev=>frag.appendChild(buildCard(ev))); grid.appendChild(frag); setTimeout(()=>{loading.style.display='none'; grid.style.display='block'; grid.classList.add('loaded'); updateDbg(); setText(dbg.status,'OK')},160);}catch(err){setText(dbg.status,'Error'); loading.innerHTML='<span style="color:var(--accent);font-weight:700">'+err.message+'</span>'; loading.style.display='flex'; grid.innerHTML=''; grid.style.display='none';}}
  // controls
  sel('#dbgForce')&&sel('#dbgForce').addEventListener('click',()=>{build(true)});
  sel('#dbgBust')&&sel('#dbgBust').addEventListener('click',()=>{clearCache(); BUST=Date.now(); build(true)});
  sel('#dbgClear')&&sel('#dbgClear').addEventListener('click',()=>{clearCache(); build(true)});
  sel('#dbgLogs')&&sel('#dbgLogs').addEventListener('click',()=>{DEBUG=!DEBUG; sel('#dbgLogs').textContent=DEBUG?'Logs On':'Logs Off'});
  sel('#dbgTests')&&sel('#dbgTests').addEventListener('click',()=>{console.log('[v4.9 tests] start'); console.log('cards',all('.journalism-card').length);});
  // auto refresh
  const AUTO=15*60*1000; let timer; 
  function schedule(){clearTimeout(timer); timer=setTimeout(()=>{build(true); schedule();},AUTO);} schedule();
  // init
  build(false);

})();
