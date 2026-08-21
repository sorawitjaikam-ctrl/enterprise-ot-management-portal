# E2E Testing Explorer 3: PWA, Offline App Shell & Test Runner Architecture Report

**Project**: Enterprise OT Management Portal — Mobile & Tablet Responsive UI/UX & PWA  
**Investigator**: Explorer 3 (PWA & Offline Architecture, Test Runner & Tier 3 Test Suite Design)  
**Date**: 2026-08-22  
**Target Path**: `C:\Users\ssrwj\Documents\antigravity\mysterious-einstein\.agents\e2e_explorer_3\report.md`  

---

## Executive Summary

This report delivers a thorough investigation and architectural blueprint covering:
1. **PWA & Offline App Shell Audit**: Detailed analysis of current Web App Manifest, HTML meta tags, Apple touch icons, Service Worker caching strategies (`Cache-First` app shell, `Network-First` API), and offline fallback mechanisms.
2. **Test Runner Architecture**: Evaluation of current `package.json` scripts and recommendation of **Vitest 3 + JSDOM + React Testing Library** as the optimal, lightning-fast test harness for Vite 6 + React 19 + TypeScript.
3. **Clean 4-Tier Test Directory Architecture**: Fully mapped folder structure (`tests/tier1-calculations/`, `tests/tier2-responsive/`, `tests/tier3-pwa/`, `tests/tier4-workflows/`) and global mock infrastructure (`tests/setup.ts`, `tests/mocks/`).
4. **Exhaustive Tier 3 (PWA & Service Worker) Test Suite Specification**: 26 concrete, requirement-driven test cases covering manifest validation, iOS/Android meta tags, Service Worker lifecycle (`install`, `skipWaiting`, `activate`, cache pruning), offline caching strategies, and PWA install prompt hooks.

---

## 1. PWA & Offline App Shell Deep Dive

### 1.1 Current Baseline State vs Requirements

| PWA Component | Current Codebase Status | Target Requirement (PROJECT.md §M1, ORIGINAL_REQUEST §R3) |
|:---|:---|:---|
| **Web App Manifest** | **Missing** (No `manifest.webmanifest` or `manifest.json` in `public/`) | Standards-compliant `public/manifest.webmanifest` with name, short_name, icons, theme_color, background_color, standalone display mode |
| **HTML Meta Tags** | Minimal (`viewport` and `charset` only in `index.html`) | Apple mobile web app capable, black-translucent status bar, theme-color `#0f172a`, apple-touch-icon, `viewport-fit=cover` |
| **Service Worker Script** | **Missing** (No `public/sw.js` or `src/sw.ts`) | Root-scoped `/sw.js` with Cache-First static assets (`ot-portal-v1-shell`), Network-First API (`ot-portal-v1-api`), and offline fallback |
| **SW Registration** | **Missing** in `src/main.tsx` / `src/App.tsx` | Robust lifecycle registration on window load, handling update events and offline state |
| **PWA Icons** | Only `public/login-bg.jpg` exists in `public/` | PNG & SVG icons: `icon-192x192.png`, `icon-512x512.png`, maskable variants in `public/icons/` |
| **Install UI & Offline Badge** | None | In-app "Add to Home Screen" prompt trigger and live online/offline network indicator |

---

### 1.2 Web App Manifest Specification (`public/manifest.webmanifest`)

The Web App Manifest must conform to the W3C Web App Manifest specification:

```json
{
  "name": "Enterprise OT Management Portal",
  "short_name": "Enterprise OT",
  "description": "Enterprise OT Management Portal for Shift Scheduling, Overtime Tracking, and Marine Logistics",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "background_color": "#0f172a",
  "theme_color": "#0f172a",
  "orientation": "any",
  "lang": "th",
  "dir": "ltr",
  "categories": ["productivity", "business", "utilities"],
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-maskable-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "/icons/icon-maskable-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ],
  "shortcuts": [
    {
      "name": "ตารางกะ (Shift Matrix)",
      "short_name": "Shift Matrix",
      "description": "เข้าสู่ระบบจัดการตารางกะและโอที",
      "url": "/?view=shift-scheduler",
      "icons": [{ "src": "/icons/icon-192x192.png", "sizes": "192x192" }]
    },
    {
      "name": "รายชื่อพนักงาน (Roster)",
      "short_name": "Roster",
      "description": "ตรวจสอบรายชื่อพนักงานและอัตราค่าจ้าง",
      "url": "/?view=employee-roster",
      "icons": [{ "src": "/icons/icon-192x192.png", "sizes": "192x192" }]
    }
  ]
}
```

