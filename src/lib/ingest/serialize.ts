import type { GeneratedNote } from './fallback';

const scalar = (value: string) => JSON.stringify(value.replace(/\s+/g, ' ').trim());
const day = (date: Date) => date.toISOString().slice(0, 10);
const slugify = (value: string) => value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80) || 'reading';

export function entrySlug(note: Pick<GeneratedNote, 'title'>, date: Date, existing: Iterable<string>): string {
  const used = new Set(existing);
  const base = `${day(date)}-${slugify(note.title)}`;
  if (!used.has(base)) return base;
  let suffix = 2;
  while (used.has(`${base}-${suffix}`)) suffix++;
  return `${base}-${suffix}`;
}

export function serializeEntry(note: GeneratedNote, loggedAt = new Date()): string {
  const lines = [
    '---',
    `date: ${scalar(day(loggedAt))}`,
    'kind: "read"',
    `title: ${scalar(note.title)}`,
    `url: ${scalar(note.url)}`,
    `canonicalSourceUrl: ${scalar(note.canonicalSourceUrl)}`,
    ...(note.publishedAt ? [`publishedAt: ${scalar(note.publishedAt)}`] : []),
    ...(note.author ? [`author: ${scalar(note.author)}`] : []),
    `source: ${scalar(note.source)}`,
    `description: ${scalar(note.description)}`,
    `category: ${scalar(note.category)}`,
    `contentType: ${scalar(note.contentType)}`,
    `tags: ${JSON.stringify(note.tags)}`,
    ...(note.image ? [`image: ${scalar(note.image)}`] : []),
    `generation: ${scalar(note.generation)}`,
    `indexable: ${note.indexable}`,
    '---',
    '',
    note.synopsis.replace(/\s+/g, ' ').trim(),
    '',
  ];
  return lines.join('\n');
}
