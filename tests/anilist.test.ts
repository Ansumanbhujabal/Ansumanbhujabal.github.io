import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { parseAniList, fetchAniList } from '../src/lib/fetchers/anilist.ts';

const fixture = JSON.parse(readFileSync('tests/fixtures/anilist.json', 'utf8'));

describe('parseAniList', () => {
  it('extracts the first current entry', () => {
    expect(parseAniList(fixture)).toEqual({ title: 'Himouto! Umaru-chan', progress: 0, episodes: 12 });
  });
  it('prefers english title but falls back to romaji', () => {
    const p = { data: { MediaListCollection: { lists: [{ entries: [
      { progress: 3, media: { title: { romaji: 'Nichijou', english: null }, episodes: 26 } }] }] } } };
    expect(parseAniList(p)?.title).toBe('Nichijou');
  });
  it('returns null when the list is empty', () => {
    expect(parseAniList({ data: { MediaListCollection: { lists: [] } } })).toBeNull();
  });
  it('returns null for an unexpected payload', () => {
    expect(parseAniList({})).toBeNull();
  });
  it('tolerates a missing episode count', () => {
    const p = { data: { MediaListCollection: { lists: [{ entries: [
      { progress: 1, media: { title: { english: 'X' }, episodes: null } }] }] } } };
    expect(parseAniList(p)?.episodes).toBeNull();
  });
});

describe('fetchAniList', () => {
  it('throws on a non-200 response', async () => {
    globalThis.fetch = (async () => new Response('x', { status: 500 })) as typeof fetch;
    await expect(fetchAniList('sputniksw')).rejects.toThrow('500');
  });
});