---

### 1.3 `index.html` Meta Tags Specification

Update `index.html` to guarantee mobile standalone presentation on iOS Safari and Android Chrome:

```html
<!doctype html>
<html lang="th">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover" />
    <meta name="theme-color" content="#0f172a" />
    <meta name="description" content="Enterprise OT Management Portal for Shift Scheduling, Overtime Tracking, and Marine Logistics" />
    
    <!-- iOS / Safari PWA Meta Tags -->
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="Enterprise OT" />
    <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
    
    <!-- Manifest -->
    <link rel="manifest" href="/manifest.webmanifest" />
    
    <title>Enterprise OT - Shift Management</title>
    
    <!-- Fonts & Icons -->
    <link href="https://fonts.googleapis.com/css2?family=Sarabun:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=Inter:wght@400;500;600;700&family=Noto+Sans+Thai:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=block" rel="stylesheet" />
  </head>
  <body class="bg-slate-50 text-slate-900 antialiased font-sans">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

---

### 1.4 Service Worker Architecture & Caching Strategy (`public/sw.js`)

The Service Worker must implement dual-tier caching:
1. **Cache-First (or Stale-While-Revalidate)** for Static App Shell assets (`/`, `/index.html`, `/manifest.webmanifest`, CSS, JS, fonts, images).
2. **Network-First with Cache Fallback** for dynamic API calls (`/api/*`).
3. **App Shell Navigation Fallback**: All SPA navigate requests fall back to `/index.html` when offline.
4. **Lifecycle**: Instant activation via `self.skipWaiting()` on install and `clients.claim()` on activate, with automated cleanup of outdated caches.

#### Recommended Implementation Structure (`public/sw.js`):
```javascript
const CACHE_NAME = 'ot-portal-v1-shell';
const API_CACHE_NAME = 'ot-portal-v1-api';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-maskable-192x192.png',
  '/icons/icon-maskable-512x512.png',
  '/login-bg.jpg'
];

// 1. Install: Pre-cache static shell assets & skip waiting
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// 2. Activate: Purge stale caches & claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== API_CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch: Route requests by type
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore non-GET requests (e.g. POST /api/save-shifts)
  if (request.method !== 'GET') {
    return;
  }

  // A. API Requests: Network-First with Cache Fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(API_CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          // Return structured offline JSON response
          return new Response(
            JSON.stringify({ offline: true, message: 'Offline mode active. Using cached data.' }),
            { headers: { 'Content-Type': 'application/json' }, status: 200 }
          );
        })
    );
    return;
  }

  // B. Navigation Requests (SPA fallback to /index.html)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        const cachedShell = await caches.match('/index.html');
        return cachedShell || fetch(request);
      })
    );
    return;
  }

  // C. Static Assets: Cache-First, fallback to Network
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(request).then((networkResponse) => {
        if (networkResponse.ok && (url.origin === location.origin || url.origin.includes('fonts.'))) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return networkResponse;
      });
    })
  );
});
```

---

### 1.5 Service Worker Registration (`src/serviceWorkerRegistration.ts`)

```typescript
export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
          console.log('[PWA] Service Worker registered with scope:', registration.scope);
          
          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('[PWA] New content is available; please refresh.');
                  window.dispatchEvent(new CustomEvent('pwa-update-available'));
                }
              };
            }
          };
        })
        .catch((error) => {
          console.error('[PWA] Service Worker registration failed:', error);
        });
    });
  }
}
```

---

## 2. Test Runner Architecture Evaluation & Recommendation

### 2.1 Technology Comparison

| Criteria | Vitest 3 + JSDOM | Node.js Built-in Test Runner (`node --test`) | Jest |
|:---|:---|:---|:---|
| **Vite 6 / React 19 Integration** | Native (shares plugins, aliases, TS configs directly) | Requires custom esbuild/tsx bundling pipeline for JSX | Requires Babel / ts-jest / ESM workarounds |
| **Execution Speed** | Ultra fast (~0.8s - 1.5s for 50+ test suites) | Fast for pure TS, slow for mocked DOM | Slower due to process isolation overhead |
| **DOM / Component Testing** | Seamless with `@testing-library/react` + `jsdom` | Poor DOM support without external polyfills | Supported via jsdom |
| **Developer Experience** | Watch mode, UI dashboard, snapshots, mock timers | Basic CLI reporting | Rich CLI reporting |
| **Configuration Overhead** | Minimal (10-15 lines in `vitest.config.ts`) | Moderate | Heavy (`jest.config.js`, transform, babel) |

### 2.2 Recommendation: Vitest + JSDOM + Testing Library

**Vitest** is the definitive choice for this project because:
1. It shares Vite's build pipeline and resolve aliases (`@/*`).
2. It executes TypeScript and React 19 JSX natively with zero transformation lag.
3. It integrates seamlessly with `@testing-library/react` and `@testing-library/jest-dom` for component and DOM layout validation.
4. It provides out-of-the-box support for `npm test` and single-run CI scripts (`vitest run`).

---

### 2.3 Required Dependencies & `package.json` Updates

#### DevDependencies to install:
```json
{
  "devDependencies": {
    "vitest": "^3.0.7",
    "@testing-library/react": "^16.2.0",
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/user-event": "^14.6.1",
    "jsdom": "^26.0.0",
    "@types/jsdom": "^21.1.7"
  }
}
```

#### Scripts configuration:
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:tier1": "vitest run tests/tier1-calculations",
    "test:tier2": "vitest run tests/tier2-responsive",
    "test:tier3": "vitest run tests/tier3-pwa",
    "test:tier4": "vitest run tests/tier4-workflows",
    "test:coverage": "vitest run --coverage"
  }
}
```

---

### 2.4 Vitest Configuration (`vitest.config.ts`)

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}', 'tests/**/*.spec.{ts,tsx}'],
    exclude: ['node_modules', 'dist', '.agents'],
    testTimeout: 10000,
    hookTimeout: 10000,
  },
});
```

---

### 2.5 Global Test Environment Setup (`tests/setup.ts`)

```typescript
import '@testing-library/jest-dom';
import { beforeEach, vi } from 'vitest';

