import type { CopilotRunner } from './copilot';
import { enrichWithCopilot } from './copilot';
import { extractSource, type ExtractedSource } from './extract';
import { fallbackNote, type GeneratedNote } from './fallback';
import type { SafeFetchResult } from './network';
import { normalizeUrl } from './url';
import { entrySlug, serializeEntry } from './serialize';

export interface IngestDependencies {
  fetch: (url: string) => Promise<SafeFetchResult>;
  runCopilot?: CopilotRunner;
  existingEntries: Array<{ slug: string; canonicalSourceUrl: string | null }>;
  now?: () => Date;
}

export type IngestResult =
  | { status: 'published'; file: string; slug: string; generation: 'copilot' | 'fallback'; canonicalUrl: string; note: GeneratedNote; markdown: string }
  | { status: 'duplicate'; slug: string; canonicalUrl: string };

function unavailableSource(url: string): ExtractedSource {
  return { requestedUrl: url, finalUrl: url, canonicalUrl: url, title: null, author: null, source: new URL(url).hostname.replace(/^www\./, ''), publishedAt: null, description: null, image: null, readableText: '' };
}

function duplicate(canonicalUrl: string, entries: IngestDependencies['existingEntries']) {
  const normalized = normalizeUrl(canonicalUrl);
  return entries.find(entry => entry.canonicalSourceUrl && normalizeUrl(entry.canonicalSourceUrl) === normalized);
}

export async function ingestReading(input: { url: string }, deps: IngestDependencies): Promise<IngestResult> {
  const url = normalizeUrl(input.url);
  const directDuplicate = duplicate(url, deps.existingEntries);
  if (directDuplicate) return { status: 'duplicate', slug: directDuplicate.slug, canonicalUrl: url };
  let source: ExtractedSource;
  try { source = extractSource(await deps.fetch(url)); }
  catch { source = unavailableSource(url); }
  const canonicalUrl = normalizeUrl(source.canonicalUrl);
  const canonicalDuplicate = duplicate(canonicalUrl, deps.existingEntries);
  if (canonicalDuplicate) return { status: 'duplicate', slug: canonicalDuplicate.slug, canonicalUrl };
  let note: GeneratedNote;
  try { note = deps.runCopilot && source.readableText ? await enrichWithCopilot(source, deps.runCopilot) : fallbackNote(source); }
  catch { note = fallbackNote(source); }
  const now = deps.now?.() ?? new Date();
  const slug = entrySlug(note, now, deps.existingEntries.map(entry => entry.slug));
  return { status: 'published', file: `${slug}.md`, slug, generation: note.generation, canonicalUrl, note, markdown: serializeEntry(note, now) };
}
