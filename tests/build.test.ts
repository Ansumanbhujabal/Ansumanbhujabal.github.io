import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { execSync } from 'node:child_process';

describe('build', () => {
  it('produces dist/index.html', () => {
    execSync('npx astro build', { stdio: 'pipe' });
    expect(existsSync('dist/index.html')).toBe(true);
  }, 120_000);
});
