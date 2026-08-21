import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

const rootDir = 'C:/Users/ssrwj/Documents/antigravity/mysterious-einstein';

console.log('====================================================');
console.log('🕵️ FORENSIC INTEGRITY AUDIT — MILESTONE 1');
console.log('====================================================\n');

let passCount = 0;
let failCount = 0;
const failures = [];

function check(label, condition, details = '') {
  if (condition) {
    console.log(`[PASS] ${label} ${details ? '(' + details + ')' : ''}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${label} ${details ? '--> ' + details : ''}`);
    failCount++;
    failures.push({ label, details });
  }
}

// ---------------------------------------------------------
// 1. MANIFEST FORENSICS
// ---------------------------------------------------------
console.log('\n--- 1. MANIFEST FORENSIC INSPECTION ---');
const manifestWebmanifestPath = path.join(rootDir, 'public', 'manifest.webmanifest');
const manifestJsonPath = path.join(rootDir, 'public', 'manifest.json');

check('manifest.webmanifest exists', fs.existsSync(manifestWebmanifestPath));
check('manifest.json exists', fs.existsSync(manifestJsonPath));

let wm, jm;
try {
  wm = JSON.parse(fs.readFileSync(manifestWebmanifestPath, 'utf8'));
  check('manifest.webmanifest is valid JSON', true);
} catch (e) {
  check('manifest.webmanifest is valid JSON', false, e.message);
}

try {
  jm = JSON.parse(fs.readFileSync(manifestJsonPath, 'utf8'));
  check('manifest.json is valid JSON', true);
} catch (e) {
  check('manifest.json is valid JSON', false, e.message);
}

if (wm) {
  check('Manifest name is non-empty string', typeof wm.name === 'string' && wm.name.length > 5, wm.name);
  check('Manifest short_name is non-empty string', typeof wm.short_name === 'string' && wm.short_name.length > 2, wm.short_name);
  check('Manifest start_url is defined', typeof wm.start_url === 'string' && wm.start_url.startsWith('/'), wm.start_url);
  check('Manifest display is standalone', wm.display === 'standalone', wm.display);
  check('Manifest theme_color is #0f172a', wm.theme_color === '#0f172a', wm.theme_color);
  check('Manifest background_color is #0f172a', wm.background_color === '#0f172a', wm.background_color);
  check('Manifest icons is array with >= 5 items', Array.isArray(wm.icons) && wm.icons.length >= 5, `count: ${wm.icons?.length}`);
  
  const icon192Any = wm.icons?.find(i => i.sizes === '192x192' && i.purpose === 'any');
  const icon192Maskable = wm.icons?.find(i => i.sizes === '192x192' && i.purpose === 'maskable');
  const icon512Any = wm.icons?.find(i => i.sizes === '512x512' && i.purpose === 'any');
  const icon512Maskable = wm.icons?.find(i => i.sizes === '512x512' && i.purpose === 'maskable');
  const iconSvg = wm.icons?.find(i => i.type === 'image/svg+xml');

  check('Icon 192x192 any purpose declared', !!icon192Any, icon192Any?.src);
  check('Icon 192x192 maskable purpose declared', !!icon192Maskable, icon192Maskable?.src);
  check('Icon 512x512 any purpose declared', !!icon512Any, icon512Any?.src);
  check('Icon 512x512 maskable purpose declared', !!icon512Maskable, icon512Maskable?.src);
  check('Icon SVG declared', !!iconSvg, iconSvg?.src);

  check('Shortcuts array has 4 functional entries', Array.isArray(wm.shortcuts) && wm.shortcuts.length === 4, `count: ${wm.shortcuts?.length}`);
  if (Array.isArray(wm.shortcuts)) {
    for (const sc of wm.shortcuts) {
      check(`Shortcut "${sc.name}" has valid url`, typeof sc.url === 'string' && sc.url.startsWith('/?tab='), sc.url);
    }
  }
}

// ---------------------------------------------------------
// 2. PNG & SVG BINARY FORENSICS
// ---------------------------------------------------------
console.log('\n--- 2. PNG & SVG BINARY FORENSIC INSPECTION ---');

// Helper to compute CRC32
function makeCrcTable() {
  let c;
  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) {
      c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
    }
    crcTable[n] = c;
  }
  return crcTable;
}
const crcTable = makeCrcTable();

