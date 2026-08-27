import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { SHELVES, ANIME } from '../src/data/reading.ts';

let html = '';
beforeAll(() => {
  execSync('npx astro build', { stdio: 'pipe' });
  html = readFileSync('dist/index.html', 'utf8');
}, 120_000);

describe('reading portfolio', () => {
  it('renders all eight book shelf names', () => {
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

  it('renders a representative title from each book shelf', () => {
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

  it('renders all six anime shelf names', () => {
    for (const name of [
      'Ghibli &amp; Hand-Drawn Worlds',
      'Films That Ruined Me',
      'Speed &amp; Fists',
      'Psychological &amp; Thriller',
      'Slice of Life &amp; Chaos',
      'Romance',
    ]) {
      expect(html).toContain(name);
    }
  });

  it('renders a representative title from each anime shelf, including stated favourites', () => {
    for (const title of [
      'My Neighbor Totoro',
      'Your Name.',
      'MF GHOST',
      'Death Note',
      'GTO: Great Teacher Onizuka',
      'Nichijou - My Ordinary Life',
      'Horimiya',
    ]) {
      expect(html).toContain(title);
    }
  });

  it('renders exactly 109 title entries (44 books + 65 anime)', () => {
    expect((html.match(/class="book"/g) ?? []).length).toBe(109);
  });

  it('shows Books and Anime sub-headings with counts matching the data arrays', () => {
    const bookCount = SHELVES.reduce((n, s) => n + s.books.length, 0);
    const animeCount = ANIME.reduce((n, s) => n + s.books.length, 0);

    const booksMatch = html.match(/Books\s*<span class="coll-n">(\d+)<\/span>/);
    const animeMatch = html.match(/Anime\s*<span class="coll-n">(\d+)<\/span>/);

    expect(booksMatch).not.toBeNull();
    expect(animeMatch).not.toBeNull();
    expect(Number(booksMatch![1])).toBe(bookCount);
    expect(Number(animeMatch![1])).toBe(animeCount);
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
