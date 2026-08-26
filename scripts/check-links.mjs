import { pathToFileURL } from 'node:url';

export function checkLinks(html) {
  const bad = [];
  for (const m of html.matchAll(/<a[^>]*href="([^"]*)"/g)) {
    const href = m[1];
    if (href === '' || href === '#') bad.push(href);
  }
  return bad;
}

// CLI mode: node scripts/check-links.mjs dist/index.html
// Guarded on the actual entrypoint module URL rather than process.argv[2] —
// under `vitest run tests/links.test.ts`, argv[2] is "run", which would
// otherwise trip this block into CLI mode and blow up trying to read a file
// named "run".
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { readFileSync } = await import('node:fs');
  const target = process.argv[2];
  if (!target) {
    console.error('[links] usage: node scripts/check-links.mjs <file.html>');
    process.exit(1);
  }
  const bad = checkLinks(readFileSync(target, 'utf8'));
  if (bad.length) {
    console.error(`[links] ${bad.length} placeholder or empty href(s) found`);
    process.exit(1);
  }
  console.log('[links] ok');
}