// 1. Polyfill window.matchMedia for responsive testing
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// 2. Polyfill ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
};

// 3. Polyfill IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
};

// 4. Polyfill URL.createObjectURL & revokeObjectURL (used in CSV exports)
if (!window.URL.createObjectURL) {
  window.URL.createObjectURL = vi.fn(() => 'blob:mock-blob-url');
  window.URL.revokeObjectURL = vi.fn();
}

// 5. Mock CacheStorage API for PWA Service Worker tests
class MockCache {
  private store = new Map<string, Response>();
  async match(request: RequestInfo | URL) {
    const url = typeof request === 'string' ? request : (request as Request).url;
    return this.store.get(url)?.clone() || null;
  }
  async put(request: RequestInfo | URL, response: Response) {
    const url = typeof request === 'string' ? request : (request as Request).url;
    this.store.set(url, response.clone());
  }
  async delete(request: RequestInfo | URL) {
    const url = typeof request === 'string' ? request : (request as Request).url;
    return this.store.delete(url);
  }
  async keys() {
    return Array.from(this.store.keys()).map((k) => new Request(k));
  }
  async addAll(requests: (RequestInfo | URL)[]) {
    for (const req of requests) {
      const url = typeof req === 'string' ? req : (req as Request).url;
      this.store.set(url, new Response('mock-cached-content'));
    }
  }
}

