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
  it('numbers all five projects with zero padding', () => {
    for (const n of ['01','02','03','04','05']) {
      expect(html).toContain(`class="pc-no">${n}<`);
    }
  });
  it('ships no client-side javascript beyond ld+json and the inline theme scripts', () => {
    const scripts = [...html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)];
    const disallowed = scripts.filter(([, attrs, body]) =>
      !attrs.includes('application/ld+json') &&
      !attrs.includes('data-theme-init') &&
      !body.includes("getElementById('theme-toggle')"));
    expect(disallowed).toEqual([]);
    // No element loads an external src — except <img>, which the hero's
    // self-hosted decorative GIF legitimately needs. <script src> is
    // already covered above (and again, more narrowly, in theme.test.ts).
    const srcAttrs = [...html.matchAll(/<(\w+)[^>]*\ssrc="/g)];
    const disallowedSrc = srcAttrs.filter(([, tag]) => tag !== 'img');
    expect(disallowedSrc).toEqual([]);
  });
  it('perches the hero cat on a self-hosted asset, not a remote embed', () => {
    expect(html).toContain('class="hero-cat" src="/sakamoto-survive.gif"');
    expect(html).not.toContain('tenor.com');
  });
  it('places the timeline sticker on a self-hosted asset too', () => {
    expect(html).toContain('class="tl-cat" src="/nano-nervous.gif"');
  });
  it('uses absolute dates and no relative time', () => {
    expect(html).toContain('26 Aug 2026');
    expect(html).not.toMatch(/days ago|Last updated/i);
  });
  it('links the résumé', () => {
    expect(html).toContain('/resume.pdf');
  });
  it('opens outbound links in a new tab, safely', () => {
    const anchors = [...html.matchAll(/<a\s([^>]*)>/g)].map(m => m[1]);
    const outbound = anchors.filter(a => /href="(https?:|\/resume)/.test(a));
    expect(outbound.length).toBeGreaterThan(5);
    for (const a of outbound) {
      expect(a).toContain('target="_blank"');
      expect(a).toContain('rel="noopener noreferrer"');
    }
    const internal = anchors.filter(a => /href="(#|mailto:)/.test(a));
    for (const a of internal) expect(a).not.toContain('target="_blank"');
  });
  it('shows no status pills on project cards', () => {
    expect(html).not.toContain('class="pill');
  });
  it('makes the wordmark a to-top link', () => {
    expect(html).toMatch(/<a[^>]*class="brand"[^>]*href="#top"/);
    expect(html).toContain('id="top"');
  });
  it('lays the projects out five per row', () => {
    const css = readFileSync('src/styles/global.css', 'utf8');
    expect(css).toContain('grid-template-columns:repeat(5,1fr)');
  });
  it('does not pitch a seniority level', () => {
    expect(html.toLowerCase()).not.toContain('senior');
  });
  it('names the roles being sought', () => {
    for (const r of ['AI Architect', 'AI Safety Engineer', 'generalist']) {
      expect(html).toContain(r);
    }
  });
});
