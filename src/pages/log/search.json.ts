import type { APIRoute } from 'astro';
import { loadLogViews } from '../../lib/log/collection';

export const GET: APIRoute = async () => {
  const entries = (await loadLogViews()).map(({ slug, title, description, source, category, contentType, tags, date }) => ({ slug, title, description, source, category, contentType, tags, date: date.toISOString() }));
  return new Response(JSON.stringify(entries), { headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=300' } });
};
