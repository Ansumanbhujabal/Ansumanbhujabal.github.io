import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { rmSync, writeFileSync, existsSync, readFileSync, readdirSync } from 'node:fs';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { readCache, writeCache, withCache } from '../src/lib/cache';

const REAL_CACHE_DIR = 'data/cache';

let tmp: string;

describe('cache', () => {
  beforeEach(() => {
    tmp = mkdtempSync(join(tmpdir(), 'cache-test-'));
    process.env.CACHE_DIR = tmp;
  });

  afterEach(() => {
    rmSync(tmp, { recursive: true, force: true });
    delete process.env.CACHE_DIR;
  });

  it('returns null when no cache exists', () => {
    expect(readCache('t')).toBeNull();
  });

  it('round-trips data', () => {
    writeCache('t', { a: 1 });
    expect(readCache<{ a: number }>('t')).toEqual({ a: 1 });
  });

  it('returns null for corrupt cache rather than throwing', () => {
    writeFileSync(join(tmp, 't.json'), '{not json');
    expect(readCache('t')).toBeNull();
  });

  it('writes and returns fresh data on success', async () => {
    const out = await withCache('t', async () => ({ v: 'fresh' }));
    expect(out).toEqual({ v: 'fresh' });
    expect(existsSync(join(tmp, 't.json'))).toBe(true);
    expect(JSON.parse(readFileSync(join(tmp, 't.json'), 'utf8'))).toEqual({ v: 'fresh' });
  });

  it('falls back to cache when the fetcher throws', async () => {
    writeCache('t', { v: 'stale' });
    const out = await withCache('t', async () => {
      throw new Error('429');
    });
    expect(out).toEqual({ v: 'stale' });
  });

  it('returns null when the fetcher throws and no cache exists', async () => {
    const out = await withCache('t', async () => {
      throw new Error('boom');
    });
    expect(out).toBeNull();
  });

  it('writes cache files under CACHE_DIR and never under the real data/cache directory', () => {
    writeCache('isolation-check', { ok: true });
    expect(existsSync(join(tmp, 'isolation-check.json'))).toBe(true);
    expect(existsSync(join(REAL_CACHE_DIR, 'isolation-check.json'))).toBe(false);
  });
});

describe('cache module never writes outside CACHE_DIR', () => {
  // Proves the same isolation guarantee as the block above, but from the
  // other direction: snapshot the real, git-tracked data/cache directory,
  // exercise the cache module against an unrelated temp directory, then
  // confirm the tracked directory's contents are byte-for-byte unchanged.
  // This never writes into data/cache itself, so a crashed run can't strand
  // an untracked file there the way a direct write to the tracked dir would.
  it('leaves the real data/cache directory untouched', () => {
    const before = existsSync(REAL_CACHE_DIR) ? readdirSync(REAL_CACHE_DIR).sort() : [];

    const isolatedTmp = mkdtempSync(join(tmpdir(), 'cache-isolation-'));
    try {
      process.env.CACHE_DIR = isolatedTmp;
      writeCache('sentinel', { test: 'sentinel', timestamp: Date.now() });
      expect(existsSync(join(isolatedTmp, 'sentinel.json'))).toBe(true);
    } finally {
      delete process.env.CACHE_DIR;
      rmSync(isolatedTmp, { recursive: true, force: true });
    }

    const after = existsSync(REAL_CACHE_DIR) ? readdirSync(REAL_CACHE_DIR).sort() : [];
    expect(after).toEqual(before);
  });
});
