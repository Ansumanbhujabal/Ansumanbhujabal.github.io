import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

describe('design tokens', () => {
  const css = readFileSync('src/styles/global.css', 'utf8');
  it('defines every required token', () => {
    for (const t of ['--bg:#0d1117','--sf:#161b22','--bd:#30363d','--tx:#e6edf3','--mu:#8b949e','--ac:#70d100']) {
      expect(css).toContain(t);
    }
  });
  it('has no light-mode branch', () => {
    expect(css).not.toContain('prefers-color-scheme');
  });
  it('self-hosts fonts rather than using a CDN', () => {
    expect(css).toContain("url('/fonts/");
    expect(css).not.toContain('fonts.googleapis.com');
    expect(css).not.toContain('api.fontshare.com');
  });
});
