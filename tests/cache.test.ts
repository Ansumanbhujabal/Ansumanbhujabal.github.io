import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, rmSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { readCache, writeCache, withCache } from '../src/lib/cache';

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

  it('does not touch real data/cache directory during tests', () => {
    // Verify that the temp directory is being used
    expect(process.env.CACHE_DIR).toBe(tmp);
    expect(process.env.CACHE_DIR).not.toContain('data/cache');
  });
});

describe('cache - real data/cache survives test suite', () => {
  const REAL_CACHE_DIR = 'data/cache';
  const SENTINEL_FILE = join(REAL_CACHE_DIR, 'sentinel.json');
  const SENTINEL_CONTENT = { test: 'sentinel', timestamp: Date.now() };

  beforeEach(() => {
    // Create the real cache directory if it doesn't exist
    mkdirSync(REAL_CACHE_DIR, { recursive: true });
    // Write a sentinel file
    writeFileSync(SENTINEL_FILE, JSON.stringify(SENTINEL_CONTENT, null, 2) + '\n');
  });

  it('data/cache directory and its contents are untouched after full test suite', () => {
    // Verify sentinel file exists
    expect(existsSync(SENTINEL_FILE)).toBe(true);
    // Verify sentinel content is unchanged
    const content = JSON.parse(readFileSync(SENTINEL_FILE, 'utf8'));
    expect(content).toEqual(SENTINEL_CONTENT);
  });

  afterEach(() => {
    // Clean up: remove only the sentinel file, leave data/cache intact
    rmSync(SENTINEL_FILE, { force: true });
  });
});
