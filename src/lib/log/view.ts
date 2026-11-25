import type { LogData } from './schema';
import type { LogView } from './types';
import { trimDescription } from './description';

interface LogEntryLike {
  id: string;
  data: LogData;
  body?: string;
}

const clean = (value: string | undefined): string => value?.replace(/\s+/g, ' ').trim() ?? '';

export function toLogView(entry: LogEntryLike): LogView {
  const { data } = entry;
  const synopsis = clean(entry.body);
  let domain = 'Personal note';
  if (data.url) {
    try { domain = new URL(data.url).hostname.replace(/^www\./, ''); } catch {}
  }
  return {
    id: entry.id,
    slug: entry.id.replace(/\.md$/i, ''),
    title: data.title,
    url: data.url ?? null,
    canonicalSourceUrl: data.canonicalSourceUrl ?? data.url ?? null,
    date: data.date,
    publishedAt: data.publishedAt ?? null,
    kind: data.kind,
    author: data.author ?? null,
    source: data.source ?? domain,
    description: trimDescription(data.description ?? synopsis),
    synopsis,
    category: data.category,
    contentType: data.contentType ?? (data.kind === 'watched' ? 'video' : 'article'),
    tags: [...data.tags],
    image: data.image ?? null,
    generation: data.generation,
    indexable: data.indexable,
    modifiedAt: data.modifiedAt ?? null,
    retryCount: data.retryCount,
    lastRetryAt: data.lastRetryAt ?? null,
  };
}
