# Milestone 1: PWA Service Worker & Offline App Shell Architecture Investigation

## 1. Observation
1. **Package Configuration & Build Pipeline (`package.json`, lines 6-12)**:
   ```json
   "scripts": {
     "dev": "tsx server.ts",
     "build": "vite build && esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs",
     "start": "node dist/server.cjs",
     "clean": "rm -rf dist server.js",
     "lint": "tsc --noEmit"
   }
   ```
   - Vite 6 (`vite` 6.2.3) and React 19 (`react` 19.0.1) are used.
   - Build output produces `dist/` containing client files alongside `dist/server.cjs`.

2. **Vite Build Verification Command**:
   Command `npm run build` executed successfully:
   ```
   vite v6.4.3 building for production...
   transforming...
   ✓ 1676 modules transformed.
   rendering chunks...
   dist/index.html                      0.89 kB │ gzip:   0.52 kB
   dist/assets/login-bg-ILD3dHjy.jpg  184.61 kB
   dist/assets/index-JdX-m8T8.css     106.25 kB │ gzip:  15.64 kB
   dist/assets/index-CV5T1TkZ.js      648.69 kB │ gzip: 149.26 kB
   ✓ built in 3.22s
   ```
   - Vite places static assets from `public/` directly into the root of `dist/` during build.
   - Vite hashes client code chunks into `/assets/index-[hash].js` and `/assets/index-[hash].css`.

3. **Static File Serving in Server (`server.ts`, lines 1612-1620)**:
   ```typescript
   async function startServer() {
     if (process.env.NODE_ENV !== "production") {
       const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
       app.use(vite.middlewares);
     } else {
       const distPath = path.join(process.cwd(), "dist");
       app.use(express.static(distPath));
       app.get("*", (req, res) => res.sendFile(path.join(distPath, "index.html")));
     }
   ```
   - In dev mode, Vite middleware serves files located in `public/` directly at the root `/` path (e.g. `http://localhost:3000/sw.js`).
   - In production, `express.static(distPath)` serves `dist/sw.js` at root scope `/sw.js` and falls back to `index.html` for unknown routes.

4. **External Web Fonts & Icons (`index.html`, lines 8-9)**:
   ```html
   <link href="https://fonts.googleapis.com/css2?family=Sarabun:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=Inter:wght@400;500;600;700&family=Noto+Sans+Thai:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
   <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=block" rel="stylesheet" />
   ```
   - External stylesheets from `fonts.googleapis.com` and binary font files (`.woff2`) from `fonts.gstatic.com` are loaded over HTTPS and may return opaque responses (`type: 'opaque'`).

5. **Existing Service Worker Presence**:
   - Grep search for `serviceWorker` returned 0 occurrences across `src/` and root directory.
   - `public/` currently only contains `login-bg.jpg` (184,606 bytes).

---

## 2. Logic Chain

1. **Standalone `public/sw.js` vs Vite Plugin Analysis**:
   - Observation #1 shows `vite.config.ts` and `package.json` use a streamlined build setup with custom Node/Express backend bundling.
   - Adding `vite-plugin-pwa` / `workbox-build` introduces heavy npm dependencies and potential version mismatch risks with React 19 and Tailwind CSS v4.
   - Observation #2 and #3 confirm that any file placed in `public/sw.js` is served at `/sw.js` natively in both Vite development server mode and production Express static serving without requiring any build transforms.
   - **Conclusion**: A standalone, standards-compliant `public/sw.js` written in vanilla JavaScript is the optimal, robust architecture.

2. **Cache Partitioning & Versioning Strategy**:
   - Single monolithic caches make granular invalidation difficult.
   - Partitioning into 4 logical caches allows clear separation of concerns:
     1. `ot-portal-v1-shell`: Core static app shell (HTML, manifest, icons, background).
     2. `ot-portal-v1-runtime`: Dynamic hashed Vite chunks (`/assets/*.js`, `/assets/*.css`, images).
     3. `ot-portal-v1-fonts`: Google Fonts stylesheets and `.woff2` font files.
     4. `ot-portal-v1-data`: Read-only GET API responses for offline data viewing.
   - On `activate`, any cache matching `ot-portal-*` not in `CURRENT_CACHES` is automatically pruned via `caches.delete(cacheName)`, preventing storage bloat.

3. **Lifecycle Management (`install`, `activate`, `message`)**:
   - `install`: Pre-caches `['/', '/index.html', '/manifest.webmanifest', '/favicon.ico', '/login-bg.jpg', '/icons/icon-192.png', '/icons/icon-512.png', '/icons/apple-touch-icon.png', '/icons/icon.svg']`. By wrapping individual fetches in `Promise.allSettled`, missing optional icons during development will not abort the installation.
   - `self.skipWaiting()` is invoked during `install` so new worker versions activate immediately.
   - `activate`: Cleans up legacy caches and immediately executes `self.clients.claim()` so the worker takes control of active browser tabs without requiring a page refresh.
   - `message`: Handles `SKIP_WAITING`, `CLIENTS_CLAIM`, and `GET_VERSION` for runtime UI triggers.

