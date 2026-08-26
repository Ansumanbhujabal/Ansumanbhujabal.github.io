import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const dir = () => process.env.CACHE_DIR ?? 'data/cache';

export function readCache<T>(name: string): T | null {
  const path = join(dir(), `${name}.json`);
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, 'utf8')) as T;
  } catch {
    return null;
  }
}

export function writeCache<T>(name: string, data: T): void {
  mkdirSync(dir(), { recursive: true });
  writeFileSync(join(dir(), `${name}.json`), JSON.stringify(data, null, 2) + '\n');
}

export async function withCache<T>(name: string, fetcher: () => Promise<T>): Promise<T | null> {
  try {
    const fresh = await fetcher();
    writeCache(name, fresh);
    return fresh;
  } catch (err) {
    console.warn(`[cache] ${name}: fetch failed (${(err as Error).message}); falling back to cache`);
    return readCache<T>(name);
  }
}
