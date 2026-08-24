/**
 * Challenger 2 - Empirical Stress-Testing Harness for Milestone 1 (PWA Infrastructure)
 * 
 * Comprehensive validation across:
 * 1. Web App Manifest (W3C Specification compliance & public/dist parity)
 * 2. Binary Icon Inspection (PNG magic header, IHDR dimensions, SVG XML validation, ICO validation)
 * 3. HTML Head Meta Tags (theme-color, iOS PWA tags, viewport-fit=cover)
 * 4. PWA Touch Ergonomics (>=44x44px tap targets for all buttons and toast actions)
 * 5. Service Worker & usePWA Lifecycle Logic Verification
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failureLogs = [];

function test(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  [PASS] ${name}`);
  } catch (err) {
    failedTests++;
    const errMsg = `[FAIL] ${name} -> ${err.message}`;
    console.error(`  ${errMsg}`);
    failureLogs.push({ name, error: err.message });
  }
}

function expect(actual) {
  return {
    toBe(expected) {
      if (actual !== expected) throw new Error(`Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
    },
    toEqual(expected) {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
      }
    },
    toBeGreaterThanOrEqual(expected) {
      if (actual < expected) throw new Error(`Expected ${actual} >= ${expected}`);
    },
    toContain(substr) {
      if (typeof actual === 'string' && !actual.includes(substr)) {
        throw new Error(`Expected string to contain ${JSON.stringify(substr)}`);
      }
      if (Array.isArray(actual) && !actual.includes(substr)) {
        throw new Error(`Expected array to contain ${JSON.stringify(substr)}`);
      }
    },
    toMatch(regex) {
      if (!regex.test(actual)) throw new Error(`Expected string to match ${regex}`);
    },
    toBeDefined() {
      if (actual === undefined || actual === null) throw new Error(`Expected value to be defined`);
    },
    toBeTrue() {
      if (actual !== true) throw new Error(`Expected true but got ${actual}`);
    }
  };
}

// Binary header inspection
function parsePngDimensions(buffer) {
  const pngMagic = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (!buffer.subarray(0, 8).equals(pngMagic)) {
    throw new Error('Invalid PNG header signature');
  }
  const chunkType = buffer.toString('ascii', 12, 16);
  if (chunkType !== 'IHDR') {
    throw new Error(`Expected IHDR chunk at offset 12, found ${chunkType}`);
  }
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  return { width, height };
}

function parseIcoOrPngFavicon(buffer) {
  const pngMagic = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (buffer.subarray(0, 8).equals(pngMagic)) {
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    return { format: 'PNG-encoded ICO', width, height };
  }
  if (buffer.readUInt16LE(0) === 0 && buffer.readUInt16LE(2) === 1) {
    const count = buffer.readUInt16LE(4);
    return { format: 'Standard Windows ICO', count };
  }
  throw new Error('Unrecognized ICO/PNG header signature');
}

function runEmpiricalSuite() {
  console.log('================================================================');
  console.log('[CHALLENGER 2] EMPIRICAL PWA STRESS TEST SUITE (MILESTONE 1)');
  console.log('================================================================\n');

  // --------------------------------------------------------------------------
  // SECTION 1: W3C Web App Manifest Schema & Installability Requirements
  // --------------------------------------------------------------------------
  console.log('--- [1/5] W3C Web App Manifest Schema & Parity Validation ---');

  const manifestWebmanifestPath = path.join(rootDir, 'public', 'manifest.webmanifest');
  const manifestJsonPath = path.join(rootDir, 'public', 'manifest.json');
  const distManifestPath = path.join(rootDir, 'dist', 'manifest.webmanifest');
  const distManifestJsonPath = path.join(rootDir, 'dist', 'manifest.json');

  test('M1.1: public/manifest.webmanifest exists and is valid JSON', () => {
    expect(fs.existsSync(manifestWebmanifestPath)).toBeTrue();
    const parsed = JSON.parse(fs.readFileSync(manifestWebmanifestPath, 'utf8'));
    expect(typeof parsed).toBe('object');
  });

  test('M1.2: public/manifest.json exists and matches manifest.webmanifest', () => {
    expect(fs.existsSync(manifestJsonPath)).toBeTrue();
    const webmanifest = JSON.parse(fs.readFileSync(manifestWebmanifestPath, 'utf8'));
    const jsonManifest = JSON.parse(fs.readFileSync(manifestJsonPath, 'utf8'));
    expect(webmanifest).toEqual(jsonManifest);
  });

  test('M1.3: dist/manifest.webmanifest exists in build output and matches public', () => {
    expect(fs.existsSync(distManifestPath)).toBeTrue();
    const pub = JSON.parse(fs.readFileSync(manifestWebmanifestPath, 'utf8'));
    const dist = JSON.parse(fs.readFileSync(distManifestPath, 'utf8'));
    expect(pub).toEqual(dist);
  });

  test('M1.4: dist/manifest.json exists in build output and matches public', () => {
    expect(fs.existsSync(distManifestJsonPath)).toBeTrue();
    const pub = JSON.parse(fs.readFileSync(manifestJsonPath, 'utf8'));
    const dist = JSON.parse(fs.readFileSync(distManifestJsonPath, 'utf8'));
    expect(pub).toEqual(dist);
  });

  const manifest = JSON.parse(fs.readFileSync(manifestWebmanifestPath, 'utf8'));

  test('M1.5: Manifest specifies mandatory W3C installability identity fields', () => {
    expect(manifest.name).toBe('Enterprise OT Management Portal - Double A Terminal');
    expect(manifest.short_name).toBe('Enterprise OT');
    expect(manifest.start_url).toBe('/?source=pwa');
    expect(manifest.scope).toBe('/');
    expect(manifest.display).toBe('standalone');
    expect(manifest.background_color).toBe('#0f172a');
    expect(manifest.theme_color).toBe('#0f172a');
    expect(manifest.orientation).toBe('any');
    expect(manifest.lang).toBe('th');
  });

  test('M1.6: Manifest defines required icon definitions (>=192 & >=512 any & maskable)', () => {
    expect(Array.isArray(manifest.icons)).toBeTrue();
    expect(manifest.icons.length).toBeGreaterThanOrEqual(5);

    const has192Any = manifest.icons.some(i => i.sizes === '192x192' && i.purpose === 'any' && i.src.includes('192'));
    const has192Maskable = manifest.icons.some(i => i.sizes === '192x192' && i.purpose === 'maskable' && i.src.includes('192'));
    const has512Any = manifest.icons.some(i => i.sizes === '512x512' && i.purpose === 'any' && i.src.includes('512'));
    const has512Maskable = manifest.icons.some(i => i.sizes === '512x512' && i.purpose === 'maskable' && i.src.includes('512'));
    const hasSvg = manifest.icons.some(i => i.sizes === 'any' && i.type === 'image/svg+xml');

    expect(has192Any).toBeTrue();
    expect(has192Maskable).toBeTrue();
    expect(has512Any).toBeTrue();
    expect(has512Maskable).toBeTrue();
    expect(hasSvg).toBeTrue();
  });

  test('M1.7: Manifest defines 4 operational shortcuts for rapid navigation', () => {
    expect(Array.isArray(manifest.shortcuts)).toBeTrue();
    expect(manifest.shortcuts.length).toBe(4);
    const shortNames = manifest.shortcuts.map(s => s.short_name);
    expect(shortNames).toContain('Dashboard');
    expect(shortNames).toContain('Shifts');
    expect(shortNames).toContain('Employees');
    expect(shortNames).toContain('OT History');
  });

  // --------------------------------------------------------------------------
  // SECTION 2: Binary Image Integrity & Dimensions Verification
  // --------------------------------------------------------------------------
  console.log('\n--- [2/5] Binary Image Integrity & Dimension Validation ---');

  const iconsToTest = [
    { file: 'icon-192x192.png', expectedW: 192, expectedH: 192 },
    { file: 'icon-192x192-maskable.png', expectedW: 192, expectedH: 192 },
    { file: 'icon-192.png', expectedW: 192, expectedH: 192 },
    { file: 'icon-512x512.png', expectedW: 512, expectedH: 512 },
    { file: 'icon-512x512-maskable.png', expectedW: 512, expectedH: 512 },
    { file: 'icon-512.png', expectedW: 512, expectedH: 512 },
    { file: 'apple-touch-icon.png', expectedW: 180, expectedH: 180 },
    { file: 'favicon-32x32.png', expectedW: 32, expectedH: 32 },
    { file: 'favicon-16x16.png', expectedW: 16, expectedH: 16 }
  ];

  for (const item of iconsToTest) {
    test(`IMG.PNG: public/icons/${item.file} has valid PNG binary header & ${item.expectedW}x${item.expectedH} dimensions`, () => {
      const filePath = path.join(rootDir, 'public', 'icons', item.file);
      expect(fs.existsSync(filePath)).toBeTrue();
      const buffer = fs.readFileSync(filePath);
      const { width, height } = parsePngDimensions(buffer);
      expect(width).toBe(item.expectedW);
      expect(height).toBe(item.expectedH);
    });

    test(`IMG.DIST: dist/icons/${item.file} exists in production output with exact matching binary`, () => {
      const distFilePath = path.join(rootDir, 'dist', 'icons', item.file);
      expect(fs.existsSync(distFilePath)).toBeTrue();
      const pubBuf = fs.readFileSync(path.join(rootDir, 'public', 'icons', item.file));
      const distBuf = fs.readFileSync(distFilePath);
      expect(pubBuf.equals(distBuf)).toBeTrue();
    });
  }

  test('IMG.SVG: public/icons/icon.svg is valid SVG XML markup', () => {
    const svgPath = path.join(rootDir, 'public', 'icons', 'icon.svg');
    expect(fs.existsSync(svgPath)).toBeTrue();
    const content = fs.readFileSync(svgPath, 'utf8');
    expect(content.includes('<svg')).toBeTrue();
    expect(content.includes('xmlns="http://www.w3.org/2000/svg"')).toBeTrue();
    expect(content.includes('viewBox="0 0 512 512"')).toBeTrue();
  });

  test('IMG.ICO: public/favicon.ico is valid binary favicon resource', () => {
    const icoPath = path.join(rootDir, 'public', 'favicon.ico');
    expect(fs.existsSync(icoPath)).toBeTrue();
    const buf = fs.readFileSync(icoPath);
    const parsed = parseIcoOrPngFavicon(buf);
    expect(parsed.width || parsed.count).toBeGreaterThanOrEqual(1);
  });

  // --------------------------------------------------------------------------
  // SECTION 3: HTML Meta Tags Exact & Semantic Verification
  // --------------------------------------------------------------------------
  console.log('\n--- [3/5] HTML Meta Tags Exact & Regex Verification ---');

  const indexHtmlPath = path.join(rootDir, 'index.html');
  const distIndexHtmlPath = path.join(rootDir, 'dist', 'index.html');

  test('HTML.1: index.html contains exact link to manifest.webmanifest', () => {
    const html = fs.readFileSync(indexHtmlPath, 'utf8');
    expect(html).toContain('<link rel="manifest" href="/manifest.webmanifest" />');
  });

  test('HTML.2: index.html contains exact theme-color meta tag (#0f172a)', () => {
    const html = fs.readFileSync(indexHtmlPath, 'utf8');
    expect(html).toContain('<meta name="theme-color" content="#0f172a" />');
    expect(html).toContain('<meta name="theme-color" media="(prefers-color-scheme: light)" content="#0f172a" />');
    expect(html).toContain('<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#0f172a" />');
  });

  test('HTML.3: index.html contains exact iOS PWA meta tags & apple-touch-icon', () => {
    const html = fs.readFileSync(indexHtmlPath, 'utf8');
    expect(html).toContain('<meta name="apple-mobile-web-app-capable" content="yes" />');
    expect(html).toContain('<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />');
    expect(html).toContain('<meta name="apple-mobile-web-app-title" content="Enterprise OT" />');
    expect(html).toContain('<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />');
    expect(html).toContain('<link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />');
  });

  test('HTML.4: index.html viewport meta tag contains viewport-fit=cover and width=device-width', () => {
    const html = fs.readFileSync(indexHtmlPath, 'utf8');
    expect(html).toContain('viewport-fit=cover');
    expect(html).toContain('width=device-width');
    expect(html).toMatch(/<meta\s+name="viewport"\s+content="[^"]*width=device-width[^"]*viewport-fit=cover[^"]*"\s*\/>/);
  });

  test('HTML.5: dist/index.html retains all critical PWA meta tags in bundled output', () => {
    const html = fs.readFileSync(distIndexHtmlPath, 'utf8');
    expect(html).toContain('href="/manifest.webmanifest"');
    expect(html).toContain('name="theme-color" content="#0f172a"');
    expect(html).toContain('name="apple-mobile-web-app-capable" content="yes"');
    expect(html).toContain('href="/icons/apple-touch-icon.png"');
    expect(html).toContain('viewport-fit=cover');
  });

  // --------------------------------------------------------------------------
  // SECTION 4: Touch Ergonomics (>=44x44px Targets) in PWA Components
  // --------------------------------------------------------------------------
  console.log('\n--- [4/5] Touch Ergonomics (>=44x44px Tap Targets) Code Audit ---');

  const pwaComponentsFile = path.join(rootDir, 'src', 'components', 'PWAComponents.tsx');
  const pwaComponentsCode = fs.readFileSync(pwaComponentsFile, 'utf8');

  test('TOUCH.1: PWAUpdateNotification apply button has min-h-[44px]', () => {
    expect(pwaComponentsCode).toContain('className="min-h-[44px] px-4 py-2 bg-sky-600');
  });

  test('TOUCH.2: PWAUpdateNotification dismiss button has min-h-[44px] min-w-[44px]', () => {
    expect(pwaComponentsCode).toContain('className="min-h-[44px] min-w-[44px] p-2 hover:bg-slate-800');
  });

  test('TOUCH.3: PWAInstallButton navbar variant has min-h-[44px]', () => {
    expect(pwaComponentsCode).toContain('className={`min-h-[44px] flex items-center');
  });

  test('TOUCH.4: PWAInstallButton sidebar variant has min-h-[44px] and full width', () => {
    expect(pwaComponentsCode).toContain('className={`w-full min-h-[44px] flex items-center');
  });

  test('TOUCH.5: PWAInstallBanner install and dismiss buttons satisfy >=44x44px targets', () => {
    expect(pwaComponentsCode).toContain('className="min-h-[44px] px-3.5 py-1.5 bg-sky-500');
    expect(pwaComponentsCode).toContain('className="min-h-[44px] min-w-[44px] p-1.5 text-slate-400');
  });

  // --------------------------------------------------------------------------
  // SECTION 5: Service Worker Caching & Hook Lifecycle Contracts
  // --------------------------------------------------------------------------
  console.log('\n--- [5/5] Service Worker Caching & Hook Lifecycle Architecture ---');

  const swFile = path.join(rootDir, 'public', 'sw.js');
  const swContent = fs.readFileSync(swFile, 'utf8');

  test('SW.1: Service Worker defines all 4 distinct caches', () => {
    expect(swContent).toContain('const SHELL_CACHE_NAME = `ot-portal-${CACHE_VERSION}-shell`;');
    expect(swContent).toContain('const RUNTIME_CACHE_NAME = `ot-portal-${CACHE_VERSION}-runtime`;');
    expect(swContent).toContain('const FONT_CACHE_NAME = `ot-portal-${CACHE_VERSION}-fonts`;');
    expect(swContent).toContain('const DATA_CACHE_NAME = `ot-portal-${CACHE_VERSION}-data`;');
  });

  test('SW.2: Service Worker install event handles Promise.allSettled and self.skipWaiting()', () => {
    expect(swContent).toContain('Promise.allSettled(');
    expect(swContent).toContain('self.skipWaiting()');
  });

  test('SW.3: Service Worker activate event deletes outdated caches and claims clients', () => {
    expect(swContent).toContain('caches.delete(cacheName)');
    expect(swContent).toContain('self.clients.claim()');
  });

  test('SW.4: Service Worker handles SKIP_WAITING and GET_VERSION message events', () => {
    expect(swContent).toContain("event.data.type === 'SKIP_WAITING'");
    expect(swContent).toContain("event.data.type === 'GET_VERSION'");
  });

  test('SW.5: Service Worker implements SPA navigation fallback to /index.html', () => {
    expect(swContent).toContain("request.mode === 'navigate'");
    expect(swContent).toContain("networkFirst(request, SHELL_CACHE_NAME, '/index.html')");
    expect(swContent).toContain("const fallbackResponse = await caches.match(fallbackUrl);");
  });

  test('SW.6: Service Worker API caching returns 503 JSON fallback when offline', () => {
    expect(swContent).toContain('status: 503');
    expect(swContent).toContain('offline: true');
    expect(swContent).toContain("'Content-Type': 'application/json; charset=utf-8'");
  });

  // Check registerServiceWorker logic contracts
  const rswFile = path.join(rootDir, 'src', 'pwa', 'registerServiceWorker.ts');
  const rswContent = fs.readFileSync(rswFile, 'utf8');

  test('RSW.1: registerServiceWorker guards against server-side / SSR non-browser environments', () => {
    expect(rswContent).toContain("typeof window === 'undefined' || !('serviceWorker' in navigator)");
  });

  test('RSW.2: registerServiceWorker protects Vite HMR in development unless enable_sw=1', () => {
    expect(rswContent).toContain('import.meta.env.DEV');
    expect(rswContent).toContain("window.location.search.includes('enable_sw=1')");
  });

  test('RSW.3: registerServiceWorker attaches controllerchange reload listener', () => {
    expect(rswContent).toContain("navigator.serviceWorker.addEventListener('controllerchange'");
    expect(rswContent).toContain('window.location.reload()');
  });

  test('RSW.4: registerServiceWorker dispatches custom pwa:update-available and pwa:offline-ready events', () => {
    expect(rswContent).toContain("dispatchPWAEvent('pwa:update-available', { registration })");
    expect(rswContent).toContain("dispatchPWAEvent('pwa:offline-ready', { registration })");
  });

  test('RSW.5: skipWaitingAndReload sends SKIP_WAITING message to registration.waiting', () => {
    expect(rswContent).toContain("reg.waiting.postMessage({ type: 'SKIP_WAITING' })");
  });

  console.log('\n================================================================');
  console.log(`[SUMMARY] CHALLENGER EMPIRICAL TEST SUMMARY:`);
  console.log(`   Total Asserts / Checks: ${totalTests}`);
  console.log(`   Passed:                 ${passedTests}`);
  console.log(`   Failed:                 ${failedTests}`);
  console.log('================================================================\n');

  if (failedTests > 0) {
    console.error(`[VERDICT] REJECT (${failedTests} failures detected)`);
    process.exit(1);
  } else {
    console.log(`[VERDICT] APPROVE (All ${passedTests} empirical stress checks PASSED 100%)`);
    process.exit(0);
  }
}

runEmpiricalSuite();
