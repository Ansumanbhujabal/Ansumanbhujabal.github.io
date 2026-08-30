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
