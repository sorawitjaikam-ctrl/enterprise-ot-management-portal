import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { usePWA } from '../../src/hooks/usePWA';
import { 
  registerServiceWorker, 
  unregisterServiceWorker, 
  skipWaitingAndReload, 
  checkForSWUpdate 
} from '../../src/pwa/registerServiceWorker';
import { MockBeforeInstallPromptEvent, setupServiceWorkerMocks } from '../mocks/mockServiceWorker';

// --------------------------------------------------------------------------
// SECTION 1: W3C Manifest Validation & Parity
// --------------------------------------------------------------------------
describe('Challenger Stress Suite - Web App Manifest W3C Compliance', () => {
  const pubWebmanifestPath = path.resolve(__dirname, '../../public/manifest.webmanifest');
  const pubJsonPath = path.resolve(__dirname, '../../public/manifest.json');
  const distWebmanifestPath = path.resolve(__dirname, '../../dist/manifest.webmanifest');

  it('CH.M1.1: Web App Manifest files exist in public and dist directories', () => {
    expect(fs.existsSync(pubWebmanifestPath)).toBe(true);
    expect(fs.existsSync(pubJsonPath)).toBe(true);
    expect(fs.existsSync(distWebmanifestPath)).toBe(true);
  });

  it('CH.M1.2: manifest.webmanifest and manifest.json maintain 100% exact parity', () => {
    const webmanifest = JSON.parse(fs.readFileSync(pubWebmanifestPath, 'utf8'));
    const jsonManifest = JSON.parse(fs.readFileSync(pubJsonPath, 'utf8'));
    expect(webmanifest).toEqual(jsonManifest);
  });

  it('CH.M1.3: dist/manifest.webmanifest matches public/manifest.webmanifest exactly', () => {
    const pub = JSON.parse(fs.readFileSync(pubWebmanifestPath, 'utf8'));
    const dist = JSON.parse(fs.readFileSync(distWebmanifestPath, 'utf8'));
    expect(pub).toEqual(dist);
  });

  it('CH.M1.4: Manifest strictly satisfies W3C Installability Criteria', () => {
    const manifest = JSON.parse(fs.readFileSync(pubWebmanifestPath, 'utf8'));
    
    // Identity & Display
    expect(manifest.name).toBe('Enterprise OT Management Portal - Double A Terminal');
    expect(manifest.short_name).toBe('Enterprise OT');
    expect(manifest.start_url).toBe('/?source=pwa');
    expect(manifest.scope).toBe('/');
    expect(manifest.display).toBe('standalone');
    expect(manifest.background_color).toBe('#0f172a');
    expect(manifest.theme_color).toBe('#0f172a');
    expect(manifest.orientation).toBe('any');
    expect(manifest.lang).toBe('th');
    expect(manifest.prefer_related_applications).toBe(false);

    // Icon Suite requirements (192, 512, any, maskable)
    expect(Array.isArray(manifest.icons)).toBe(true);
    expect(manifest.icons.length).toBeGreaterThanOrEqual(5);

    const has192Any = manifest.icons.some((i: any) => i.sizes === '192x192' && i.purpose === 'any');
    const has192Maskable = manifest.icons.some((i: any) => i.sizes === '192x192' && i.purpose === 'maskable');
    const has512Any = manifest.icons.some((i: any) => i.sizes === '512x512' && i.purpose === 'any');
    const has512Maskable = manifest.icons.some((i: any) => i.sizes === '512x512' && i.purpose === 'maskable');
    const hasSvg = manifest.icons.some((i: any) => i.sizes === 'any' && i.type === 'image/svg+xml');

    expect(has192Any).toBe(true);
    expect(has192Maskable).toBe(true);
    expect(has512Any).toBe(true);
    expect(has512Maskable).toBe(true);
    expect(hasSvg).toBe(true);

    // Shortcuts
    expect(manifest.shortcuts.length).toBe(4);
    const shortNames = manifest.shortcuts.map((s: any) => s.short_name);
    expect(shortNames).toContain('Dashboard');
    expect(shortNames).toContain('Shifts');
    expect(shortNames).toContain('Employees');
    expect(shortNames).toContain('OT History');
  });
});

