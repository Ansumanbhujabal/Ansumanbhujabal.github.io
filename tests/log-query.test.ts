import { describe, expect, it } from 'vitest';
import { categorySlug, groupLogsByMonth, paginateLogs, relatedLogs, sortLogs } from '../src/lib/log/query';
import type { LogView } from '../src/lib/log/types';

const log = (slug: string, date: string, tags: string[] = [], category = 'general'): LogView => ({
  id: `${slug}.md`, slug, title: slug, url: `https://example.com/${slug}`,
  canonicalSourceUrl: `https://example.com/${slug}`, date: new Date(`${date}T00:00:00Z`),
  publishedAt: null, kind: 'read', author: null, source: 'Example', description: slug,
  synopsis: slug, category, contentType: 'article', tags, image: null, generation: 'manual', indexable: true,
});

describe('log archive queries', () => {
  const entries = Array.from({ length: 27 }, (_, i) => log(`entry-${i}`, `2026-11-${String(28 - i).padStart(2, '0')}`));
  it('sorts newest first and paginates at 25', () => {
    const pages = paginateLogs(sortLogs(entries, 'newest'), 25);
    expect(pages.map(page => page.length)).toEqual([25, 2]);
    expect(pages[0][0].slug).toBe('entry-0');
  });
  it('groups by UTC month', () => expect([...groupLogsByMonth(entries).keys()]).toContain('2026-11'));
  it('normalizes category slugs', () => expect(categorySlug('AI Safety & Evals')).toBe('ai-safety-evals'));
  it('ranks shared tags before recency', () => {
    const target = log('target', '2026-11-28', ['evals'], 'safety');
    const tagged = log('tagged', '2025-01-01', ['evals'], 'other');
    const recent = log('recent', '2026-11-27', [], 'other');
    expect(relatedLogs(target, [recent, tagged], 3)[0].slug).toBe('tagged');
  });
});
