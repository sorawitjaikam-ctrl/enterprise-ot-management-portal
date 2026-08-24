import fs from 'fs';
import path from 'path';
import vm from 'vm';

console.log('================================================================');
console.log('CHALLENGER 1: SERVICE WORKER & OFFLINE APP SHELL STRESS HARNESS');
console.log('================================================================\n');

class MockCache {
  constructor(name) {
    this.name = name;
    this.store = new Map();
  }

  async put(request, response) {
    const key = typeof request === 'string' ? request : request.url;
    this.store.set(key, response.clone ? response.clone() : response);
  }

  async match(request) {
    const key = typeof request === 'string' ? request : request.url;
    if (this.store.has(key)) {
      const res = this.store.get(key);
      return res.clone ? res.clone() : res;
    }
    // Try matching pathname if key is full URL
    try {
      const url = new URL(key, 'http://localhost:3000');
      if (this.store.has(url.pathname)) {
        const res = this.store.get(url.pathname);
        return res.clone ? res.clone() : res;
      }
      if (this.store.has(url.href)) {
        const res = this.store.get(url.href);
        return res.clone ? res.clone() : res;
      }
    } catch {}
    return undefined;
  }

  async delete(request) {
    const key = typeof request === 'string' ? request : request.url;
    return this.store.delete(key);
  }

  async keys() {
    return Array.from(this.store.keys());
  }
}

class MockCacheStorage {
  constructor() {
    this.caches = new Map();
  }

  async open(cacheName) {
    if (!this.caches.has(cacheName)) {
      this.caches.set(cacheName, new MockCache(cacheName));
    }
    return this.caches.get(cacheName);
  }

  async has(cacheName) {
    return this.caches.has(cacheName);
  }

  async delete(cacheName) {
    return this.caches.delete(cacheName);
  }

  async keys() {
    return Array.from(this.caches.keys());
  }

  async match(request) {
    for (const cache of this.caches.values()) {
      const match = await cache.match(request);
      if (match) return match;
    }
    return undefined;
  }
}

