import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import type { SafeFetchResult } from './network';

export interface ExtractedSource {
  requestedUrl: string;
  finalUrl: string;
  canonicalUrl: string;
  title: string | null;
  author: string | null;
  source: string;
  publishedAt: string | null;
  description: string | null;
  image: string | null;
  readableText: string;
}

const clean = (value: unknown): string | null => typeof value === 'string' && value.trim() ? value.replace(/\s+/g, ' ').trim() : null;
const absolute = (value: string | null, base: string): string | null => {
  if (!value) return null;
  try { return new URL(value, base).href; } catch { return null; }
};

function articleJson(document: Document): Record<string, unknown> {
  for (const node of document.querySelectorAll('script[type="application/ld+json"]')) {
    try {
      const raw = JSON.parse(node.textContent ?? '');
      const values = Array.isArray(raw) ? raw : raw['@graph'] && Array.isArray(raw['@graph']) ? raw['@graph'] : [raw];
      const article = values.find((value: Record<string, unknown>) => String(value?.['@type'] ?? '').toLowerCase().includes('article'));
      if (article) return article;
    } catch {}
  }
  return {};
}

export function extractSource(result: SafeFetchResult): ExtractedSource {
  const dom = new JSDOM(result.body, { url: result.finalUrl });
  const { document } = dom.window;
  const json = articleJson(document);
  const meta = (selector: string) => clean(document.querySelector<HTMLMetaElement>(selector)?.content);
  const authorObject = json.author && typeof json.author === 'object' ? json.author as Record<string, unknown> : null;
  const readable = new Readability(document.cloneNode(true) as Document).parse();
  const canonical = absolute(clean(document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href), result.finalUrl) ?? result.finalUrl;
  const source = meta('meta[property="og:site_name"]') ?? new URL(result.finalUrl).hostname.replace(/^www\./, '');
  return {
    requestedUrl: result.requestedUrl,
    finalUrl: result.finalUrl,
    canonicalUrl: canonical,
    title: clean(json.headline) ?? meta('meta[property="og:title"]') ?? clean(readable?.title) ?? clean(document.title),
    author: clean(authorObject?.name) ?? clean(json.author) ?? meta('meta[name="author"]') ?? clean(readable?.byline),
    source,
    publishedAt: clean(json.datePublished) ?? meta('meta[property="article:published_time"]'),
    description: meta('meta[property="og:description"]') ?? meta('meta[name="description"]') ?? clean(readable?.excerpt),
    image: absolute(meta('meta[property="og:image"]'), result.finalUrl),
    readableText: (clean(readable?.textContent) ?? '').slice(0, 20_000),
  };
}
