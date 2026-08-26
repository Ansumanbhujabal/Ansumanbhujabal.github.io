import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const FONTS_DIR = 'public/fonts';
const WOFF2_MAGIC = Buffer.from('wOF2', 'ascii');
const MIN_BYTES = 1000;
const EXPECTED_FILES = [
  'unica-one-400.woff2',
  'supreme-400.woff2',
  'supreme-500.woff2',
  'supreme-700.woff2',
];

describe('self-hosted font files', () => {
  const files = readdirSync(FONTS_DIR).filter((f) => f.endsWith('.woff2'));

  it('has at least the four expected font files present', () => {
    for (const expected of EXPECTED_FILES) {
      expect(files).toContain(expected);
    }
  });

  it('discovered at least four .woff2 files', () => {
    expect(files.length).toBeGreaterThanOrEqual(4);
  });

  // Discovered from the directory (not a hardcoded list) so any future
  // face is covered automatically.
  for (const file of readdirSync(FONTS_DIR).filter((f) => f.endsWith('.woff2'))) {
    describe(file, () => {
      const path = join(FONTS_DIR, file);

      it('is larger than 1000 bytes (not an empty or truncated download)', () => {
        expect(statSync(path).size).toBeGreaterThan(MIN_BYTES);
      });

      it('begins with the wOF2 magic bytes (not an HTML error page)', () => {
        const fd = readFileSync(path);
        expect(fd.subarray(0, 4).equals(WOFF2_MAGIC)).toBe(true);
      });
    });
  }
});
