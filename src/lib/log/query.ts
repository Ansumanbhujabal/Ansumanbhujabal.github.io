import type { LogView } from './types';

export type LogSort = 'newest' | 'oldest' | 'title';

export function sortLogs(entries: LogView[], sort: LogSort = 'newest'): LogView[] {
  return [...entries].sort((a, b) => {
    if (sort === 'title') return a.title.localeCompare(b.title);
    const delta = a.date.getTime() - b.date.getTime();
    return sort === 'oldest' ? delta : -delta;
  });
}

export function paginateLogs(entries: LogView[], pageSize = 25): LogView[][] {
  if (!Number.isInteger(pageSize) || pageSize < 1) throw new Error('pageSize must be a positive integer');
  return Array.from({ length: Math.ceil(entries.length / pageSize) }, (_, index) =>
    entries.slice(index * pageSize, (index + 1) * pageSize));
}

export function groupLogsByMonth(entries: LogView[]): Map<string, LogView[]> {
  const groups = new Map<string, LogView[]>();
  for (const entry of entries) {
    const key = `${entry.date.getUTCFullYear()}-${String(entry.date.getUTCMonth() + 1).padStart(2, '0')}`;
    groups.set(key, [...(groups.get(key) ?? []), entry]);
  }
  return groups;
}

export function categorySlug(value: string): string {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/&/g, ' ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function relatedLogs(target: LogView, all: LogView[], limit = 4): LogView[] {
  const targetTags = new Set(target.tags);
  const score = (entry: LogView) => {
    const sharedTags = entry.tags.filter(tag => targetTags.has(tag)).length;
    return sharedTags * 10
      + Number(entry.category === target.category) * 5
      + Number(entry.contentType === target.contentType) * 2
      + Number(entry.source === target.source);
  };
  return all.filter(entry => entry.slug !== target.slug)
    .map(entry => ({ entry, score: score(entry) }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score || b.entry.date.getTime() - a.entry.date.getTime())
    .slice(0, limit)
    .map(item => item.entry);
}
