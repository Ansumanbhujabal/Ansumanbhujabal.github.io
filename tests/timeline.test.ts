import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

let html = '';
beforeAll(() => {
  execSync('npx astro build', { stdio: 'pipe' });
  html = readFileSync('dist/index.html', 'utf8');
}, 120_000);

describe('career timeline', () => {
  it('no longer renders the removed Parasyte log entry', () => {
    expect(html).not.toContain('Parasyte');
  });
  it('lays the projects out five per row on wide screens', () => {
    const css = readFileSync('src/styles/global.css', 'utf8');
    expect(css).toContain('.grid{display:grid;grid-template-columns:repeat(5,1fr)');
  });
  it('renders every role', () => {
    for (const o of ['BlueDot Impact','Anyfeast','Stealth Browser AI Startup','Stealth AI Healthtech Startup','Invest4Edu']) {
      expect(html).toContain(o);
    }
  });
  it('shows periods with month and year', () => {
    expect(html).toContain('Feb 2025 — Present');
    expect(html).toContain('May 2024 — Jan 2025');
  });
  it('omits education from the visible page', () => {
    // Scoped to <body> — the pre-existing JSON-LD Person schema in the <head>
    // (src/layouts/Base.astro, out of scope for this task) intentionally
    // retains alumniOf for machine-readable/SEO purposes, same as llms.txt.
    // The requirement here is that no human-visible page content mentions it.
    const body = html.slice(html.indexOf('<body>'));
    expect(body).not.toContain('Parala Maharaja');
    expect(body).not.toMatch(/B\.?Tech/i);
    expect(body).not.toContain('SGPA');
  });
  it('shows exactly the five intended entries and nothing else', () => {
    expect((html.match(/class=\"tl-i\"/g) ?? []).length).toBe(5);
  });
  it('appears above the capabilities section', () => {
    expect(html.indexOf('id="timeline"')).toBeGreaterThan(-1);
    expect(html.indexOf('id="timeline"')).toBeLessThan(html.indexOf('Three Things'));
  });
});
