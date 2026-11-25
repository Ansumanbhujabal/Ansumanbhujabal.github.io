import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { loadLogViews } from '../../lib/log/collection';

export const GET: APIRoute = async context => {
  const entries = (await loadLogViews()).filter(entry => entry.indexable);
  return rss({
    title: 'Ansuman SS Bhujabala — Reading Log',
    description: 'Notes on AI safety, agents, evaluation, retrieval, and systems engineering.',
    site: context.site!,
    items: entries.map(entry => ({
      title: entry.title,
      description: `${entry.description}${entry.url ? ` Source: ${entry.url}` : ''}`,
      pubDate: entry.date,
      link: `/log/${entry.slug}/`,
    })),
  });
};