function crc32(buf) {
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ (-1)) >>> 0;
}

function inspectPng(filePath, expectedWidth, expectedHeight) {
  const relName = path.basename(filePath);
  const exists = fs.existsSync(filePath);
  check(`File ${relName} exists`, exists);
  if (!exists) return;

  const buf = fs.readFileSync(filePath);
  check(`File ${relName} size > 100 bytes`, buf.length > 100, `${buf.length} bytes`);

  // PNG Signature: 89 50 4E 47 0D 0A 1A 0A
  const pngSig = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  const hasSig = buf.subarray(0, 8).equals(pngSig);
  check(`PNG Header Signature for ${relName}`, hasSig, buf.subarray(0, 8).toString('hex'));

  let offset = 8;
  let ihdrFound = false;
  let idatFound = false;
  let iendFound = false;
  let totalIdatBytes = 0;
  let crcAllValid = true;

  while (offset < buf.length) {
    if (offset + 8 > buf.length) break;
    const length = buf.readUInt32BE(offset);
    const typeBuf = buf.subarray(offset + 4, offset + 8);
    const typeStr = typeBuf.toString('ascii');
    const dataStart = offset + 8;
    const dataEnd = dataStart + length;
    const crcOffset = dataEnd;

    if (crcOffset + 4 > buf.length) {
      crcAllValid = false;
      break;
    }

    const expectedCrc = buf.readUInt32BE(crcOffset);
    const chunkDataForCrc = buf.subarray(offset + 4, crcOffset);
    const computedCrc = crc32(chunkDataForCrc);

    if (computedCrc !== expectedCrc) {
      crcAllValid = false;
      console.error(`CRC mismatch in ${relName} chunk ${typeStr}: computed ${computedCrc.toString(16)} vs expected ${expectedCrc.toString(16)}`);
    }

    if (typeStr === 'IHDR') {
      ihdrFound = true;
      const width = buf.readUInt32BE(dataStart);
      const height = buf.readUInt32BE(dataStart + 4);
      const bitDepth = buf.readUInt8(dataStart + 8);
      const colorType = buf.readUInt8(dataStart + 9);
      check(`IHDR Chunk in ${relName}`, true);
      check(`Dimensions for ${relName}: ${width}x${height}`, width === expectedWidth && height === expectedHeight, `expected ${expectedWidth}x${expectedHeight}`);
      check(`Color type & bit depth for ${relName}`, bitDepth >= 8 && (colorType === 2 || colorType === 6 || colorType === 3), `bitDepth=${bitDepth}, colorType=${colorType}`);
    } else if (typeStr === 'IDAT') {
      idatFound = true;
      totalIdatBytes += length;
    } else if (typeStr === 'IEND') {
      iendFound = true;
    }

    offset = crcOffset + 4;
  }

  check(`Chunk CRC integrity for ${relName}`, crcAllValid);
  check(`IDAT payload present in ${relName}`, idatFound && totalIdatBytes > 0, `IDAT bytes: ${totalIdatBytes}`);
  check(`IEND chunk present in ${relName}`, iendFound);
}

inspectPng(path.join(rootDir, 'public/icons/icon-192x192.png'), 192, 192);
inspectPng(path.join(rootDir, 'public/icons/icon-192x192-maskable.png'), 192, 192);
inspectPng(path.join(rootDir, 'public/icons/icon-192.png'), 192, 192);
inspectPng(path.join(rootDir, 'public/icons/icon-512x512.png'), 512, 512);
inspectPng(path.join(rootDir, 'public/icons/icon-512x512-maskable.png'), 512, 512);
inspectPng(path.join(rootDir, 'public/icons/icon-512.png'), 512, 512);
inspectPng(path.join(rootDir, 'public/icons/apple-touch-icon.png'), 180, 180);
inspectPng(path.join(rootDir, 'public/icons/favicon-32x32.png'), 32, 32);
inspectPng(path.join(rootDir, 'public/icons/favicon-16x16.png'), 16, 16);

// Inspect SVG
const svgPath = path.join(rootDir, 'public/icons/icon.svg');
check('icon.svg exists', fs.existsSync(svgPath));
if (fs.existsSync(svgPath)) {
  const svgContent = fs.readFileSync(svgPath, 'utf8');
  check('icon.svg contains <svg>', svgContent.includes('<svg') && svgContent.includes('</svg>'));
  check('icon.svg contains viewBox', svgContent.includes('viewBox='));
  check('icon.svg contains graphical elements', svgContent.includes('<path') || svgContent.includes('<rect') || svgContent.includes('<circle'));
}

