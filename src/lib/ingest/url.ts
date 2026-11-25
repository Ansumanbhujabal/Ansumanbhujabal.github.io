const TRACKING_KEYS = new Set(['fbclid', 'gclid', '_gl', 'mc_cid', 'mc_eid']);

export function parseIssueUrl(body: string): string {
  const match = body.match(/(?:^|\n)### URL\s*\n+\s*(https:\/\/\S+)/i);
  if (!match) throw new Error('Issue form URL is missing');
  return match[1].trim();
}

export function normalizeUrl(input: string): string {
  const url = new URL(input.trim());
  if (url.protocol !== 'https:') throw new Error('URL must use HTTPS');
  if (url.username || url.password) throw new Error('URL must not contain credentials');
  url.hash = '';
  for (const key of [...url.searchParams.keys()]) {
    if (key.toLowerCase().startsWith('utm_') || TRACKING_KEYS.has(key.toLowerCase())) url.searchParams.delete(key);
  }
  url.searchParams.sort();
  if (url.pathname !== '/') url.pathname = url.pathname.replace(/\/+$/, '');
  return url.href.replace(/\/$/, url.pathname === '/' && !url.search ? '/' : '');
}

export function duplicateKeys(urls: string[]): string[] {
  return [...new Set(urls.map(normalizeUrl))];
}
