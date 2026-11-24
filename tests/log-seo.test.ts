import { beforeAll, describe, expect, it } from 'vitest';
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

beforeAll(() => execSync('npx astro build', { stdio: 'pipe' }), 120_000);

describe('log entry SEO', () => {
  const slug = '2026-09-06-ai-control';
  it('builds a permanent attributed entry page', () => {
    const html = readFileSync(`dist/log/${slug}/index.html`, 'utf8');
    expect(html).toContain('Read the original');
    expect(html).toContain('rel="canonical"');
    expect(html).toContain('BreadcrumbList');
    expect(html).toMatch(/"@type":"(BlogPosting|CreativeWork)"/);
  });
  it('publishes RSS and sitemap discovery', () => {
    expect(readFileSync('dist/log/rss.xml', 'utf8')).toContain('/log/');
    expect(readFileSync('dist/robots.txt', 'utf8')).toContain('Sitemap: https://ansumanbhujabal.github.io/sitemap-index.xml');
  });
});
