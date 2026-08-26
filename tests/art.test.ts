import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

let html = '';
beforeAll(() => {
  execSync('npx astro build', { stdio: 'pipe' });
  html = readFileSync('dist/index.html', 'utf8');
}, 120_000);

describe('project illustrations', () => {
  it('renders one svg per project', () => {
    expect((html.match(/class="art"/g) ?? []).length).toBe(5);
  });
  it('gives every illustration an accessible label', () => {
    const svgs = html.match(/<svg[^>]*class="art"[^>]*>/g) ?? [];
    expect(svgs.length).toBe(5);
    for (const s of svgs) {
      expect(s).toContain('role="img"');
      expect(s).toMatch(/aria-label="[^"]{10,}"/);
    }
  });
  it('uses currentColor so illustrations follow the theme', () => {
    expect(html).toContain('stroke="currentColor"');
  });
  it('renders the projects in a horizontal grid, not a vertical step list', () => {
    expect(html).toContain('class="grid"');
    expect(html).not.toContain('class="step"');
  });
  it('renders each project story', () => {
    expect((html.match(/class="pc-story"/g) ?? []).length).toBe(5);
    expect(html).toContain('reservation agent');
    expect(html).toContain('Kenneth Anderson');
  });
});
