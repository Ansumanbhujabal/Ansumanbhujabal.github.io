import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

let html = '';
beforeAll(() => {
  execSync('npx astro build', { stdio: 'pipe' });
  html = readFileSync('dist/index.html', 'utf8');
}, 120_000);

describe('theme system', () => {
  it('defaults to light — no data-theme attribute is server-rendered', () => {
    expect(html).not.toMatch(/<html[^>]*data-theme=/);
  });
  it('applies the stored theme before the stylesheet loads', () => {
    const init = html.indexOf('data-theme-init');
    const sheet = html.search(/<link[^>]*rel="stylesheet"|<style/);
    expect(init).toBeGreaterThan(-1);
    expect(sheet).toBeGreaterThan(-1);
    expect(init).toBeLessThan(sheet);
  });
  it('renders an accessible toggle button', () => {
    expect(html).toContain('id="theme-toggle"');
    expect(html).toMatch(/aria-label="Toggle colour theme"/);
  });
  it('loads no external scripts', () => {
    expect(html).not.toMatch(/<script[^>]*\ssrc=/);
  });
});
