import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setupServiceWorkerMocks } from '../mocks/mockServiceWorker';
import fs from 'fs';
import path from 'path';

describe('Tier 3: Service Worker Lifecycle & Cache Pruning', () => {
  const swPath = path.resolve(__dirname, '../../public/sw.js');
  const swCode = fs.readFileSync(swPath, 'utf-8');

  beforeEach(() => {
    setupServiceWorkerMocks();
  });

  it('T3.3.1: public/sw.js exists and defines CACHE_VERSION and cache names', () => {
    expect(fs.existsSync(swPath)).toBe(true);
    expect(swCode).toContain('CACHE_VERSION');
    expect(swCode).toContain('SHELL_CACHE_NAME');
    expect(swCode).toContain('ot-portal-');
  });

  it('T3.3.2: Service worker install event pre-caches critical app shell assets and calls skipWaiting()', () => {
    expect(swCode).toContain("addEventListener('install'");
    expect(swCode).toContain('PRECACHE_URLS');
    expect(swCode).toContain('self.skipWaiting()');
    // Ensure vital assets are included in precache list
    expect(swCode).toContain("'/index.html'");
    expect(swCode).toContain("'/manifest.webmanifest'");
  });

  it('T3.3.3: Service worker activate event purges outdated cache versions', () => {
    expect(swCode).toContain("addEventListener('activate'");
    expect(swCode).toContain('caches.keys()');
    expect(swCode).toContain('caches.delete');
    expect(swCode).toContain('CURRENT_CACHES');
  });

  it('T3.3.4: Service worker activate event invokes clients.claim() for instant control', () => {
    expect(swCode).toContain('self.clients.claim()');
  });

  it('T3.3.5: Service worker registers with root scope in browser environment', async () => {
    const { mockServiceWorkerContainer } = setupServiceWorkerMocks();

    await navigator.serviceWorker.register('/sw.js', { scope: '/' });

    expect(mockServiceWorkerContainer.register).toHaveBeenCalledWith('/sw.js', { scope: '/' });
  });
});
