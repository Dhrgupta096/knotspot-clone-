const CACHE_NAME = 'dsu-knotspot-v2';
const ASSETS = [
  'index.html',
  'manifest.json',
  'static/css/style.css',
  'static/js/theme.js',
  'static/js/db.js',
  'static/js/app.js',
  'static/js/firebase-config.js',
  'static/images/favicon.png',
  'confessions/index.html',
  'knots/index.html',
  'roomfinder/index.html',
  'events/index.html'
];

// Install Service Worker
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('SW Caching static assets');
      return cache.addAll(ASSETS).catch(err => {
        console.warn('Some assets could not be pre-cached:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate Service Worker
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('SW Clearing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Network-first falling back to cache
self.addEventListener('fetch', (e) => {
  if (e.request.url.includes('/api/')) {
    return; // Don't cache dynamic API requests
  }

  e.respondWith(
    fetch(e.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && e.request.method === 'GET') {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(e.request);
      })
  );
});
