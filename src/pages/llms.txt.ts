import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { buildLlmsTxt } from '../lib/llms.ts';

export const GET: APIRoute = async () => {
  const projects = (await getCollection('projects'))
    .sort((a, b) => a.data.order - b.data.order)
    .map(p => ({
      name: p.data.name, status: p.data.status, summary: p.data.summary,
      repo: p.data.repo, demo: p.data.demo, metrics: p.data.metrics,
    }));
  return new Response(buildLlmsTxt(projects), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
