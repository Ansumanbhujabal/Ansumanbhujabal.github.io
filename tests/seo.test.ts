import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';

let html = '';
beforeAll(() => {
  execSync('npx astro build', { stdio: 'pipe' });
  html = readFileSync('dist/index.html', 'utf8');
}, 120_000);

describe('machine-readable surfaces', () => {
  it('emits valid JSON-LD Person', () => {
    const m = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    expect(m).not.toBeNull();
    const ld = JSON.parse(m![1]);
    expect(ld['@type']).toBe('Person');
    expect(ld.jobTitle).toBe('AI Engineer');
    expect(ld.knowsAbout).toContain('Model Context Protocol');
  });
  it('emits llms.txt, robots.txt, sitemap and resume', () => {
    expect(existsSync('dist/llms.txt')).toBe(true);
    expect(existsSync('dist/robots.txt')).toBe(true);
    expect(existsSync('dist/sitemap-index.xml')).toBe(true);
    expect(existsSync('dist/resume.pdf')).toBe(true);
  });
  it('allows AI crawlers', () => {
    const robots = readFileSync('dist/robots.txt', 'utf8');
    for (const bot of ['GPTBot','ClaudeBot','PerplexityBot','Google-Extended']) {
      expect(robots).toContain(bot);
    }
  });
  it('has a professional meta description with no personal-interest content', () => {
    const d = html.match(/<meta name="description" content="([^"]*)"/)![1];
    expect(d.toLowerCase()).not.toContain('anime');
    expect(d).toContain('AI engineer');
  });
});
