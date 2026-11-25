import { expect, it } from 'vitest';
import { ingestReading } from '../src/lib/ingest/pipeline';

const input = { url: 'https://example.com/a' };
const fakeFetch = async () => ({
  requestedUrl: input.url, finalUrl: input.url, status: 200, contentType: 'text/html',
  body: '<title>Agent defense</title><meta name="description" content="Agent evaluation research"><article>' + Array(120).fill('source').join(' ') + '</article>',
});
const validRunner = async () => JSON.stringify({
  title: 'Agent defense', synopsis: Array(100).fill('word').join(' '),
  description: 'A focused note on agent defense evaluation.', category: 'evals',
  contentType: 'article', tags: ['agents', 'evals'],
});

it('uses Copilot when valid and fallback when Copilot throws', async () => {
  const good = await ingestReading(input, { fetch: fakeFetch, runCopilot: validRunner, existingEntries: [] });
  expect(good.generation).toBe('copilot');
  const fallback = await ingestReading(input, { fetch: fakeFetch, runCopilot: async () => { throw new Error('rate limited'); }, existingEntries: [] });
  expect(fallback.generation).toBe('fallback');
});

it('returns the existing slug for canonical duplicates', async () => {
  const result = await ingestReading(input, { fetch: fakeFetch, runCopilot: validRunner, existingEntries: [{ slug: 'existing', canonicalSourceUrl: 'https://example.com/a' }] });
  expect(result).toEqual({ status: 'duplicate', slug: 'existing', canonicalUrl: 'https://example.com/a' });
});
