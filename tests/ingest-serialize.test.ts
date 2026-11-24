import { expect, it } from 'vitest';
import { serializeEntry } from '../src/lib/ingest/serialize';
import type { GeneratedNote } from '../src/lib/ingest/fallback';

const note: GeneratedNote = {
  title: 'Agent defense', url: 'https://example.com/article', canonicalSourceUrl: 'https://example.com/article',
  publishedAt: '2026-11-20', author: 'Researcher One', source: 'Example',
  description: 'A source about agent evaluation.', category: 'evals', contentType: 'article',
  tags: ['agents', 'evals'], image: null, generation: 'fallback', indexable: true,
  synopsis: Array(100).fill('word').join(' '),
};

it('serializes hostile punctuation as valid quoted YAML', () => {
  const markdown = serializeEntry({ ...note, title: 'Agent: "break"\nnext' });
  expect(markdown).toContain('title: "Agent: \\"break\\" next"');
  expect(markdown).toContain('tags: ["agents","evals"]');
  expect(markdown.endsWith('\n')).toBe(true);
});
