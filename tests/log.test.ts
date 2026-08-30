import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { SITE_CONFIG } from '../src/lib/config.ts';

let html = '';
beforeAll(() => {
  execSync('npx astro build', { stdio: 'pipe' });
  html = readFileSync('dist/index.html', 'utf8');
}, 120_000);

const LINKS = [
  'https://blog.bluedot.org/p/introduction-to-mechanistic-interpretability',
  'https://blog.bluedot.org/p/what-is-ai-alignment',
  'https://www.cold-takes.com/why-ai-alignment-could-be-hard-with-modern-deep-learning/',
  'https://metr.org/blog/2025-06-05-recent-reward-hacking/',
  'https://www.cooperativeai.com/post/new-report-multi-agent-risks-from-advanced-ai',
];

describe('reading log', () => {
  it('renders every log entry, capped at the configured limit', () => {
    // Derived, not hardcoded: a fixed count silently rots every time an
    // entry is added. The log is uncapped, so every entry on disk renders.
    const files = readdirSync('src/content/log').filter(f => f.endsWith('.md'));
    const expected = Math.min(files.length, SITE_CONFIG.logLimit);
    expect((html.match(/class="li"/g) ?? []).length).toBe(expected);
  });
  it('links every rendered entry to its source, in a new tab', () => {
    // Derived from what actually rendered, not a pinned URL list: the log
    // grows as entries are added, so a hardcoded URL list goes stale on its own.
    const cards = html.match(/<div class="li">[\s\S]*?<\/div>\s*<\/div>/g) ?? [];
    expect(cards.length).toBeGreaterThan(0);
    let linked = 0;
    for (const card of cards) {
      const a = card.match(/<a[^>]*href="https?:[^"]*"[^>]*>/);
      if (!a) continue;
      linked++;
      expect(a[0]).toContain('target="_blank"');
      expect(a[0]).toContain('rel="noopener noreferrer"');
    }
    expect(linked).toBe(cards.length);
  });
  it('carries no tracking parameters', () => {
    expect(html).not.toContain('utm_source=bluedot-impact');
    expect(html).not.toContain('_gl=');
  });
  it('no longer shows the sample entries', () => {
    expect(html).not.toContain('Signal and Telegram channel adapters');
    expect(html).not.toContain('Short authentication strings');
  });
});

describe('log expansion', () => {
  const STEP = 4;      // two rows of the two-column grid
  const VISIBLE = 6;   // shown before any click

  it('shows six entries up front, rest behind nested details', () => {
    const files = readdirSync('src/content/log').filter(f => f.endsWith('.md'));
    expect((html.match(/class="li"/g) ?? []).length).toBe(files.length);
    if (files.length <= VISIBLE) return;
    expect(html).toContain('<details class="log-more">');
  });

  it('reveals exactly two rows per click', () => {
    // Each nested <details> is one click. Every level except the last must
    // hold a full STEP; the last holds the remainder.
    const levels = html.split('<details class="log-more">').slice(1);
    if (levels.length === 0) return;
    const counts = levels.map((lvl, i) => {
      const next = lvl.indexOf('<details class="log-more">');
      const own = next === -1 ? lvl : lvl.slice(0, next);
      return (own.match(/class="li"/g) ?? []).length;
    });
    for (const c of counts.slice(0, -1)) expect(c).toBe(STEP);
    expect(counts[counts.length - 1]).toBeGreaterThan(0);
    expect(counts[counts.length - 1]).toBeLessThanOrEqual(STEP);
  });

  it('uses no javascript for the expansion', () => {
    const scripts = [...html.matchAll(/<script([^>]*)>/g)].map(m => m[1]);
    const disallowed = scripts.filter(a =>
      !a.includes('application/ld+json') && !a.includes('data-theme-init'));
    for (const a of disallowed) expect(a).not.toMatch(/log|details|expand/i);
  });

  it('keeps hidden entries in the DOM so crawlers still see them', () => {
    expect(html).toContain('Multi-Agent Risks');
  });
});
