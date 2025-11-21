# Widget Development Tutorial Series — Part 2: Performance Engineering

> Focus: Optimize load, interaction smoothness, and resource usage.
> Pre-req: Part 1 scaffold in place.

---
## 1. Critical CSS & Deferral
- Inline only what's needed for first viewport render.
- Defer non-critical style blocks via async JS injection if size grows. (Keep simple initially.)

## 2. Observer Discipline
Use one IntersectionObserver per major concern:
```js
const revealObserver = new IntersectionObserver(entries => {
  for (const e of entries) {
    if (e.isIntersecting) {
      e.target.classList.add('loaded');
      revealObserver.unobserve(e.target);
    }
  }
});
```
Attach eagerly; never create new observer instances per item.

## 3. Lazy Image Pattern
```html
<img data-src="img/example.jpg" alt="Example" class="lazy" loading="lazy" decoding="async">
<script>
(function(){
  const imgs=[...document.querySelectorAll('.lazy')];
  const io=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){
    const el=e.target; el.src=el.dataset.src; el.removeAttribute('data-src'); io.unobserve(el); }});});
  imgs.forEach(i=>io.observe(i));
})();
</script>
```

## 4. Structured Data Injection (Deferred)
```js
function injectSchemaOnce(data){
  if(document.getElementById('structured-data')) return;
  const script=document.createElement('script');
  script.type='application/ld+json';
  script.id='structured-data';
  script.textContent=JSON.stringify({
    '@context':'https://schema.org', '@type':'ImageGallery', name:data.title, image:data.images.slice(0,24)
  });
  document.head.appendChild(script);
}
// TODO: Call after first batch renders
```

## 5. Caching Strategy
LocalStorage time-boxed cache:
```js
const KEY='widget-cache-v1'; const TTL=10*60*1000;
function getCache(){try{const o=JSON.parse(localStorage.getItem(KEY)||'null'); if(o&&Date.now()-o.t<TTL) return o.d;}catch{} return null;}
function setCache(d){try{localStorage.setItem(KEY,JSON.stringify({t:Date.now(),d}));}catch{}}
```

## 6. Micro-Performance Checklist
- [ ] Batch DOM writes (use fragments)
- [ ] Avoid layout thrash (read first, write after)
- [ ] Use `requestAnimationFrame` for animation state changes
- [ ] Keep JS payload lean (remove debug logs for production)

## 7. Metrics Capture (Planned)
- TODO: Integrate lighthouse snapshot script.
- TODO: Add automated FCP/LCP/TBT recording.

## 8. Common Mistakes
- Multiple observers per item → memory & overhead
- Per-image schema injection → large parse cost
- Unthrottled scroll/resize handlers

## 9. Next Steps
Proceed to Part 3 for accessibility hardening.

---
*Last updated: 2025-11-19*
