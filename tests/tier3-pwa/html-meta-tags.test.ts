import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Tier 3: HTML Head & PWA Meta Tags (index.html)', () => {
  const indexPath = path.resolve(__dirname, '../../index.html');
  const htmlContent = fs.readFileSync(indexPath, 'utf-8');

  it('T3.2.1: index.html contains rel="manifest" link', () => {
    expect(htmlContent).toMatch(/<link\s+[^>]*rel=["']manifest["'][^>]*>/i);
    expect(htmlContent).toContain('/manifest.webmanifest');
  });

  it('T3.2.2: index.html sets theme-color meta tag to #0E3A66', () => {
    expect(htmlContent).toMatch(/<meta\s+[^>]*name=["']theme-color["'][^>]*content=["']#(0E3A66|0e3a66|0f172a)["'][^>]*>/i);
  });

  it('T3.2.3: index.html configures Apple iOS standalone meta tags', () => {
    expect(htmlContent).toMatch(/<meta\s+[^>]*name=["']apple-mobile-web-app-capable["'][^>]*content=["']yes["'][^>]*>/i);
    expect(htmlContent).toMatch(/<meta\s+[^>]*name=["']apple-mobile-web-app-status-bar-style["'][^>]*content=["']black-translucent["'][^>]*>/i);
  });

  it('T3.2.4: index.html configures apple-touch-icon link', () => {
    expect(htmlContent).toMatch(/<link\s+[^>]*rel=["']apple-touch-icon["'][^>]*href=["'][^"']+["'][^>]*>/i);
  });

  it('T3.2.5: index.html viewport meta tag includes viewport-fit=cover and width=device-width', () => {
    expect(htmlContent).toMatch(/<meta\s+[^>]*name=["']viewport["'][^>]*content=["'][^"']*viewport-fit=cover[^"']*["'][^>]*>/i);
    expect(htmlContent).toContain('width=device-width');
  });
});
