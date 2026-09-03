// NutriVision AI Service Worker
const CACHE_NAME = 'nutrivision-v1.1.9';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './css/styles.css',
  './css/variables.css',
  './css/layout.css',
  './css/components.css',
  './css/dashboard.css',
  './css/landing.css',
  './css/modals.css',
  './css/database.css',
  './css/responsive.css',
  './css/admin.css',
  './js/lucide.min.js',
  './js/iconify-icon.min.js',
  './js/supabase.min.js',
  './js/supabase-config.js',
  './js/data.js',
  './js/cv-engine.js',
  './js/camera.js',
  './js/planner.js',
  './js/progress.js',
  './js/community.js',
  './js/caregiver.js',
  './js/db.js',
  './js/app.js',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@300;400;500;600;700;800&display=swap'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching offline assets');
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('[SW] Caching warning (some non-critical assets might fail on first run):', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Navigation or asset request strategy: Stale-While-Revalidate or Network-first with Cache fallback
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch((err) => {
          console.log('[SW] Network failed, serving cached fallback if available:', err);
          return cachedResponse;
        });

      return cachedResponse || fetchPromise;
    })
  );
});