class MockCacheStorage {
  private caches = new Map<string, MockCache>();
  async open(name: string) {
    if (!this.caches.has(name)) {
      this.caches.set(name, new MockCache());
    }
    return this.caches.get(name)!;
  }
  async has(name: string) {
    return this.caches.has(name);
  }
  async delete(name: string) {
    return this.caches.delete(name);
  }
  async keys() {
    return Array.from(this.caches.keys());
  }
  async match(request: RequestInfo | URL) {
    for (const cache of this.caches.values()) {
      const res = await cache.match(request);
      if (res) return res;
    }
    return null;
  }
}

Object.defineProperty(window, 'caches', {
  writable: true,
  value: new MockCacheStorage(),
});

// 6. Reset localStorage and mocks before each test
beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});
```

---

## 3. Clean Test Directory Layout

```
tests/
├── setup.ts                                # Global setup, jsdom mocks & polyfills
├── mocks/
│   ├── mockData.ts                         # Standard mock fixtures (depts, employees, shifts, vessel schedules)
│   ├── mockServiceWorker.ts                # ServiceWorker registration & caches mock handlers
│   └── mockStorage.ts                      # LocalStorage & fetch interceptor mock helpers
├── tier1-calculations/
│   ├── ot-hours.test.ts                    # Shift code OT hours (M8, M12, M16, N16, OND, D, O, dynamic /\d+$/)
│   ├── salary-ot-rates.test.ts             # Hourly rate salary/240*1.5, dept budget utilization vs 150,000 THB
│   ├── plan-actual-diff.test.ts            # Plan vs Actual comparison, Plan Accuracy % calculation
│   ├── employee-tenure-age.test.ts         # Age, tenure, probation calculation
│   └── csv-exports.test.ts                 # 6 CSV export handlers data formatting, UTF-8 BOM, headers
├── tier2-responsive/
│   ├── mobile-viewport-375px.test.tsx      # Mobile 375px-430px: single column cards, compact nav, no horizontal clipping
│   ├── tablet-viewport-768px.test.tsx      # Tablet 768px-1024px: 2-column cards, sidebar toggle/drawer
│   ├── shift-matrix-sticky.test.tsx        # Shift matrix w-32/w-44/w-56 sticky left column, days panning container
│   ├── roster-adaptive-columns.test.tsx    # Roster adaptive frozen columns (1 col mobile, 2 tablet, 5 desktop)
│   └── touch-ergonomics-44px.test.tsx      # Interactive controls min 44x44px tap targets, shift picker bottom sheet
├── tier3-pwa/
│   ├── manifest-schema.test.ts             # Web App Manifest JSON validity, name, short_name, icons, standalone, theme_color
│   ├── html-meta-tags.test.ts              # index.html meta tags, apple-touch-icon, theme-color, viewport-fit=cover
│   ├── service-worker-lifecycle.test.ts    # SW install, skipWaiting, activate, cache purging, clients.claim
│   ├── offline-caching-strategy.test.ts    # Cache-First static assets, Network-First API, offline fallback responses
│   └── pwa-install-prompt.test.tsx         # beforeinstallprompt event handling, install banner / status badge
└── tier4-workflows/
    ├── admin-login-workflow.test.tsx       # Admin/Manager authentication, role switching, permissions
    ├── shift-matrix-editing.test.tsx       # Shift editing, monthly breakdown recalculation, Plan vs Actual toggle
    ├── desktop-368px-invariants.test.tsx   # Strict 368px desktop summary widget alignment verification (200px+96px+72px)
    ├── roster-crud-workflow.test.tsx       # Employee roster search, filter, add/edit employee modal
    └── csv-template-hub-workflow.test.tsx  # CSV Template Hub downloads and CSV imports regression suite
