/**
 * Enterprise OT Management Portal - Service Worker
 * Version: v1
 * Cache Strategy:
 *  - App Shell & Core Assets: Cache-First (ot-portal-v1-shell)
 *  - Dynamic Vite Assets (/assets/*): Cache-First with runtime caching (ot-portal-v1-runtime)
 *  - Navigation (/ & HTML routes): Network-First with Cache Fallback to /index.html
 *  - Static Media & Icons: Cache-First
 *  - Google Fonts & Material Icons: Stale-While-Revalidate (ot-portal-v1-fonts)
 *  - API Requests (/api/*): Network-First with offline JSON fallback (ot-portal-v1-data)
 */

const CACHE_VERSION = 'v6';
const SHELL_CACHE_NAME = `ot-portal-${CACHE_VERSION}-shell`;
const RUNTIME_CACHE_NAME = `ot-portal-${CACHE_VERSION}-runtime`;
const FONT_CACHE_NAME = `ot-portal-${CACHE_VERSION}-fonts`;
const DATA_CACHE_NAME = `ot-portal-${CACHE_VERSION}-data`;

const CURRENT_CACHES = [
  SHELL_CACHE_NAME,
  RUNTIME_CACHE_NAME,
  FONT_CACHE_NAME,
  DATA_CACHE_NAME
];

// Core static assets required for offline app shell
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/manifest.json',
  '/favicon.ico',
  '/login-bg.jpg',
  '/icons/icon-192x192.png',
  '/icons/icon-192x192-maskable.png',
  '/icons/icon-512x512.png',
  '/icons/icon-512x512-maskable.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png',
  '/icons/favicon-32x32.png',
  '/icons/favicon-16x16.png',
  '/icons/icon.svg'
];

// ------------------------------------------------------------
// Lifecycle: install
// ------------------------------------------------------------
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE_NAME).then(async (cache) => {
      // Use Promise.allSettled for resilient pre-caching
      await Promise.allSettled(
        PRECACHE_URLS.map(async (url) => {
          try {
            const response = await fetch(url, { cache: 'no-cache' });
            if (response.ok) {
              await cache.put(url, response);
            }
          } catch (err) {
            console.warn(`[SW] Pre-cache skipped for ${url}:`, err ? err.message : err);
          }
        })
      );
      return self.skipWaiting();
    })
  );
});

// ------------------------------------------------------------
// Lifecycle: activate
// ------------------------------------------------------------
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName.startsWith('ot-portal-') && !CURRENT_CACHES.includes(cacheName)) {
            console.info('[SW] Deleting stale cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// ------------------------------------------------------------
// Lifecycle: message
// ------------------------------------------------------------
self.addEventListener('message', (event) => {
  if (event.data) {
    if (event.data.type === 'SKIP_WAITING') {
      self.skipWaiting();
    }
    if (event.data.type === 'CLIENTS_CLAIM') {
      self.clients.claim();
    }
    if (event.data.type === 'GET_VERSION') {
      if (event.ports && event.ports[0]) {
        event.ports[0].postMessage({ version: CACHE_VERSION });
      }
    }
  }
});

// ------------------------------------------------------------
// Helper: Cache Strategies
// ------------------------------------------------------------

async function cacheFirst(request, cacheName) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.warn('[SW] Cache-First fetch failed for:', request.url);
    throw error;
  }
}

async function networkFirst(request, cacheName, fallbackUrl = null) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.warn('[SW] Network failed, falling back to cache:', request.url);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    if (fallbackUrl) {
      const fallbackResponse = await caches.match(fallbackUrl);
      if (fallbackResponse) {
        return fallbackResponse;
      }
    }
    if (request.url.includes('/api/')) {
      return new Response(
        JSON.stringify({ 
          offline: true, 
          status: 'offline', 
          message: 'ระบบกำลังทำงานในโหมดออฟไลน์ (Application is currently in offline mode)' 
        }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json; charset=utf-8' }
        }
      );
    }
    throw error;
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch((err) => {
    console.warn('[SW] SWR background update failed for:', request.url, err ? err.message : err);
  });

  return cachedResponse || fetchPromise;
}

// ------------------------------------------------------------
// Lifecycle: fetch
// ------------------------------------------------------------
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Ignore non-HTTP(S)
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // 2. Ignore Vite development / HMR internal routes
  if (
    url.pathname.startsWith('/@vite') ||
    url.pathname.startsWith('/@fs') ||
    url.pathname.startsWith('/@id') ||
    url.pathname.includes('__vite_ping') ||
    url.pathname.includes('hot-update') ||
    url.pathname.includes('node_modules')
  ) {
    return;
  }

  // 3. Non-GET requests pass directly to network
  if (request.method !== 'GET') {
    return;
  }

  // 4. SPA Navigation (App Shell Fallback)
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, SHELL_CACHE_NAME, '/index.html'));
    return;
  }

  // 5. Google Fonts & Material Symbols
  if (
    url.hostname === 'fonts.googleapis.com' ||
    url.hostname === 'fonts.gstatic.com' ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.woff') ||
    url.pathname.endsWith('.ttf')
  ) {
    event.respondWith(staleWhileRevalidate(request, FONT_CACHE_NAME));
    return;
  }

  // 6. API Requests (/api/*)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request, DATA_CACHE_NAME));
    return;
  }

  // 7. Static Assets (Vite bundled JS/CSS in /assets/)
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(cacheFirst(request, RUNTIME_CACHE_NAME));
    return;
  }

  // 8. Static App Shell Assets & Media
  if (
    url.pathname === '/manifest.webmanifest' ||
    url.pathname === '/manifest.json' ||
    url.pathname === '/favicon.ico' ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.jpeg') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.webp') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css')
  ) {
    event.respondWith(cacheFirst(request, RUNTIME_CACHE_NAME));
    return;
  }

  // 9. Default Fallback
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request))
  );
});
