import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { safeFetch } from '../src/lib/ingest/network';
import { extractSource } from '../src/lib/ingest/extract';
import { enrichWithCopilot, runCopilotCli } from '../src/lib/ingest/copilot';
import { fallbackNote } from '../src/lib/ingest/fallback';
import { serializeEntry } from '../src/lib/ingest/serialize';

interface RetryCandidate { slug: string; generation: string; date: string; retryCount: number }
export function planFallbackRetries<T extends RetryCandidate>(entries: T[], maxAttempts = 3): T[] {
  return entries.filter(item => item.generation === 'fallback' && item.retryCount < maxAttempts).slice(0, 10);
}

export function stampRetry(content: string, count: number, timestamp: string): string {
  if (!content.startsWith('---\n')) throw new Error('Missing frontmatter');
  const values: Record<string, string> = {
    retryCount: String(count),
    lastRetryAt: JSON.stringify(timestamp),
    modifiedAt: JSON.stringify(timestamp),
  };
  const end = content.indexOf('\n---\n', 4);
  if (end < 0) throw new Error('Invalid frontmatter');
  const frontmatter = content.slice(4, end).split('\n').filter(line => !/^(retryCount|lastRetryAt|modifiedAt):/.test(line));
  return `---\n${frontmatter.join('\n')}\n${Object.entries(values).map(([key, value]) => `${key}: ${value}`).join('\n')}${content.slice(end)}`;
}

const field = (text: string, name: string) => {
  const match = text.match(new RegExp(`^${name}: (.+)$`, 'm'));
  if (!match) return null;
  try { return JSON.parse(match[1]); } catch { return match[1]; }
};

async function main() {
  const directory = 'src/content/log';
  const files = (await readdir(directory)).filter(file => file.endsWith('.md'));
  const entries = await Promise.all(files.map(async file => {
    const content = await readFile(join(directory, file), 'utf8');
    return { slug: file.slice(0, -3), file, content, generation: field(content, 'generation') ?? 'manual', date: field(content, 'date') ?? '', retryCount: Number(field(content, 'retryCount') ?? 0) };
  }));
  let changed = 0;
  for (const item of planFallbackRetries(entries)) {
    const url = field(item.content, 'canonicalSourceUrl') ?? field(item.content, 'url');
    if (typeof url !== 'string') continue;
    let updated = item.content;
    try {
      const source = extractSource(await safeFetch(url));
      let note = fallbackNote(source);
      if (process.env.COPILOT_GITHUB_TOKEN && source.readableText) {
        try { note = await enrichWithCopilot(source, runCopilotCli); } catch { /* retain fallback */ }
      }
      if (note.indexable && (note.generation === 'copilot' || item.content.includes('indexable: false'))) {
        updated = serializeEntry(note, new Date(`${item.date}T00:00:00Z`));
      }
    } catch { /* bounded retry below */ }
    updated = stampRetry(updated, item.retryCount + 1, new Date().toISOString());
    await writeFile(join(directory, item.file), updated);
    changed++;
  }
  process.stdout.write(`${JSON.stringify({ changed })}\n`);
}

if (process.argv[1]?.endsWith('retry-fallbacks.ts')) main().catch(error => { console.error(error); process.exitCode = 1; });
