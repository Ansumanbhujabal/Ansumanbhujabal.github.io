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
    // Scoped to the log section: "Parasyte -the maxim-" legitimately
    // reappears later as an anime title in the reading section.
    const logIdx = html.indexOf('id="log"');
    const readingIdx = html.indexOf('id="reading"');
    expect(logIdx).toBeGreaterThan(-1);
    expect(readingIdx).toBeGreaterThan(logIdx);
    const logSection = html.slice(logIdx, readingIdx);
    expect(logSection).not.toContain('Parasyte');
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
  it('omits education from the page entirely, including machine-readable metadata', () => {
      // Generic terms on purpose: naming the institution in order to assert
      // its absence would publish it in this repo, defeating the exclusion.
      expect(html).not.toMatch(/B\.?Tech|SGPA|Engineering College|alumniOf/i);
  });
  it('shows exactly the five intended entries and nothing else', () => {
    // Asserted positively on purpose: naming excluded employers in a test
    // would publish them in this repo, defeating the exclusion.
    expect((html.match(/class="tl-i"/g) ?? []).length).toBe(5);
  });
  it('appears above the capabilities section', () => {
    expect(html.indexOf('id="timeline"')).toBeGreaterThan(-1);
    expect(html.indexOf('id="timeline"')).toBeLessThan(html.indexOf('Three Things'));
  });
});
