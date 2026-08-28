import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

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
  it('renders five entries', () => {
    expect((html.match(/class="li"/g) ?? []).length).toBe(5);
  });
  it('links every entry to its source, in a new tab', () => {
    for (const href of LINKS) {
      const re = new RegExp(`<a[^>]*href="${href.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*>`);
      const m = html.match(re);
      expect(m, `missing link ${href}`).not.toBeNull();
      expect(m![0]).toContain('target="_blank"');
      expect(m![0]).toContain('rel="noopener noreferrer"');
    }
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
