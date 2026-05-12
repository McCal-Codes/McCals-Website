const CACHE_NAME = 'mcc-media-cache-v1';
const CACHE_VERSION = '1.0.0';

self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => {
    console.log('Cache opened:', cache);
    return cache.put(CACHE_VERSION, new Response('Service Worker installed'));
  }));
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cacheResponse) => {
      if (cacheResponse) {
        return cacheResponse.match(event.request).then((response) => {
          return response || fetch(event.request);
        });
      } else {
        return fetch(event.request);
      }
    })
  );
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
  event.claim();
});
