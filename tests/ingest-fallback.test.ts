import { expect, it } from 'vitest';
import { fallbackNote } from '../src/lib/ingest/fallback';
import type { ExtractedSource } from '../src/lib/ingest/extract';

const source: ExtractedSource = {
  requestedUrl: 'https://example.com/article', finalUrl: 'https://example.com/article',
  canonicalUrl: 'https://example.com/article', title: 'Agent defense', author: 'Researcher One',
  source: 'Example', publishedAt: '2026-11-20', description: 'A source about agent evaluation.',
  image: null, readableText: '',
};
const longArticleText = Array.from({ length: 25 }, (_, i) =>
  `Evaluation sentence ${i} explains how agents resist attacks under realistic tool-use pressure.`,
).join(' ');

it('creates an indexable extractive note when text exists', () => {
  const note = fallbackNote({ ...source, title: 'Agent defense', readableText: longArticleText });
  expect(note.generation).toBe('fallback');
  expect(note.indexable).toBe(true);
  expect(note.synopsis.split(/\s+/).length).toBeGreaterThanOrEqual(100);
  expect(note.synopsis.split(/\s+/).length).toBeLessThanOrEqual(200);
});

it('creates a noindex placeholder when fetching failed', () => {
  const note = fallbackNote({ ...source, title: null, readableText: '', description: null });
  expect(note.indexable).toBe(false);
  expect(note.synopsis).toContain('Metadata was unavailable');
});
