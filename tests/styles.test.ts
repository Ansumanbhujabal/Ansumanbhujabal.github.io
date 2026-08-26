import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

describe('design tokens', () => {
  const css = readFileSync('src/styles/global.css', 'utf8');
  it('defines light tokens as the default on :root', () => {
    const root = css.slice(css.indexOf(':root{'), css.indexOf(':root[data-theme="dark"]'));
    for (const t of ['--bg:#f6f6ef','--sf:#ffffff','--bd:#dddddd','--tx:#1a1a1a','--mu:#666660','--ac:#b84700']) {
      expect(root).toContain(t);
    }
  });
  it('defines dark tokens under the data-theme attribute', () => {
    const dark = css.slice(css.indexOf(':root[data-theme="dark"]'));
    for (const t of ['--bg:#0d1117','--sf:#161b22','--bd:#30363d','--tx:#e6edf3','--mu:#8b949e','--ac:#70d100']) {
      expect(dark).toContain(t);
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
