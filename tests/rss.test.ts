import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { parseRss, fetchRss } from '../src/lib/fetchers/rss.ts';

describe('parseRss', () => {
  it('parses RSS 2.0 items and strips CDATA', () => {
    const out = parseRss(readFileSync('tests/fixtures/medium.xml', 'utf8'), 10);
    expect(out).toHaveLength(2);
    expect(out[0]).toEqual({
      title: 'Building an adversarial test suite',
      url: 'https://medium.com/p/a',
      date: 'Tue, 12 Aug 2026 10:00:00 GMT',
    });
  });
  it('parses Atom entries with href links', () => {
    const out = parseRss(readFileSync('tests/fixtures/youtube.xml', 'utf8'), 10);
    expect(out[0].title).toBe('What breaks when you put an agent in production');
    expect(out[0].url).toBe('https://youtu.be/abc');
  });
  it('respects the limit', () => {
    expect(parseRss(readFileSync('tests/fixtures/medium.xml', 'utf8'), 1)).toHaveLength(1);
  });
  it('returns an empty array for junk input', () => {
    expect(parseRss('not xml', 5)).toEqual([]);
  });
});

describe('fetchRss', () => {
  it('throws on a non-200 response', async () => {
    globalThis.fetch = (async () => new Response('x', { status: 404 })) as typeof fetch;
    await expect(fetchRss('https://example.com/feed', 3)).rejects.toThrow('404');
  });
});
