import { lookup as dnsLookup } from 'node:dns/promises';
import ipaddr from 'ipaddr.js';
import { normalizeUrl } from './url';

type Address = { address: string; family: number };
type Lookup = (hostname: string) => Promise<Address[]>;
type Fetcher = (url: string, init?: RequestInit) => Promise<Response>;

export interface SafeFetchResult {
  requestedUrl: string;
  finalUrl: string;
  contentType: string;
  body: string;
  status: number;
}

export interface SafeFetchOptions {
  fetcher?: Fetcher;
  lookup?: Lookup;
  maxRedirects?: number;
  maxBytes?: number;
  timeoutMs?: number;
}

const defaultLookup: Lookup = hostname => dnsLookup(hostname, { all: true, verbatim: true });

export async function assertPublicHostname(hostname: string, lookup: Lookup = defaultLookup): Promise<void> {
  if (hostname.toLowerCase() === 'localhost') throw new Error('Hostname must resolve to a public address');
  const addresses = await lookup(hostname);
  if (addresses.length === 0) throw new Error('Hostname did not resolve');
  for (const item of addresses) {
    let address = ipaddr.parse(item.address);
    if (address.kind() === 'ipv6' && (address as ipaddr.IPv6).isIPv4MappedAddress()) address = (address as ipaddr.IPv6).toIPv4Address();
    if (address.range() !== 'unicast') throw new Error('Hostname must resolve only to public addresses');
  }
}

async function readBounded(response: Response, maxBytes: number): Promise<string> {
  const length = Number(response.headers.get('content-length') ?? 0);
  if (length > maxBytes) throw new Error(`Response exceeds ${maxBytes} bytes`);
  if (!response.body) return '';
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) { await reader.cancel(); throw new Error(`Response exceeds ${maxBytes} bytes`); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return new TextDecoder().decode(bytes);
}

export async function safeFetch(input: string, options: SafeFetchOptions = {}): Promise<SafeFetchResult> {
  const requestedUrl = normalizeUrl(input);
  const fetcher = options.fetcher ?? fetch;
  const lookup = options.lookup ?? defaultLookup;
  const maxRedirects = options.maxRedirects ?? 3;
  const maxBytes = options.maxBytes ?? 2 * 1024 * 1024;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? 10_000);
  let current = requestedUrl;
  try {
    for (let redirects = 0; redirects <= maxRedirects; redirects++) {
      const parsed = new URL(current);
      await assertPublicHostname(parsed.hostname, lookup);
      const response = await fetcher(current, { redirect: 'manual', signal: controller.signal, headers: { 'User-Agent': 'ansumanbhujabal.github.io reading-log bot' } });
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location');
        if (!location) throw new Error('Redirect response has no location');
        if (redirects === maxRedirects) throw new Error('Too many redirects');
        current = normalizeUrl(new URL(location, current).href);
        continue;
      }
      if (!response.ok) throw new Error(`Source HTTP ${response.status}`);
      const contentType = response.headers.get('content-type')?.split(';')[0].trim().toLowerCase() ?? 'text/html';
      if (!contentType.startsWith('text/') && contentType !== 'application/xhtml+xml') throw new Error(`Unsupported content type: ${contentType}`);
      return { requestedUrl, finalUrl: current, contentType, body: await readBounded(response, maxBytes), status: response.status };
    }
    throw new Error('Too many redirects');
  } finally {
    clearTimeout(timer);
  }
}
