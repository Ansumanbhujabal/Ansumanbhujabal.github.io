import { pathToFileURL } from 'node:url';
import { statSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

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
  const target = process.argv[2];
  if (!target) {
    console.error('[links] usage: node scripts/check-links.mjs <file.html>');
    process.exit(1);
  }
  const files = [];
  function visit(path) {
    if (statSync(path).isDirectory()) {
      for (const name of readdirSync(path)) visit(join(path, name));
    } else if (path.endsWith('.html')) files.push(path);
  }
  visit(target);
  const bad = files.flatMap(file => checkLinks(readFileSync(file, 'utf8')).map(href => `${file}: ${href}`));
  if (bad.length) {
    console.error(`[links] ${bad.length} placeholder or empty href(s) found`);
    process.exit(1);
  }
  console.log('[links] ok');
}
