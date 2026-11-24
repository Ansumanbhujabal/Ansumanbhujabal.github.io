import type { ExtractedSource } from './extract';

export interface GeneratedNote {
  title: string;
  url: string;
  canonicalSourceUrl: string;
  publishedAt: string | null;
  author: string | null;
  source: string;
  description: string;
  category: string;
  contentType: string;
  tags: string[];
  image: string | null;
  generation: 'copilot' | 'fallback';
  indexable: boolean;
  synopsis: string;
}

const KEYWORDS: Record<string, string[]> = {
  agents: ['agent', 'tool-use', 'tool use'],
  evals: ['evaluation', 'eval', 'benchmark'],
  'ai-safety': ['ai safety', 'alignment', 'jailbreak', 'adversarial'],
  rag: ['retrieval', 'rag', 'embedding'],
  security: ['attack', 'injection', 'security'],
};

const clean = (value: string) => value.replace(/\s+/g, ' ').trim();
const words = (value: string) => clean(value).split(/\s+/).filter(Boolean);

function synopsisFrom(text: string): string {
  const sentences = clean(text).match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [];
  const selected: string[] = [];
  let count = 0;
  for (const sentence of sentences) {
    const size = words(sentence).length;
    if (count >= 100 || count + size > 200) break;
    selected.push(clean(sentence));
    count += size;
  }
  return clean(selected.join(' ') || text).split(/\s+/).slice(0, 200).join(' ');
}

function humanizedTitle(source: ExtractedSource): string {
  if (source.title) return clean(source.title);
  const path = new URL(source.finalUrl || source.requestedUrl).pathname.split('/').filter(Boolean).pop();
  return path ? decodeURIComponent(path).replace(/[-_]+/g, ' ').replace(/\b\w/g, char => char.toUpperCase()) : source.source;
}

export function fallbackNote(source: ExtractedSource): GeneratedNote {
  const synopsis = source.readableText
    ? synopsisFrom(source.readableText)
    : 'Metadata was unavailable for this source when it was logged. Follow the original link to read it directly.';
  const haystack = `${source.title ?? ''} ${source.description ?? ''} ${source.readableText}`.toLowerCase();
  const tags = Object.entries(KEYWORDS).filter(([, needles]) => needles.some(word => haystack.includes(word))).map(([tag]) => tag).slice(0, 6);
  const description = clean(source.description ?? synopsis).slice(0, 240);
  const wordCount = words(synopsis).length;
  return {
    title: humanizedTitle(source),
    url: source.requestedUrl,
    canonicalSourceUrl: source.canonicalUrl,
    publishedAt: source.publishedAt,
    author: source.author,
    source: source.source,
    description,
    category: tags.includes('ai-safety') ? 'ai-safety' : tags[0] ?? 'general',
    contentType: 'article',
    tags,
    image: source.image,
    generation: 'fallback',
    indexable: Boolean(source.title && source.description && wordCount >= 80),
    synopsis,
  };
}
