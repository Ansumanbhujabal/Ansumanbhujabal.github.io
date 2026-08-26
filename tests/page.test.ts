import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

let html = '';
beforeAll(() => {
  execSync('npx astro build', { stdio: 'pipe' });
  html = readFileSync('dist/index.html', 'utf8');
}, 120_000);

describe('rendered page', () => {
  it('renders all five projects', () => {
    for (const n of ['Polly Harness','UltraDoc Intelligence','Mentis','Pugmark','Pulse']) {
      expect(html).toContain(n);
    }
  });
  it('does not render removed projects', () => {
    expect(html).not.toContain('NanoClaw');
    expect(html).not.toContain('Asymmetric Guardians');
  });
  it('numbers work entries with zero padding', () => {
    expect(html).toContain('>01<');
    expect(html).toContain('>05<');
  });
  it('ships no client-side javascript beyond ld+json and the inline theme script', () => {
    const scripts = [...html.matchAll(/<script([^>]*)>/g)].map(m => m[1]);
    const disallowed = scripts.filter(a =>
      !a.includes('application/ld+json') && !a.includes('data-theme-init'));
    expect(disallowed).toEqual([]);
    expect(html).not.toMatch(/\ssrc="/);
  });
  it('uses absolute dates and no relative time', () => {
    expect(html).toContain('26 Aug 2026');
    expect(html).not.toMatch(/days ago|Last updated/i);
  });
  it('links the résumé', () => {
    expect(html).toContain('/resume.pdf');
  });
});
