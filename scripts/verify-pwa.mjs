import fs from 'fs';
import path from 'path';

function assert(condition, message) {
  if (!condition) {
    console.error(`[FAIL] Assertion Failed: ${message}`);
    process.exit(1);
  }
  console.log(`[PASS] Passed: ${message}`);
}

console.log('--- Verifying Progressive Web App (PWA) Infrastructure ---\n');

// 1. Verify Manifest files
const manifestPath = path.join(process.cwd(), 'public', 'manifest.webmanifest');
const manifestJsonPath = path.join(process.cwd(), 'public', 'manifest.json');
assert(fs.existsSync(manifestPath), 'public/manifest.webmanifest exists');
assert(fs.existsSync(manifestJsonPath), 'public/manifest.json exists');

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
assert(manifest.name === 'Enterprise OT Management Portal - Double A Terminal', 'Manifest name is correct');
assert(manifest.short_name === 'Enterprise OT', 'Manifest short_name is correct');
assert(manifest.display === 'standalone', 'Manifest display is standalone');
assert(manifest.background_color === '#0f172a', 'Manifest background_color is #0f172a');
assert(manifest.theme_color === '#0f172a', 'Manifest theme_color is #0f172a');
assert(Array.isArray(manifest.icons) && manifest.icons.length >= 5, 'Manifest has >= 5 icon definitions');

const has192Any = manifest.icons.some(i => i.sizes === '192x192' && i.purpose === 'any');
const has192Maskable = manifest.icons.some(i => i.sizes === '192x192' && i.purpose === 'maskable');
const has512Any = manifest.icons.some(i => i.sizes === '512x512' && i.purpose === 'any');
const has512Maskable = manifest.icons.some(i => i.sizes === '512x512' && i.purpose === 'maskable');
assert(has192Any && has192Maskable && has512Any && has512Maskable, 'Manifest contains 192 and 512 any and maskable icons');
assert(Array.isArray(manifest.shortcuts) && manifest.shortcuts.length === 4, 'Manifest contains 4 functional shortcuts');

// 2. Verify Icon files
const requiredIcons = [
  'icon.svg',
  'icon-192x192.png',
  'icon-192x192-maskable.png',
  'icon-512x512.png',
  'icon-512x512-maskable.png',
  'apple-touch-icon.png',
  'favicon-32x32.png',
  'favicon-16x16.png'
];

for (const icon of requiredIcons) {
  const iconPath = path.join(process.cwd(), 'public', 'icons', icon);
  assert(fs.existsSync(iconPath), `public/icons/${icon} exists`);
  const stat = fs.statSync(iconPath);
  assert(stat.size > 0, `public/icons/${icon} has valid size (${stat.size} bytes)`);
}
assert(fs.existsSync(path.join(process.cwd(), 'public', 'favicon.ico')), 'public/favicon.ico exists');

// 3. Verify Service Worker (public/sw.js)
const swPath = path.join(process.cwd(), 'public', 'sw.js');
assert(fs.existsSync(swPath), 'public/sw.js exists');
const swContent = fs.readFileSync(swPath, 'utf8');
assert(swContent.includes('ot-portal-v1-shell'), 'sw.js contains shell cache');
assert(swContent.includes('ot-portal-v1-runtime'), 'sw.js contains runtime cache');
assert(swContent.includes('ot-portal-v1-fonts'), 'sw.js contains fonts cache');
assert(swContent.includes('ot-portal-v1-data'), 'sw.js contains data cache');
assert(swContent.includes('skipWaiting()'), 'sw.js includes skipWaiting()');
assert(swContent.includes('clients.claim()'), 'sw.js includes clients.claim()');
assert(swContent.includes("request.mode === 'navigate'"), 'sw.js handles SPA navigation fallback');
assert(swContent.includes('/index.html'), 'sw.js falls back to /index.html');
assert(swContent.includes('staleWhileRevalidate'), 'sw.js implements SWR strategy');
assert(swContent.includes('SKIP_WAITING'), 'sw.js handles SKIP_WAITING message');
assert(swContent.includes('GET_VERSION'), 'sw.js handles GET_VERSION message');

// 4. Verify index.html
const indexHtmlPath = path.join(process.cwd(), 'index.html');
const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
assert(indexHtml.includes('rel="manifest" href="/manifest.webmanifest"'), 'index.html links manifest');
assert(indexHtml.includes('name="theme-color" content="#0f172a"'), 'index.html has theme-color');
assert(indexHtml.includes('name="apple-mobile-web-app-capable" content="yes"'), 'index.html has iOS web-app-capable');
assert(indexHtml.includes('rel="apple-touch-icon" href="/icons/apple-touch-icon.png"'), 'index.html has apple-touch-icon');
assert(indexHtml.includes('viewport-fit=cover'), 'index.html has viewport-fit=cover');

// 5. Verify PWA client source code
const pwaRegisterPath = path.join(process.cwd(), 'src', 'pwa', 'registerServiceWorker.ts');
const usePWAPath = path.join(process.cwd(), 'src', 'hooks', 'usePWA.ts');
const pwaComponentsPath = path.join(process.cwd(), 'src', 'components', 'PWAComponents.tsx');
assert(fs.existsSync(pwaRegisterPath), 'src/pwa/registerServiceWorker.ts exists');
assert(fs.existsSync(usePWAPath), 'src/hooks/usePWA.ts exists');
assert(fs.existsSync(pwaComponentsPath), 'src/components/PWAComponents.tsx exists');

// 6. Verify dist output
const distSwPath = path.join(process.cwd(), 'dist', 'sw.js');
const distManifestPath = path.join(process.cwd(), 'dist', 'manifest.webmanifest');
const distIndexHtml = path.join(process.cwd(), 'dist', 'index.html');
assert(fs.existsSync(distSwPath), 'dist/sw.js generated');
assert(fs.existsSync(distManifestPath), 'dist/manifest.webmanifest copied');
assert(fs.existsSync(distIndexHtml), 'dist/index.html generated');

console.log('\n[PASS] ALL PWA VERIFICATION CHECKS PASSED PERFECTLY!');
