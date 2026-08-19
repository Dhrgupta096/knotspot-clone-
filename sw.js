/* ==========================================================================
   DSU KnotSpot Service Worker (v2.1)
   Strategies:
   - Navigation (HTML): Network-First with Cache Fallback (prevents stale deploys)
   - Static Assets (CSS, JS, Fonts): Stale-While-Revalidate (instant loads + background updates)
   - API Requests (/api/): Direct Network (no stale API data)
   ========================================================================== */

const CACHE_NAME = 'dsu-knotspot-v2.2';

// Dynamic base resolution for GitHub Pages (/knotspot-clone-/) vs Root Domains (/)
const getScopePath = (rel) => {
  const scope = self.registration.scope;
  return new URL(rel, scope).pathname;
};

const RELATIVE_ASSETS = [
  '',
  'index.html',
  'manifest.json',
  'static/css/style.css',
  'static/js/theme.js',
  'static/js/db.js',
  'static/js/app.js',
  'static/js/moderation.js',
  'static/js/firebase-config.js',
  'static/images/favicon.png',
  'confessions/index.html',
  'knots/index.html',
  'roomfinder/index.html',
  'events/index.html'
];

// Install: Pre-cache core shell assets
self.addEventListener('install', (event) => {
  const precacheUrls = RELATIVE_ASSETS.map(getScopePath);
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(precacheUrls).catch((err) => {
        console.warn('[SW] Non-critical asset failed to precache:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate: Immediately purge all outdated cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Deleting obsolete cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Smart routing strategy
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. Bypass Service Worker completely for API calls and non-GET requests
  if (event.request.method !== 'GET' || url.pathname.startsWith('/api/')) {
    return;
  }

  // 2. HTML Navigation requests: Network-First (guarantees latest deployment)
  if (event.request.mode === 'navigate' || event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse.ok) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(event.request);
          if (cachedResponse) return cachedResponse;
          return caches.match('/index.html');
        })
    );
    return;
  }

  // 3. Static Assets (CSS, JS, Images, Fonts): Stale-While-Revalidate
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse.ok) {
          const copy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return networkResponse;
      }).catch(() => {
        // Offline and not in cache
      });

      return cachedResponse || fetchPromise;
    })
  );
});
