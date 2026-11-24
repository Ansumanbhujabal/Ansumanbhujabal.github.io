import { beforeAll, describe, expect, it } from 'vitest';
import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

beforeAll(() => execSync('npx astro build', { stdio: 'pipe' }), 120_000);

describe('log archive pages', () => {
  it('builds the archive and enhancement index', () => {
    expect(existsSync('dist/log/index.html')).toBe(true);
    expect(existsSync('dist/log/search.json')).toBe(true);
  });
  it('renders real entry and category links', () => {
    const html = readFileSync('dist/log/index.html', 'utf8');
    expect(html).toMatch(/href="\/log\/[^"/]+\/?"/);
    expect(html).toMatch(/href="\/log\/category\/[^"/]+\/?"/);
    expect(html).not.toContain('<details class="log-more">');
  });
  it('keeps archive content visible without the enhancement script', () => {
    const html = readFileSync('dist/log/index.html', 'utf8');
    expect(html).toContain('data-log-row');
    expect(html).toMatch(/<nav[^>]*aria-label="Log pagination"/);
  });
});
