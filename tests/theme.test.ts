import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

let html = '';
beforeAll(() => {
  execSync('npx astro build', { stdio: 'pipe' });
  html = readFileSync('dist/index.html', 'utf8');
}, 120_000);

describe('theme system', () => {
  it('server-renders with no data-theme attribute — the client decides', () => {
    // Static generation can't know a visitor's stored choice or OS
    // preference, so <html> must ship theme-less and let the inline
    // init script apply the right one before first paint.
    expect(html).not.toMatch(/<html[^>]*data-theme=/);
  });
  it('defaults to the OS/browser preference when no explicit choice is stored', () => {
    const init = html.slice(html.indexOf('data-theme-init'), html.indexOf('</script>', html.indexOf('data-theme-init')));
    expect(init).toContain("localStorage.getItem('theme')");
    expect(init).toContain('matchMedia');
    expect(init).toContain('prefers-color-scheme: dark');
  });
  it('applies the resolved theme before the stylesheet loads', () => {
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