// ---------------------------------------------------------
// 3. SERVICE WORKER LOGIC FORENSICS
// ---------------------------------------------------------
console.log('\n--- 3. SERVICE WORKER LOGIC FORENSIC INSPECTION ---');
const swPath = path.join(rootDir, 'public/sw.js');
check('public/sw.js exists', fs.existsSync(swPath));
if (fs.existsSync(swPath)) {
  const swCode = fs.readFileSync(swPath, 'utf8');
  
  check('sw.js installs event listener', swCode.includes("addEventListener('install'"));
  check('sw.js activates event listener', swCode.includes("addEventListener('activate'"));
  check('sw.js fetch event listener', swCode.includes("addEventListener('fetch'"));
  check('sw.js message event listener', swCode.includes("addEventListener('message'"));
  
  check('sw.js uses Promise.allSettled or cache.addAll for pre-caching', swCode.includes('Promise.allSettled') || swCode.includes('addAll'));
  check('sw.js calls self.skipWaiting()', swCode.includes('skipWaiting()'));
  check('sw.js calls self.clients.claim()', swCode.includes('clients.claim()'));
  check('sw.js deletes old caches in activate', swCode.includes('caches.delete') && swCode.includes('caches.keys()'));
  
  check('sw.js implements cacheFirst helper', swCode.includes('cacheFirst(') && swCode.includes('caches.match') && swCode.includes('cache.put'));
  check('sw.js implements networkFirst helper', swCode.includes('networkFirst(') && swCode.includes('fetch(') && swCode.includes('caches.match'));
  check('sw.js implements staleWhileRevalidate helper', swCode.includes('staleWhileRevalidate('));
  check('sw.js provides 503 offline JSON response for /api/*', swCode.includes('503') && swCode.includes('โหมดออฟไลน์'));
  check('sw.js provides navigation fallback to /index.html', swCode.includes("request.mode === 'navigate'") && swCode.includes('/index.html'));
  
  check('sw.js handles SKIP_WAITING postMessage', swCode.includes('SKIP_WAITING'));
  check('sw.js handles GET_VERSION postMessage', swCode.includes('GET_VERSION'));
}

// ---------------------------------------------------------
// 4. CLIENT INTEGRATION & REACT HOOK FORENSICS
// ---------------------------------------------------------
console.log('\n--- 4. CLIENT INTEGRATION FORENSIC INSPECTION ---');
const regSwPath = path.join(rootDir, 'src/pwa/registerServiceWorker.ts');
check('src/pwa/registerServiceWorker.ts exists', fs.existsSync(regSwPath));
if (fs.existsSync(regSwPath)) {
  const regCode = fs.readFileSync(regSwPath, 'utf8');
  check('registerServiceWorker checks "serviceWorker" in navigator', regCode.includes("'serviceWorker' in navigator"));
  check('registerServiceWorker prevents HMR breakage in DEV', regCode.includes('import.meta.env.DEV') && regCode.includes('enable_sw=1'));
  check('registerServiceWorker listens to controllerchange', regCode.includes("'controllerchange'"));
  check('registerServiceWorker listens to load event', regCode.includes("'load'"));
  check('registerServiceWorker listens to updatefound', regCode.includes("'updatefound'"));
  check('registerServiceWorker exports unregisterServiceWorker', regCode.includes('export async function unregisterServiceWorker'));
  check('registerServiceWorker exports skipWaitingAndReload', regCode.includes('export function skipWaitingAndReload'));
}

const usePWAPath = path.join(rootDir, 'src/hooks/usePWA.ts');
check('src/hooks/usePWA.ts exists', fs.existsSync(usePWAPath));
if (fs.existsSync(usePWAPath)) {
  const pwaCode = fs.readFileSync(usePWAPath, 'utf8');
  check('usePWA captures beforeinstallprompt', pwaCode.includes("'beforeinstallprompt'"));
  check('usePWA captures appinstalled', pwaCode.includes("'appinstalled'"));
  check('usePWA detects standalone display mode', pwaCode.includes('(display-mode: standalone)'));
  check('usePWA monitors online/offline window events', pwaCode.includes("'online'") && pwaCode.includes("'offline'"));
  check('usePWA manages updateAvailable state', pwaCode.includes('updateAvailable') && pwaCode.includes('pwa:update-available'));
  check('usePWA returns promptInstall action', pwaCode.includes('promptInstall'));
}

