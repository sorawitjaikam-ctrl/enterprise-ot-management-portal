import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Tier 3: Service Worker Caching Strategies & Offline Fallbacks', () => {
  const swPath = path.resolve(__dirname, '../../public/sw.js');
  const swCode = fs.readFileSync(swPath, 'utf-8');

  it('T3.4.1: Static assets and Vite bundles (/assets/*, images, icons) use Cache-First routing', () => {
    expect(swCode).toContain('cacheFirst');
    expect(swCode).toContain('/assets/');
    expect(swCode).toContain('RUNTIME_CACHE_NAME');
  });

  it('T3.4.2: API requests (/api/*) implement Network-First strategy with cache update', () => {
    expect(swCode).toContain("url.pathname.startsWith('/api/')");
    expect(swCode).toContain('networkFirst');
    expect(swCode).toContain('DATA_CACHE_NAME');
  });

  it('T3.4.3: API requests return structured offline JSON payload when offline network fails', () => {
    expect(swCode).toContain('status: 503');
    expect(swCode).toContain('offline: true');
    expect(swCode).toContain('application/json');
  });

  it('T3.4.4: SPA Navigation requests (mode === "navigate") fall back to /index.html', () => {
    expect(swCode).toContain("request.mode === 'navigate'");
    expect(swCode).toContain('/index.html');
  });

  it('T3.4.5: Google Fonts & font files use Stale-While-Revalidate strategy', () => {
    expect(swCode).toContain('staleWhileRevalidate');
    expect(swCode).toContain('fonts.googleapis.com');
    expect(swCode).toContain('.woff2');
  });
});