```

---

## 4. Tier 3 (PWA Manifest, Service Worker & Offline Caching) Test Proposals

The following 26 test cases are organized across 5 distinct test files in `tests/tier3-pwa/`:

### 4.1 `tests/tier3-pwa/manifest-schema.test.ts` (6 Test Cases)

| Test ID | Test Name | Purpose / Assertion | Expected Value / Criteria |
|:---|:---|:---|:---|
| **T3.1.1** | `manifest file exists and is valid JSON` | Reads `public/manifest.webmanifest` (or `public/manifest.json`) from disk and validates syntax. | File exists and parses without JSON syntax errors. |
| **T3.1.2** | `manifest contains mandatory app metadata` | Verifies `name`, `short_name`, `start_url`, and `scope`. | `name === "Enterprise OT Management Portal"`, `short_name === "Enterprise OT"`, `start_url === "/"`, `scope === "/"`. |
| **T3.1.3** | `manifest specifies standalone display mode` | Verifies standalone display and orientation properties. | `display === "standalone"`, `orientation === "any"` (or `"portrait-primary"`). |
| **T3.1.4** | `manifest theme and background colors match enterprise palette` | Verifies slate-900 enterprise branding color consistency. | `theme_color === "#0f172a"` and `background_color === "#0f172a"`. |
| **T3.1.5** | `manifest declares standard and maskable icons` | Validates icon sizes (192x192, 512x512), mime types (`image/png`), and purposes (`any`, `maskable`). | Contains >= 2 icon entries covering 192px and 512px with maskable purposes. |
| **T3.1.6** | `manifest defines quick-access shortcuts` | Validates operational shortcuts for Shift Matrix and Employee Roster. | Shortcuts array has valid objects with `name`, `url`, and `icons`. |

---

### 4.2 `tests/tier3-pwa/html-meta-tags.test.ts` (5 Test Cases)

| Test ID | Test Name | Purpose / Assertion | Expected Value / Criteria |
|:---|:---|:---|:---|
| **T3.2.1** | `index.html contains link to webmanifest` | Parses `index.html` and checks `<link rel="manifest">`. | Element exists with `href="/manifest.webmanifest"` (or `"/manifest.json"`). |
| **T3.2.2** | `index.html sets theme-color meta tag` | Inspects `<meta name="theme-color">`. | Content attribute equals `#0f172a`. |
| **T3.2.3** | `index.html includes Apple iOS mobile-web-app-capable tags` | Verifies `<meta name="apple-mobile-web-app-capable" content="yes">` and `<meta name="apple-mobile-web-app-status-bar-style">`. | `apple-mobile-web-app-capable` is `"yes"`; status bar style is `"black-translucent"`. |
| **T3.2.4** | `index.html configures apple-touch-icon link` | Checks for `<link rel="apple-touch-icon" href="...">`. | Link tag exists referencing valid icon path (`/icons/icon-192x192.png`). |
| **T3.2.5** | `index.html viewport meta enables viewport-fit=cover` | Validates mobile safe-area viewport configuration. | `content` attribute contains `viewport-fit=cover` and `width=device-width`. |

---

### 4.3 `tests/tier3-pwa/service-worker-lifecycle.test.ts` (5 Test Cases)

| Test ID | Test Name | Purpose / Assertion | Expected Value / Criteria |
|:---|:---|:---|:---|
| **T3.3.1** | `sw.js registers with root scope in production environment` | Tests `registerServiceWorker()` registration invocation. | Calls `navigator.serviceWorker.register('/sw.js', { scope: '/' })`. |
| **T3.3.2** | `sw install event pre-caches critical app shell static assets` | Simulates SW `install` event and checks cache storage. | Cache `ot-portal-v1-shell` contains `/`, `/index.html`, `/manifest.webmanifest`. |
| **T3.3.3** | `sw install invokes skipWaiting for instant takeover` | Simulates SW install lifecycle listener. | `self.skipWaiting()` is executed during install phase. |
| **T3.3.4** | `sw activate event purges obsolete cache versions` | Adds legacy caches (`ot-portal-v0`, `old-cache-v1`) and fires `activate` event. | Only current cache names (`ot-portal-v1-shell`, `ot-portal-v1-api`) remain in `caches`. |
| **T3.3.5** | `sw activate invokes clients.claim()` | Simulates activate event handler completion. | `self.clients.claim()` is called to assume immediate client control. |

---

### 4.4 `tests/tier3-pwa/offline-caching-strategy.test.ts` (5 Test Cases)