function createSWEnvironment(swFilePath, networkHandler) {
  const listeners = {
    install: [],
    activate: [],
    fetch: [],
    message: []
  };

  const cacheStorage = new MockCacheStorage();
  let skipWaitingCalled = false;
  let clientsClaimCalled = false;

  const mockSelf = {
    addEventListener: (type, handler) => {
      if (listeners[type]) {
        listeners[type].push(handler);
      }
    },
    skipWaiting: async () => {
      skipWaitingCalled = true;
      return Promise.resolve();
    },
    clients: {
      claim: async () => {
        clientsClaimCalled = true;
        return Promise.resolve();
      }
    }
  };

  const context = {
    self: mockSelf,
    caches: cacheStorage,
    fetch: networkHandler,
    Response,
    Request,
    Headers,
    URL,
    console: {
      log: (...args) => console.log('   [SW Log]:', ...args),
      info: (...args) => console.log('   [SW Info]:', ...args),
      warn: (...args) => console.warn('   [SW Warn]:', ...args),
      error: (...args) => console.error('   [SW Error]:', ...args),
    },
    Promise,
    Array,
    Object,
    JSON,
    Map,
    Set,
    Boolean,
    String,
    Number,
    setTimeout,
    clearTimeout
  };

  vm.createContext(context);
  const code = fs.readFileSync(swFilePath, 'utf8');
  vm.runInContext(code, context);

  return {
    context,
    cacheStorage,
    listeners,
    get skipWaitingCalled() { return skipWaitingCalled; },
    get clientsClaimCalled() { return clientsClaimCalled; }
  };
}

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, title, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] ${title}`);
  } else {
    failedTests++;
    console.error(`  [FAIL] ${title}`);
    if (details) console.error(`     Details: ${details}`);
  }
}

async function runTestSuite() {
  const swFilesToTest = [
    { label: 'Public SW', path: path.join(process.cwd(), 'public', 'sw.js') },
    { label: 'Dist SW', path: path.join(process.cwd(), 'dist', 'sw.js') }
  ];

  for (const target of swFilesToTest) {
    console.log(`\n----------------------------------------------------------------`);
    console.log(`Testing Target: ${target.label} (${target.path})`);
    console.log(`----------------------------------------------------------------`);

    if (!fs.existsSync(target.path)) {
      assert(false, `Target file exists: ${target.path}`, 'File not found');
      continue;
    }
    assert(true, `Target file exists: ${target.path}`);

    const networkRequests = [];
    let isOnline = true;

    const mockFetch = async (input, init) => {
      const urlStr = typeof input === 'string' ? input : input.url;
      const url = new URL(urlStr, 'http://localhost:3000');
      networkRequests.push({ url: url.href, init, isOnline });

      if (!isOnline) {
        throw new TypeError('Failed to fetch: Network is offline');
      }

      // Handle Google Fonts
      if (url.hostname === 'fonts.gstatic.com' || url.pathname.endsWith('.woff2')) {
        return new Response('/* mock woff2 font binary data */', {
          status: 200,
          headers: { 'Content-Type': 'font/woff2' }
        });
      }
      if (url.hostname === 'fonts.googleapis.com') {
        return new Response('/* mock font css */', {
          status: 200,
          headers: { 'Content-Type': 'text/css' }
        });
      }

      // Handle API endpoints
      if (url.pathname.startsWith('/api/')) {
        if (url.pathname === '/api/shifts') {
          return new Response(JSON.stringify({ success: true, shifts: [{ id: 1, name: 'Shift A' }] }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        return new Response(JSON.stringify({ success: true, endpoint: url.pathname }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Handle HTML Navigation
      if (url.pathname === '/' || url.pathname === '/index.html' || url.pathname === '/shifts') {
        return new Response('<!DOCTYPE html><html><head><title>Enterprise OT</title></head><body><div id="root"></div></body></html>', {
          status: 200,
          headers: { 'Content-Type': 'text/html' }
        });
      }

      // Handle Manifests
      if (url.pathname === '/manifest.webmanifest' || url.pathname === '/manifest.json') {
        return new Response(JSON.stringify({ name: 'Enterprise OT Management Portal' }), {
          status: 200,
          headers: { 'Content-Type': 'application/manifest+json' }
        });
      }

      // Handle Vite bundled assets
      if (url.pathname.startsWith('/assets/')) {
        return new Response('console.log("vite bundle chunk");', {
          status: 200,
          headers: { 'Content-Type': 'application/javascript' }
        });
      }

      // Handle Icons & Images
      if (url.pathname.startsWith('/icons/') || url.pathname.endsWith('.png') || url.pathname.endsWith('.svg') || url.pathname.endsWith('.jpg') || url.pathname.endsWith('.ico')) {
        return new Response('/* mock image binary */', {
          status: 200,
          headers: { 'Content-Type': 'image/png' }
        });
      }

      return new Response('OK', { status: 200 });
    };

    const env = createSWEnvironment(target.path, mockFetch);

    // ============================================================
    // TEST 1: Simulate `install` event and pre-cache verification
    // ============================================================
    console.log('\n[Scenario 1] Install Event & Shell Pre-caching');
    assert(env.listeners.install.length > 0, 'Install event listener registered');

    let installWaitPromise = null;
    const mockInstallEvent = {
      waitUntil: (promise) => {
        installWaitPromise = promise;
      }
    };

    env.listeners.install[0](mockInstallEvent);
    await installWaitPromise;

    assert(env.skipWaitingCalled, 'self.skipWaiting() called during install');

    const shellCache = await env.cacheStorage.open('ot-portal-v1-shell');
    const cachedShellKeys = await shellCache.keys();
    console.log(`   Cached shell keys count: ${cachedShellKeys.length}`);

    const expectedPrecacheUrls = [
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

    let allPrecached = true;
    for (const url of expectedPrecacheUrls) {
      const match = await shellCache.match(url);
      if (!match) {
        allPrecached = false;
        console.error(`   Missing pre-cache: ${url}`);
      }
    }
    assert(allPrecached, `All ${expectedPrecacheUrls.length} pre-cache assets stored in ot-portal-v1-shell`);

    // ============================================================
    // TEST 2: Simulate `activate` event with legacy caches purge
    // ============================================================
    console.log('\n[Scenario 2] Activate Event & Legacy Cache Purging');
    assert(env.listeners.activate.length > 0, 'Activate event listener registered');

    // Populate some legacy & other caches
    await env.cacheStorage.open('ot-portal-v0-old-shell');
    await env.cacheStorage.open('ot-portal-v0-data');
    await env.cacheStorage.open('unrelated-app-cache'); // Should NOT be deleted
    await env.cacheStorage.open('ot-portal-v1-runtime');
    await env.cacheStorage.open('ot-portal-v1-fonts');
    await env.cacheStorage.open('ot-portal-v1-data');

    let activateWaitPromise = null;
    const mockActivateEvent = {
      waitUntil: (promise) => {
        activateWaitPromise = promise;
      }
    };

    env.listeners.activate[0](mockActivateEvent);
    await activateWaitPromise;

    assert(env.clientsClaimCalled, 'self.clients.claim() called during activate');

    const remainingCaches = await env.cacheStorage.keys();
    console.log(`   Remaining caches after activate:`, remainingCaches);

    assert(!remainingCaches.includes('ot-portal-v0-old-shell'), 'Legacy ot-portal-v0-old-shell was purged');
    assert(!remainingCaches.includes('ot-portal-v0-data'), 'Legacy ot-portal-v0-data was purged');
    assert(remainingCaches.includes('ot-portal-v1-shell'), 'Current ot-portal-v1-shell was preserved');
    assert(remainingCaches.includes('ot-portal-v1-runtime'), 'Current ot-portal-v1-runtime was preserved');
    assert(remainingCaches.includes('ot-portal-v1-fonts'), 'Current ot-portal-v1-fonts was preserved');
    assert(remainingCaches.includes('ot-portal-v1-data'), 'Current ot-portal-v1-data was preserved');
    assert(remainingCaches.includes('unrelated-app-cache'), 'Unrelated origin cache was safely untouched');

    // Helper for fetch dispatch
    const dispatchFetch = async (request) => {
      let respondWithPromise = null;
      const fetchEvent = {
        request,
        respondWith: (promise) => {
          respondWithPromise = promise;
        }
      };

      for (const listener of env.listeners.fetch) {
        listener(fetchEvent);
        if (respondWithPromise) break;
      }

      if (!respondWithPromise) {
        return null;
      }
      return await respondWithPromise;
    };

    // ============================================================
    // TEST 3: Navigation fallback when offline
    // ============================================================
    console.log('\n[Scenario 3] Offline SPA Navigation Fallback');
    isOnline = false; // GO OFFLINE!

    const navRequest = new Request('http://localhost:3000/shifts', {
      method: 'GET',
      headers: { 'Accept': 'text/html' }
    });
    Object.defineProperty(navRequest, 'mode', { value: 'navigate' });

    const navResponse = await dispatchFetch(navRequest);
    assert(navResponse !== null, 'Navigation fetch intercepted by Service Worker');
    assert(navResponse.status === 200, `Navigation returns status 200 (actual: ${navResponse?.status})`);
    const navText = await navResponse.text();
    assert(navText.includes('<div id="root"></div>'), 'Offline navigation responds with cached /index.html app shell');

    // ============================================================
    // TEST 4: Bundled static asset Cache-First behavior
    // ============================================================
    console.log('\n[Scenario 4] Static Assets & Media Cache-First Strategy');
    isOnline = true; // Back online to populate
    const assetRequest = new Request('http://localhost:3000/assets/index-D8xK7qLz.js', { method: 'GET' });
    
    // First fetch: fetches from network and caches in runtime cache
    const initialNetworkReqCount = networkRequests.length;
    const assetRes1 = await dispatchFetch(assetRequest);
    assert(assetRes1.status === 200, 'Initial static asset fetched successfully');
    assert(networkRequests.length === initialNetworkReqCount + 1, 'Network called on first request for un-cached asset');

    // Check runtime cache
    const runtimeCache = await env.cacheStorage.open('ot-portal-v1-runtime');
    const assetInCache = await runtimeCache.match('http://localhost:3000/assets/index-D8xK7qLz.js');
    assert(Boolean(assetInCache), 'Static asset stored into ot-portal-v1-runtime cache');

    // Second fetch: should hit cache without network
    isOnline = false; // Go offline to prove cache hit!
    const assetRes2 = await dispatchFetch(assetRequest);
    assert(assetRes2.status === 200, 'Subsequent static asset fetched while offline from Cache-First');
    const assetText = await assetRes2.text();
    assert(assetText.includes('vite bundle chunk'), 'Asset content retrieved accurately from cache');

    // Test static image icon
    const iconRequest = new Request('http://localhost:3000/icons/icon-192x192.png', { method: 'GET' });
    const iconRes = await dispatchFetch(iconRequest);
    assert(iconRes.status === 200, 'Icon asset served from cache while offline');

    // ============================================================
    // TEST 5: Google Fonts Stale-While-Revalidate caching
    // ============================================================
    console.log('\n[Scenario 5] Google Fonts Stale-While-Revalidate Strategy');
    isOnline = true;
    const fontRequest = new Request('https://fonts.gstatic.com/s/sarabun.woff2', { method: 'GET' });
    
    const fontRes1 = await dispatchFetch(fontRequest);
    assert(fontRes1.status === 200, 'Font request handled via SWR');

    // Allow background cache to populate
    await new Promise((r) => setTimeout(r, 50));
    const fontCache = await env.cacheStorage.open('ot-portal-v1-fonts');
    const fontInCache = await fontCache.match('https://fonts.gstatic.com/s/sarabun.woff2');
    assert(Boolean(fontInCache), 'Font cached in ot-portal-v1-fonts');

    // Offline font request returns cached version
    isOnline = false;
    const fontRes2 = await dispatchFetch(fontRequest);
    assert(fontRes2 !== null && fontRes2.status === 200, 'Font served from SWR cache when offline');

    // ============================================================
    // TEST 6: API Requests Network-First & Offline 503 Fallback
    // ============================================================
    console.log('\n[Scenario 6] API Requests Network-First & Offline 503 JSON Fallback');
    isOnline = false; // Offline mode

    const apiRequest = new Request('http://localhost:3000/api/shifts', { method: 'GET' });
    const apiRes = await dispatchFetch(apiRequest);
    assert(apiRes !== null, 'API request intercepted by SW');
    assert(apiRes.status === 503, `Offline API request returns 503 Service Unavailable (actual: ${apiRes.status})`);
    
    const apiData = await apiRes.json();
    assert(apiData.offline === true, 'Offline API response contains offline: true');
    assert(apiData.status === 'offline', 'Offline API response contains status: "offline"');
    assert(typeof apiData.message === 'string' && apiData.message.length > 0, 'Offline API response contains user-friendly message');

    // ============================================================
    // TEST 7: Message Event Handling (SKIP_WAITING, GET_VERSION)
    // ============================================================
    console.log('\n[Scenario 7] Message Event Handling');
    assert(env.listeners.message.length > 0, 'Message event listener registered');

    let versionResponse = null;
    const mockPort = {
      postMessage: (msg) => {
        versionResponse = msg;
      }
    };

    // Test SKIP_WAITING message
    env.listeners.message[0]({ data: { type: 'SKIP_WAITING' } });
    assert(true, 'SKIP_WAITING message dispatched without errors');

    // Test GET_VERSION message
    env.listeners.message[0]({
      data: { type: 'GET_VERSION' },
      ports: [mockPort]
    });
    assert(versionResponse && versionResponse.version === 'v1', `GET_VERSION returns version "v1" (actual: ${versionResponse?.version})`);

    // ============================================================
    // TEST 8: Dev / Vite routes bypass & Non-GET bypass
    // ============================================================
    console.log('\n[Scenario 8] Non-GET & Vite HMR Route Bypass');
    const postReq = new Request('http://localhost:3000/api/shifts', { method: 'POST', body: '{}' });
    const postRes = await dispatchFetch(postReq);
    assert(postRes === null, 'POST requests are not intercepted by SW (bypass directly to network)');

    const viteReq = new Request('http://localhost:3000/@vite/client', { method: 'GET' });
    const viteRes = await dispatchFetch(viteReq);
    assert(viteRes === null, 'Vite HMR routes (@vite/client) are bypassed');

    // ============================================================
    // ADVANCED ADVERSARIAL SCENARIO 9: Pre-cache Resilience under partial network failures (404/500/timeout)
    // ============================================================
    console.log('\n[Scenario 9] [Adversarial] Pre-cache resilience during partial network failure');
    const failingFetch = async (input) => {
      const urlStr = typeof input === 'string' ? input : input.url;
      if (urlStr.includes('favicon-16x16.png')) {
        throw new Error('Connection reset by peer');
      }
      if (urlStr.includes('login-bg.jpg')) {
        return new Response('Not Found', { status: 404 });
      }
      return new Response('OK', { status: 200 });
    };

    const resilientEnv = createSWEnvironment(target.path, failingFetch);
    let resilientInstallPromise = null;
    resilientEnv.listeners.install[0]({
      waitUntil: (p) => { resilientInstallPromise = p; }
    });
    let installThrew = false;
    try {
      await resilientInstallPromise;
    } catch (e) {
      installThrew = true;
    }
    assert(!installThrew, 'Install lifecycle does NOT throw even when some precache assets fail/404 (Promise.allSettled resilience)');
    assert(resilientEnv.skipWaitingCalled, 'self.skipWaiting() still executes successfully despite partial precache failure');

    // ============================================================
    // ADVANCED ADVERSARIAL SCENARIO 10: API Network-First with prior cached payload
    // ============================================================
    console.log('\n[Scenario 10] [Adversarial] API Network-First returns cached payload when offline');
    const apiEnv = createSWEnvironment(target.path, mockFetch);
    
    // Online fetch populates data cache
    isOnline = true;
    const initialApiReq = new Request('http://localhost:3000/api/shifts', { method: 'GET' });
    let initialApiPromise = null;
    apiEnv.listeners.fetch[0]({
      request: initialApiReq,
      respondWith: (p) => { initialApiPromise = p; }
    });
    const initialApiRes = await initialApiPromise;
    const initialJson = await initialApiRes.json();
    assert(initialJson.success === true && initialJson.shifts?.length === 1, 'Online API request succeeds and populates data cache');

    // Now go offline and request the same endpoint
    isOnline = false;
    let offlineApiPromise = null;
    apiEnv.listeners.fetch[0]({
      request: initialApiReq,
      respondWith: (p) => { offlineApiPromise = p; }
    });
    const offlineApiRes = await offlineApiPromise;
    assert(offlineApiRes.status === 200, `Cached API request returns 200 when offline (actual: ${offlineApiRes.status})`);
    const cachedData = await offlineApiRes.json();
    assert(cachedData.success === true && cachedData.shifts?.length === 1, 'Offline request receives previously cached data payload');

    // Now test uncached API endpoint while offline -> returns 503
    const uncachedApiReq = new Request('http://localhost:3000/api/employees/999/ot', { method: 'GET' });
    let uncachedApiPromise = null;
    apiEnv.listeners.fetch[0]({
      request: uncachedApiReq,
      respondWith: (p) => { uncachedApiPromise = p; }
    });
    const uncachedApiRes = await uncachedApiPromise;
    assert(uncachedApiRes.status === 503, `Uncached API request while offline returns 503 fallback (actual: ${uncachedApiRes.status})`);
    const fallbackJson = await uncachedApiRes.json();
    assert(fallbackJson.offline === true, 'Fallback payload contains offline: true');

    // ============================================================
    // ADVANCED ADVERSARIAL SCENARIO 11: Rapid Concurrent Font / SWR Requests
    // ============================================================
    console.log('\n[Scenario 11] [Adversarial] Rapid concurrent SWR Font requests under high load');
    isOnline = true;
    const concurrentFontRequests = Array.from({ length: 10 }, () => 
      new Request('https://fonts.gstatic.com/s/sarabun.woff2', { method: 'GET' })
    );

    const concurrentResults = await Promise.all(
      concurrentFontRequests.map(async (req) => {
        let p = null;
        apiEnv.listeners.fetch[0]({
          request: req,
          respondWith: (resPromise) => { p = resPromise; }
        });
        return await p;
      })
    );

    const all200 = concurrentResults.every(r => r && r.status === 200);
    assert(all200, 'All 10 rapid concurrent SWR requests resolved with 200 OK without race condition');
  }

  console.log('\n================================================================');
  console.log(`STRESS TEST SUMMARY: ${passedTests} passed, ${failedTests} failed, ${totalTests} total`);
  console.log('================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
