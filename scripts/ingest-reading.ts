import { mkdir, readFile, readdir, rename, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { safeFetch } from '../src/lib/ingest/network';
import { parseIssueUrl } from '../src/lib/ingest/url';
import { ingestReading } from '../src/lib/ingest/pipeline';
import { runCopilotCli } from '../src/lib/ingest/copilot';

function arg(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function existingEntries(directory: string) {
  try {
    return await Promise.all((await readdir(directory)).filter(file => file.endsWith('.md')).map(async file => {
      const content = await readFile(join(directory, file), 'utf8');
      const match = content.match(/^canonicalSourceUrl:\s*["']?([^"'\n]+)["']?$/m) ?? content.match(/^url:\s*["']?([^"'\n]+)["']?$/m);
      return { slug: basename(file, '.md'), canonicalSourceUrl: match?.[1]?.trim() ?? null };
    }));
  } catch { return []; }
}

async function main() {
  const issueFile = arg('--issue-body-file');
  const outputDir = arg('--output-dir') ?? 'src/content/log';
  const resultFile = arg('--result-file');
  const fixture = arg('--fixture');
  if (!issueFile || !resultFile) throw new Error('Required: --issue-body-file and --result-file');
  const url = parseIssueUrl(await readFile(issueFile, 'utf8'));
  const fixtureFetch = fixture ? async (input: string) => ({ requestedUrl: input, finalUrl: input, status: 200, contentType: 'text/html', body: await readFile(fixture, 'utf8') }) : safeFetch;
  const result = await ingestReading({ url }, {
    fetch: fixtureFetch,
    runCopilot: process.env.COPILOT_GITHUB_TOKEN ? runCopilotCli : undefined,
    existingEntries: await existingEntries(outputDir),
  });
  await mkdir(outputDir, { recursive: true });
  if (result.status === 'published') await writeFile(join(outputDir, result.file), result.markdown, { flag: 'wx' });
  const publicResult = result.status === 'published'
    ? { status: result.status, file: result.file, slug: result.slug, generation: result.generation, canonicalUrl: result.canonicalUrl }
    : result;
  await mkdir(join(resultFile, '..'), { recursive: true }).catch(() => undefined);
  const temporary = `${resultFile}.tmp`;
  await writeFile(temporary, `${JSON.stringify(publicResult)}\n`);
  await rename(temporary, resultFile);
  process.stdout.write(`${JSON.stringify(publicResult)}\n`);
}

main().catch(error => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
