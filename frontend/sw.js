// NutriVision AI Service Worker
const CACHE_NAME = 'nutrivision-v1.4.2';
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
  './css/caregiver.css',
  './css/admin.css',
  './js/lucide.min.js',
  './js/iconify-icon.min.js',
  './js/supabase.min.js',
  './js/supabase-config.js',
  './js/db.js',
  './js/api-client.js',
  './js/bappenas-api.js',
  './js/data.js',
  './js/cv-engine.js',
  './js/camera.js',
  './js/symptom_filter_agent.js',
  './js/planner.js',
  './js/budget_planner.js',
  './js/progress.js',
  './js/community.js',
  './js/caregiver.js',
  './js/i18n.js',
  './js/admin_validator.js',
  './js/food_clinical_validator.js',
  './js/active-learning-collector.js',
  './js/app.js',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/favicon.png',
  './icons/nutrivision-icon.png',
  './icons/nutrivision-logo.png',
  './icons/nutrivision-logo-horizontal.png',
  './icons/nutrivision-logo-horizontal-dark.png',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW v1.4.2] Pre-caching offline assets');
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
            console.log('[SW] Purging old cache version:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Network-First for HTML documents and scripts to prevent stale client cache lock
  const isDocument = event.request.mode === 'navigate' || 
                     event.request.destination === 'document' || 
                     url.pathname.endsWith('.html') || 
                     url.pathname === '/';
  const isScript = event.request.destination === 'script' || url.pathname.endsWith('.js');

  if (isDocument || isScript) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache-First for static assets (images, fonts, stylesheets) with background update
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
