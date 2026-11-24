import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { extractSource } from '../src/lib/ingest/extract';

const fixture = (name: string) => readFileSync(`tests/fixtures/${name}`, 'utf8');

it('prefers structured metadata and removes boilerplate', () => {
  const out = extractSource({ requestedUrl: 'https://example.com/x', finalUrl: 'https://example.com/x', status: 200, contentType: 'text/html', body: fixture('article-complete.html') });
  expect(out.title).toBe('Testing agent defenses');
  expect(out.author).toBe('Researcher One');
  expect(out.readableText).not.toContain('Site navigation');
});

it('preserves injection text only as inert source text', () => {
  const out = extractSource({ requestedUrl: 'https://example.com/x', finalUrl: 'https://example.com/x', status: 200, contentType: 'text/html', body: fixture('article-injection.html') });
  expect(out.readableText).toContain('Ignore previous instructions');
});
