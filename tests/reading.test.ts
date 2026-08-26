import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

let html = '';
beforeAll(() => {
  execSync('npx astro build', { stdio: 'pipe' });
  html = readFileSync('dist/index.html', 'utf8');
}, 120_000);

describe('reading portfolio', () => {
  it('renders all eight shelf names', () => {
    for (const name of [
      'Intellectual &amp; Personal Development',
      'Wildlife, Nature &amp; Conservation',
      'Classic Literature',
      'Contemporary &amp; Literary Fiction',
      'Magical Realism &amp; Philosophical Fiction',
      'Mystery &amp; Adventure',
      'Indian Literature',
      'Poetry &amp; Short Stories',
    ]) {
      expect(html).toContain(name);
    }
  });

  it('renders a representative title from each shelf', () => {
    for (const title of [
      'Sapiens: A Brief History of Humankind',
      'Man-Eaters of Kumaon',
      'Animal Farm',
      'The White Tiger',
      'Kafka on the Shore',
      'The ABC Murders',
      'The Blue Umbrella',
      'The Tell-Tale Heart',
    ]) {
      expect(html).toContain(title);
    }
  });

  it('renders exactly 44 book entries', () => {
    expect((html.match(/class="book"/g) ?? []).length).toBe(44);
  });

  it('appears after the log section and before the CTA', () => {
    const logIdx = html.indexOf('id="log"');
    const readingIdx = html.indexOf('id="reading"');
    const ctaIdx = html.indexOf('class="cta"');
    expect(logIdx).toBeGreaterThan(-1);
    expect(readingIdx).toBeGreaterThan(-1);
    expect(ctaIdx).toBeGreaterThan(-1);
    expect(readingIdx).toBeGreaterThan(logIdx);
    expect(readingIdx).toBeLessThan(ctaIdx);
  });

  it('does not render the excluded titles', () => {
    expect(html).not.toContain('Mental Hospital');
    expect(html).not.toContain('The Stranger');
    expect(html).not.toMatch(/class="book-t">96</);
  });
});
