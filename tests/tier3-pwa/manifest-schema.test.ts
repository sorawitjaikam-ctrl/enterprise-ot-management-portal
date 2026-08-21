import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Tier 3: Web App Manifest Schema & Specification', () => {
  const manifestPath = path.resolve(__dirname, '../../public/manifest.webmanifest');
  let manifest: any;

  it('T3.1.1: manifest file exists and parses as valid JSON', () => {
    expect(fs.existsSync(manifestPath)).toBe(true);
    const content = fs.readFileSync(manifestPath, 'utf-8');
    expect(() => {
      manifest = JSON.parse(content);
    }).not.toThrow();
  });

  it('T3.1.2: manifest contains mandatory app identification metadata', () => {
    if (!manifest) manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    expect(manifest.name).toContain('Enterprise OT');
    expect(manifest.short_name).toBe('Enterprise OT');
    expect(manifest.start_url).toBeDefined();
    expect(manifest.scope).toBe('/');
  });

  it('T3.1.3: manifest specifies standalone display mode and orientation', () => {
    if (!manifest) manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    expect(manifest.display).toBe('standalone');
    expect(manifest.orientation).toBe('any');
  });

  it('T3.1.4: manifest theme and background colors match slate-900 enterprise branding (#0f172a)', () => {
    if (!manifest) manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    expect(manifest.theme_color).toBe('#0f172a');
    expect(manifest.background_color).toBe('#0f172a');
  });

  it('T3.1.5: manifest declares 192px and 512px icons with standard and maskable variants', () => {
    if (!manifest) manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    expect(Array.isArray(manifest.icons)).toBe(true);
    expect(manifest.icons.length).toBeGreaterThanOrEqual(2);

    const has192 = manifest.icons.some((i: any) => i.sizes === '192x192');
    const has512 = manifest.icons.some((i: any) => i.sizes === '512x512');
    const hasMaskable = manifest.icons.some((i: any) => i.purpose?.includes('maskable'));

    expect(has192).toBe(true);
    expect(has512).toBe(true);
    expect(hasMaskable).toBe(true);
  });

  it('T3.1.6: manifest defines quick-access shortcuts for operational efficiency', () => {
    if (!manifest) manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    expect(Array.isArray(manifest.shortcuts)).toBe(true);
    expect(manifest.shortcuts.length).toBeGreaterThanOrEqual(2);

    const names = manifest.shortcuts.map((s: any) => s.short_name || s.name);
    expect(names.some((n: string) => n.includes('Dashboard') || n.includes('Shifts'))).toBe(true);
  });
});
