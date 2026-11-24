import { describe, expect, it } from 'vitest';
import { duplicateKeys, normalizeUrl, parseIssueUrl } from '../src/lib/ingest/url';

describe('submitted URLs', () => {
  it('extracts the issue-form URL', () => expect(parseIssueUrl('### URL\n\nhttps://Example.com/a?utm_source=x#top')).toBe('https://Example.com/a?utm_source=x#top'));
  it('removes tracking and normalizes host/path', () => expect(normalizeUrl('https://Example.com/a/?utm_source=x&b=2#top')).toBe('https://example.com/a?b=2'));
  it('rejects non-HTTPS and embedded credentials', () => {
    expect(() => normalizeUrl('http://example.com')).toThrow(/HTTPS/);
    expect(() => normalizeUrl('https://user:pass@example.com')).toThrow(/credentials/);
  });
  it('makes canonical variants collide', () => expect(duplicateKeys(['https://example.com/a/', 'https://EXAMPLE.com/a'])).toEqual(['https://example.com/a']));
});
