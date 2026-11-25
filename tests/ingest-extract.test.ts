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

it('uses paper citation fields instead of an arXiv submission line', () => {
  const body = `<html><head>
    <meta name="citation_title" content="A paper title">
    <meta name="citation_author" content="Guo, Wenqi Marshall">
    <meta name="citation_author" content="Huang, Kuan-Hao">
    <meta name="citation_date" content="2026/11/20">
    <meta name="citation_abstract" content="A complete abstract without navigation text.">
  </head><body><article><h1>A paper title</h1><p>[Submitted on 20 Nov 2026]</p><p>View PDF HTML (experimental)</p></article></body></html>`;
  const out = extractSource({ requestedUrl: 'https://arxiv.org/abs/1234.56789', finalUrl: 'https://arxiv.org/abs/1234.56789', status: 200, contentType: 'text/html', body });
  expect(out.author).toBe('Wenqi Marshall Guo, Kuan-Hao Huang');
  expect(out.publishedAt).toBe('2026-11-20');
  expect(out.readableText).toBe('A complete abstract without navigation text.');
});
