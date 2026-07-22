const CACHE_NAME = 'dsu-knotspot-v1';
const ASSETS = [
  'index.html',
  'manifest.json',
  'static/css/style.css',
  'static/js/db.js',
  'static/js/app.js',
  'static/js/firebase-config.js',
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
      return cache.addAll(ASSETS);
    })
  );
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
});

// Cache falling back to network strategy
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return cachedResponse || fetch(e.request).catch(() => {
        // Fallback for offline pages if needed
      });
    })
  );
});