const pwaCompPath = path.join(rootDir, 'src/components/PWAComponents.tsx');
check('src/components/PWAComponents.tsx exists', fs.existsSync(pwaCompPath));
if (fs.existsSync(pwaCompPath)) {
  const compCode = fs.readFileSync(pwaCompPath, 'utf8');
  check('PWAComponents exports PWAUpdateNotification', compCode.includes('export const PWAUpdateNotification'));
  check('PWAComponents exports PWAInstallButton', compCode.includes('export const PWAInstallButton'));
  check('PWAComponents exports PWAOfflineBadge', compCode.includes('export const PWAOfflineBadge'));
  check('PWAComponents exports PWAInstallBanner', compCode.includes('export const PWAInstallBanner'));
  check('PWA components have min-h-[44px] touch target sizes', compCode.includes('min-h-[44px]'));
}

// Check index.html
const indexHtmlPath = path.join(rootDir, 'index.html');
const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
check('index.html links manifest', indexHtml.includes('rel="manifest" href="/manifest.webmanifest"'));
check('index.html defines viewport-fit=cover', indexHtml.includes('viewport-fit=cover'));
check('index.html defines theme-color', indexHtml.includes('name="theme-color" content="#0f172a"'));
check('index.html defines apple-mobile-web-app-capable', indexHtml.includes('name="apple-mobile-web-app-capable" content="yes"'));
check('index.html defines apple-touch-icon', indexHtml.includes('rel="apple-touch-icon" href="/icons/apple-touch-icon.png"'));

// Check main.tsx
const mainTsxPath = path.join(rootDir, 'src/main.tsx');
const mainTsx = fs.readFileSync(mainTsxPath, 'utf8');
check('src/main.tsx calls registerServiceWorker', mainTsx.includes('registerServiceWorker('));

// Check App.tsx and Navbar.tsx
const appTsxPath = path.join(rootDir, 'src/App.tsx');
const appTsx = fs.readFileSync(appTsxPath, 'utf8');
check('src/App.tsx mounts PWAUpdateNotification', appTsx.includes('<PWAUpdateNotification'));

const navTsxPath = path.join(rootDir, 'src/components/Navbar.tsx');
const navTsx = fs.readFileSync(navTsxPath, 'utf8');
check('src/components/Navbar.tsx mounts PWAOfflineBadge', navTsx.includes('<PWAOfflineBadge'));
check('src/components/Navbar.tsx mounts PWAInstallButton', navTsx.includes('<PWAInstallButton'));

// ---------------------------------------------------------
// 5. DIST OUTPUT INTEGRITY
// ---------------------------------------------------------
console.log('\n--- 5. DIST OUTPUT INTEGRITY INSPECTION ---');
const distDir = path.join(rootDir, 'dist');
check('dist directory exists', fs.existsSync(distDir));
check('dist/index.html exists', fs.existsSync(path.join(distDir, 'index.html')));
check('dist/sw.js exists', fs.existsSync(path.join(distDir, 'sw.js')));
check('dist/manifest.webmanifest exists', fs.existsSync(path.join(distDir, 'manifest.webmanifest')));
check('dist/manifest.json exists', fs.existsSync(path.join(distDir, 'manifest.json')));
check('dist/icons/icon-192x192.png exists', fs.existsSync(path.join(distDir, 'icons/icon-192x192.png')));
check('dist/icons/icon-512x512.png exists', fs.existsSync(path.join(distDir, 'icons/icon-512x512.png')));

console.log('\n====================================================');
console.log(`TOTAL CHECKS: ${passCount + failCount}`);
console.log(`PASSED: ${passCount}`);
console.log(`FAILED: ${failCount}`);
console.log('====================================================');

if (failCount > 0) {
  console.error('\n❌ FORENSIC VERDICT: INTEGRITY VIOLATION');
  console.error(JSON.stringify(failures, null, 2));
  process.exit(1);
} else {
  console.log('\n✅ FORENSIC VERDICT: CLEAN');
  process.exit(0);
}