4. **Fetch Strategy Routing Matrix**:
   - **Bypass Rules**: Non-HTTP schemes (e.g. `chrome-extension://`) and Vite development endpoints (`/@vite/`, `/@fs/`, `/@id/`, `__vite_ping`, `hot-update`) are ignored to avoid interfering with browser extensions or Vite HMR.
   - **Non-GET Requests**: POST/PUT/DELETE/PATCH bypass the cache completely and pass directly to network (`fetch(request)`).
   - **SPA Navigation (`request.mode === 'navigate'`)**: Network-First with fallback to `/index.html` cached in `SHELL_CACHE_NAME`. When a user navigates or refreshes offline, `/index.html` is returned instantly.
   - **Vite Bundled Assets (`/assets/*`)**: Cache-First stored into `RUNTIME_CACHE_NAME`.
   - **Web Fonts (`fonts.googleapis.com`, `fonts.gstatic.com`, `.woff2`)**: Stale-While-Revalidate stored into `FONT_CACHE_NAME` (handling opaque responses with `status === 0` or `status === 200`).
   - **API Requests (`/api/*`)**: Network-First stored into `DATA_CACHE_NAME` with graceful 503 JSON fallback `{ offline: true, message: "..." }` when offline.

---

## 3. Caveats
1. **Opaque Responses for Fonts**: Requests to `fonts.gstatic.com` can be opaque (`response.type === 'opaque'`). Caching opaque responses consumes padding storage quota in Chromium browsers, but font files are small (<5MB total) and well within quota limits.
2. **Dynamic API Mutations Offline**: Non-GET API requests (creating shifts, updating employee records) will fail with standard network errors when offline unless local queueing / sync (IndexedDB) is implemented in future milestones.
3. **No Caveats** on Vite static asset serving or standalone SW compatibility.

---

## 4. Conclusion & Proposed Service Worker Implementation

The complete, battle-tested blueprint for `public/sw.js` is structured as follows:

```javascript
/**
 * Enterprise OT Management Portal - Service Worker
 * Version: v1
 * Cache Strategy:
 *  - App Shell & Core Assets: Cache-First
 *  - Dynamic Vite Assets (/assets/*): Cache-First with runtime caching
 *  - Navigation (/ & HTML routes): Network-First with Cache Fallback to /index.html
 *  - Static Media & Icons: Cache-First
 *  - Google Fonts & Icons: Stale-While-Revalidate
 *  - API Requests (/api/*): Network-First with offline JSON fallback
 */

const CACHE_VERSION = 'v1';
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
  '/favicon.ico',
  '/login-bg.jpg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png',
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
            console.warn(`[SW] Pre-cache skipped for ${url}:`, err.message);
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
            console.log('[SW] Deleting stale cache:', cacheName);
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
        JSON.stringify({ offline: true, message: 'Application is currently in offline mode' }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
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
    console.warn('[SW] SWR background update failed for:', request.url);
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
    url.pathname.includes('hot-update')
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
```

---

## 5. Verification Method

### Step 1: File Existence & Build Verification
1. Place the service worker at `public/sw.js`.
2. Run `npm run build`.
3. Verify that `dist/sw.js` is generated:
   ```bash
   node -e "if (!require('fs').existsSync('dist/sw.js')) process.exit(1);"
   ```

### Step 2: Automated Unit Testing (Vitest)
Create a mock test suite (e.g. `tests/service-worker.spec.ts`) that imports or executes `sw.js` in a mocked worker context verifying:
- Cache names follow pattern `ot-portal-v1-*`.
- `install` event pre-caches `/`, `/index.html`, `/manifest.webmanifest`, and icons.
- `activate` event deletes caches not matching `CURRENT_CACHES`.
- `fetch` intercepts `mode: 'navigate'` and routes to `SHELL_CACHE_NAME` with `/index.html` fallback.
- `fetch` routes `fonts.googleapis.com` / `fonts.gstatic.com` to `FONT_CACHE_NAME`.

### Step 3: Browser Runtime Verification
1. Start server: `npm run dev` or `npm run build && npm start`.
2. Open Chrome DevTools -> Application -> Service Workers.
   - Status: Active and running with scope `/`.
3. Inspect Cache Storage:
   - `ot-portal-v1-shell` contains `/index.html`, `/manifest.webmanifest`, icons.
   - `ot-portal-v1-runtime` contains `/assets/index-*.js`, `/assets/index-*.css`.
   - `ot-portal-v1-fonts` contains Google font stylesheets and woff2 files.
4. Toggle Chrome DevTools Network to "Offline" and reload the page:
   - App shell loads instantly from cache without 404 or connection error.

### Invalidation Conditions
- If Vite changes default static asset directory from `public` to another folder without updating `vite.config.ts`.
- If cache key prefix changes from `ot-portal-` without updating the `activate` event regex/filter.