| Test ID | Test Name | Purpose / Assertion | Expected Value / Criteria |
|:---|:---|:---|:---|
| **T3.4.1** | `static assets use Cache-First strategy` | Intercepts fetch for static asset (e.g. `/assets/index.js`). | Returns response directly from cache if present without making network fetch. |
| **T3.4.2** | `api endpoints use Network-First strategy with dynamic caching` | Intercepts fetch for `/api/portal-state` under online conditions. | Fetches from network, updates `ot-portal-v1-api` cache, and returns fresh network payload. |
| **T3.4.3** | `api endpoints fall back to cached response when offline` | Simulates network failure (`TypeError: Failed to fetch`) on `/api/portal-state`. | Returns previously cached API JSON response. |
| **T3.4.4** | `api endpoints return structured offline payload on cache-miss when offline` | Simulates offline network failure on uncached `/api/unknown`. | Returns HTTP 200/503 JSON with `{ offline: true }`. |
| **T3.4.5** | `navigation requests fall back to cached index.html when offline` | Simulates navigation request (`mode: 'navigate'`) to `/shift-scheduler` while disconnected. | Returns cached `/index.html` SPA shell response. |

---

### 4.5 `tests/tier3-pwa/pwa-install-prompt.test.tsx` (5 Test Cases)

| Test ID | Test Name | Purpose / Assertion | Expected Value / Criteria |
|:---|:---|:---|:---|
| **T3.5.1** | `captures beforeinstallprompt event and prevents browser default banner` | Dispatches `beforeinstallprompt` `Event` on window. | `event.preventDefault()` is invoked; prompt object is deferred for in-app trigger. |
| **T3.5.2** | `renders in-app install button when install prompt is available` | Renders App header / settings menu with deferred prompt active. | "ติดตั้งแอป (Install App)" button is visible and enabled in DOM. |
| **T3.5.3** | `triggering install button calls prompt() and handles user acceptance` | Simulates click on in-app install button. | Calls `deferredPrompt.prompt()`; hides button when user accepts. |
| **T3.5.4** | `displays offline connectivity warning banner when offline` | Fires `window.dispatchEvent(new Event('offline'))`. | Offline banner/badge ("โหมดออฟไลน์ / Offline Mode") appears in UI. |
| **T3.5.5** | `displays update notification banner when SW update is found` | Fires `CustomEvent('pwa-update-available')`. | Reload prompt banner ("มีเวอร์ชันใหม่ / New Version Available") is displayed. |

---

## 5. Summary Matrix of Proposed Test Tiers

| Test Tier | Focus Area | Target File Count | Proposed Test Count | Key Invariants / Invalidation Conditions |
|:---|:---|:---|:---|:---|
| **Tier 1** | Calculations, OT Formulas & CSVs | 5 files | >= 25 tests | Exact formula `salary/240 * 1.5`, budget 150k THB, 6 CSV export formats |
| **Tier 2** | Mobile/Tablet Viewports & Sticky Columns | 5 files | >= 25 tests | 375px/768px viewports, pinned table columns, 44x44px touch targets |
| **Tier 3** | PWA Manifest, Service Worker & Offline | 5 files | 26 tests | Manifest schema, SW lifecycle, Cache-First static, Network-First API |
| **Tier 4** | E2E Workflows & 368px Desktop Invariants | 5 files | >= 25 tests | Admin login, Shift editing, strict 368px summary widget layout |
| **Total** | **Comprehensive Full Suite** | **20 files** | **>= 101 tests** | **100% automated pass with `npm test`** |

---

## 6. Implementation Steps for Test Infrastructure

1. **Install DevDependencies**:
   ```bash
   npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @types/jsdom
   ```
2. **Add Configuration Files**:
   - `vitest.config.ts` (with alias `@/*`, jsdom environment, globals, setupFiles).
   - `tests/setup.ts` (matchMedia, ResizeObserver, MockCacheStorage polyfills).
   - `tests/mocks/mockData.ts` & `tests/mocks/mockServiceWorker.ts`.
3. **Add Test Scripts to `package.json`**:
   - `"test": "vitest run"`
   - `"test:watch": "vitest"`
4. **Author Test Files**:
   - Create `tests/tier3-pwa/` and implement the 5 specified test suites (26 test cases).
   - Create `tests/tier1-calculations/`, `tests/tier2-responsive/`, and `tests/tier4-workflows/`.
5. **Run Suite**:
   ```bash
   npm test
   ```