// --------------------------------------------------------------------------
// SECTION 2: Binary Icon Integrity & Dimensions
// --------------------------------------------------------------------------
describe('Challenger Stress Suite - Binary Icon Verification & Dimensions', () => {
  function parsePngDimensions(buffer: Buffer) {
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

  const manifest = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../public/manifest.webmanifest'), 'utf8'));

  it('CH.IMG.1: All declared manifest icon URLs exist on disk with valid binaries and matching dimensions', () => {
    for (const icon of manifest.icons) {
      const relPath = icon.src.startsWith('/') ? icon.src.slice(1) : icon.src;
      const fullPath = path.resolve(__dirname, '../../public', relPath);
      expect(fs.existsSync(fullPath)).toBe(true);

      const buf = fs.readFileSync(fullPath);
      expect(buf.length).toBeGreaterThan(0);

      if (icon.type === 'image/png') {
        const { width, height } = parsePngDimensions(buf);
        const [expectedW, expectedH] = icon.sizes.split('x').map(Number);
        expect(width).toBe(expectedW);
        expect(height).toBe(expectedH);
      } else if (icon.type === 'image/svg+xml') {
        const str = buf.toString('utf8');
        expect(str).toContain('<svg');
        expect(str).toContain('xmlns="http://www.w3.org/2000/svg"');
      }
    }
  });

  it('CH.IMG.2: Shortcut icons exist and have valid PNG dimensions', () => {
    for (const shortcut of manifest.shortcuts) {
      if (shortcut.icons && Array.isArray(shortcut.icons)) {
        for (const icon of shortcut.icons) {
          const relPath = icon.src.startsWith('/') ? icon.src.slice(1) : icon.src;
          const fullPath = path.resolve(__dirname, '../../public', relPath);
          expect(fs.existsSync(fullPath)).toBe(true);
          const buf = fs.readFileSync(fullPath);
          const { width, height } = parsePngDimensions(buf);
          expect(width).toBe(192);
          expect(height).toBe(192);
        }
      }
    }
  });

  it('CH.IMG.3: Apple touch icon and favicons exist with proper dimensions', () => {
    const appleIconPath = path.resolve(__dirname, '../../public/icons/apple-touch-icon.png');
    const fav32Path = path.resolve(__dirname, '../../public/icons/favicon-32x32.png');
    const fav16Path = path.resolve(__dirname, '../../public/icons/favicon-16x16.png');

    const appleDim = parsePngDimensions(fs.readFileSync(appleIconPath));
    expect(appleDim.width).toBe(180);
    expect(appleDim.height).toBe(180);

    const fav32Dim = parsePngDimensions(fs.readFileSync(fav32Path));
    expect(fav32Dim.width).toBe(32);
    expect(fav32Dim.height).toBe(32);

    const fav16Dim = parsePngDimensions(fs.readFileSync(fav16Path));
    expect(fav16Dim.width).toBe(16);
    expect(fav16Dim.height).toBe(16);
  });
});

// --------------------------------------------------------------------------
// SECTION 3: HTML Meta Tags Exact String Matches
// --------------------------------------------------------------------------
describe('Challenger Stress Suite - HTML Meta Tags Exact Verification', () => {
  const indexHtml = fs.readFileSync(path.resolve(__dirname, '../../index.html'), 'utf8');

  it('CH.HTML.1: Exact theme-color meta tags', () => {
    expect(indexHtml).toContain('<meta name="theme-color" content="#0f172a" />');
    expect(indexHtml).toContain('<meta name="theme-color" media="(prefers-color-scheme: light)" content="#0f172a" />');
    expect(indexHtml).toContain('<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#0f172a" />');
  });

  it('CH.HTML.2: Exact iOS PWA meta tags', () => {
    expect(indexHtml).toContain('<meta name="apple-mobile-web-app-capable" content="yes" />');
    expect(indexHtml).toContain('<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />');
    expect(indexHtml).toContain('<meta name="apple-mobile-web-app-title" content="Enterprise OT" />');
    expect(indexHtml).toContain('<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />');
  });

  it('CH.HTML.3: Exact viewport meta tag with viewport-fit=cover', () => {
    expect(indexHtml).toContain('viewport-fit=cover');
    expect(indexHtml).toMatch(/<meta\s+name="viewport"\s+content="[^"]*width=device-width[^"]*viewport-fit=cover[^"]*"\s*\/>/);
  });
});

// --------------------------------------------------------------------------
// SECTION 4: usePWA & Service Worker Lifecycle Stress-Testing
// --------------------------------------------------------------------------
describe('Challenger Stress Suite - usePWA & SW Lifecycle Simulation', () => {
  beforeEach(() => {
    setupServiceWorkerMocks();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('CH.SW.1: Captures beforeinstallprompt event, calls preventDefault, and sets isInstallable to true', async () => {
    const { result } = renderHook(() => usePWA());
    expect(result.current.isInstallable).toBe(false);

    const event = new MockBeforeInstallPromptEvent();
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

    act(() => {
      window.dispatchEvent(event);
    });

    expect(preventDefaultSpy).toHaveBeenCalledTimes(1);
    expect(result.current.isInstallable).toBe(true);
  });

  it('CH.SW.2: promptInstall() executes deferred prompt and transitions state on user acceptance', async () => {
    const { result } = renderHook(() => usePWA());
    const event = new MockBeforeInstallPromptEvent();

    act(() => {
      window.dispatchEvent(event);
    });

    expect(result.current.isInstallable).toBe(true);

    let outcome: string | undefined;
    await act(async () => {
      outcome = await result.current.promptInstall();
    });

    expect(outcome).toBe('accepted');
    expect(result.current.isInstallable).toBe(false);
    expect(result.current.isInstalled).toBe(true);
  });

  it('CH.SW.3: promptInstall() handles user dismissal gracefully', async () => {
    const { result } = renderHook(() => usePWA());
    const event = new MockBeforeInstallPromptEvent();
    Object.defineProperty(event, 'userChoice', {
      value: Promise.resolve({ outcome: 'dismissed', platform: 'web' }),
      configurable: true
    });
    event.setUserChoice('dismissed');

    act(() => {
      window.dispatchEvent(event);
    });

    let outcome: string | undefined;
    await act(async () => {
      outcome = await result.current.promptInstall();
    });

    expect(outcome).toBe('dismissed');
    expect(result.current.isInstallable).toBe(false);
  });

  it('CH.SW.4: appinstalled event fires and marks isInstalled to true and clears isInstallable', () => {
    const { result } = renderHook(() => usePWA());
    const event = new MockBeforeInstallPromptEvent();

    act(() => {
      window.dispatchEvent(event);
    });
    expect(result.current.isInstallable).toBe(true);

    act(() => {
      window.dispatchEvent(new Event('appinstalled'));
    });

    expect(result.current.isInstallable).toBe(false);
    expect(result.current.isInstalled).toBe(true);
  });

  it('CH.SW.5: Online/offline event transitions update isOffline state reactively', () => {
    const { result } = renderHook(() => usePWA());

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    expect(result.current.isOffline).toBe(true);

    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    expect(result.current.isOffline).toBe(false);
  });

  it('CH.SW.6: pwa:update-available event triggers updateAvailable state and applyUpdate invokes skipWaiting', () => {
    const { result } = renderHook(() => usePWA());
    expect(result.current.updateAvailable).toBe(false);

    const mockReg = {
      waiting: {
        postMessage: vi.fn(),
      },
    } as unknown as ServiceWorkerRegistration;

    act(() => {
      window.dispatchEvent(new CustomEvent('pwa:update-available', { detail: { registration: mockReg } }));
    });

    expect(result.current.updateAvailable).toBe(true);
    expect(result.current.registration).toBe(mockReg);

    // Apply update
    act(() => {
      result.current.applyUpdate();
    });

    expect(mockReg.waiting?.postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' });

    // Dismiss update
    act(() => {
      result.current.dismissUpdate();
    });
    expect(result.current.updateAvailable).toBe(false);
  });

  it('CH.SW.7: Standalone mode detection logic handles matchMedia standalone display mode', () => {
    const matchMediaSpy = vi.spyOn(window, 'matchMedia').mockImplementation((query) => {
      if (query === '(display-mode: standalone)') {
        return {
          matches: true,
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        } as unknown as MediaQueryList;
      }
      return {
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      } as unknown as MediaQueryList;
    });

    const { result } = renderHook(() => usePWA());
    expect(result.current.isStandalone).toBe(true);
    expect(result.current.isInstalled).toBe(true);

    matchMediaSpy.mockRestore();
  });
});

// --------------------------------------------------------------------------
// SECTION 5: Touch Target Ergonomics (>=44x44px)
// --------------------------------------------------------------------------
describe('Challenger Stress Suite - Touch Ergonomics Compliance (>=44x44px)', () => {
  const pwaComponentsCode = fs.readFileSync(path.resolve(__dirname, '../../src/components/PWAComponents.tsx'), 'utf8');

  it('CH.TOUCH.1: PWAUpdateNotification action buttons satisfy >=44x44px minimum touch targets', () => {
    expect(pwaComponentsCode).toContain('className="min-h-[44px] px-4 py-2 bg-sky-600');
    expect(pwaComponentsCode).toContain('className="min-h-[44px] min-w-[44px] p-2 hover:bg-slate-800');
  });

  it('CH.TOUCH.2: PWAInstallButton satisfies >=44x44px touch targets across navbar and sidebar variants', () => {
    expect(pwaComponentsCode).toContain('min-h-[44px] flex items-center gap-1.5');
    expect(pwaComponentsCode).toContain('w-full min-h-[44px] flex items-center gap-3');
  });

  it('CH.TOUCH.3: PWAInstallBanner install and dismiss actions satisfy >=44x44px targets', () => {
    expect(pwaComponentsCode).toContain('min-h-[44px] px-3.5 py-1.5 bg-sky-500');
    expect(pwaComponentsCode).toContain('min-h-[44px] min-w-[44px] p-1.5 text-slate-400');
  });
});
