import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { parseGithub, fetchGithub } from '../src/lib/fetchers/github.ts';

const fixture = JSON.parse(readFileSync('tests/fixtures/github.json', 'utf8'));

describe('parseGithub', () => {
  it('keys repos by nameWithOwner', () => {
    const out = parseGithub(fixture);
    expect(out['Ansumanbhujabal/Mentis']).toEqual({
      nameWithOwner: 'Ansumanbhujabal/Mentis', stars: 12, pushedAt: '2026-05-12T09:11:00Z',
    });
    expect(Object.keys(out)).toHaveLength(2);
  });
  it('ignores null repo entries', () => {
    expect(Object.keys(parseGithub({ data: { r0: null } }))).toHaveLength(0);
  });
  it('returns empty for a payload with no data', () => {
    expect(parseGithub({})).toEqual({});
  });
});

describe('fetchGithub', () => {
  it('throws when the API reports errors', async () => {
    globalThis.fetch = (async () => new Response(JSON.stringify({ errors: [{ message: 'bad' }] }), { status: 200 })) as typeof fetch;
    await expect(fetchGithub(['a/b'], 't')).rejects.toThrow('bad');
  });
  it('throws on a non-200 response', async () => {
    globalThis.fetch = (async () => new Response('nope', { status: 401 })) as typeof fetch;
    await expect(fetchGithub(['a/b'], 't')).rejects.toThrow('401');
  });
});
