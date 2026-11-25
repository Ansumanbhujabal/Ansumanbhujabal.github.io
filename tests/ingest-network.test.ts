import { expect, it } from 'vitest';
import { assertPublicHostname, safeFetch } from '../src/lib/ingest/network';

it('rejects private resolution', async () => {
  await expect(assertPublicHostname('internal.test', async () => [{ address: '127.0.0.1', family: 4 }])).rejects.toThrow(/public/);
});

it('checks every redirect target before fetching it', async () => {
  const seen: string[] = [];
  const fetcher = async (url: string) => {
    seen.push(url);
    return url.endsWith('/start')
      ? new Response('', { status: 302, headers: { location: 'https://private.test/end' } })
      : new Response('secret');
  };
  const lookup = async (host: string) => [{ address: host === 'private.test' ? '10.0.0.1' : '93.184.216.34', family: 4 }];
  await expect(safeFetch('https://public.test/start', { fetcher, lookup })).rejects.toThrow(/public/);
  expect(seen).toEqual(['https://public.test/start']);
});
