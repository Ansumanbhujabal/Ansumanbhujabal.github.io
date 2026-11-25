import { expect, it } from 'vitest';
import { enrichWithCopilot } from '../src/lib/ingest/copilot';
import type { ExtractedSource } from '../src/lib/ingest/extract';

const source: ExtractedSource = {
  requestedUrl: 'https://example.com/article', finalUrl: 'https://example.com/article',
  canonicalUrl: 'https://example.com/article', title: 'Agent defense', author: 'Researcher One',
  source: 'Example', publishedAt: '2026-11-20', description: 'A source about agent evaluation.',
  image: null, readableText: Array(120).fill('source').join(' '),
};

it('accepts strict JSON with a 100-word synopsis', async () => {
  const runner = async () => JSON.stringify({
    title: 'Agent defense', synopsis: Array(100).fill('word').join(' '),
    description: 'A focused note on agent defense evaluation.', category: 'evals',
    contentType: 'article', tags: ['agents', 'evals'],
  });
  expect((await enrichWithCopilot(source, runner)).generation).toBe('copilot');
});

it.each(['prefix {"title":"x"}', JSON.stringify({ title: 'x', synopsis: Array(300).fill('word').join(' ') })])(
  'rejects invalid model output: %s', async output => {
    await expect(enrichWithCopilot(source, async () => output)).rejects.toThrow();
  },
);
