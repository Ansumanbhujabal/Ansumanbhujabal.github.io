import { withCache } from '../src/lib/cache.ts';
import { fetchGithub } from '../src/lib/fetchers/github.ts';
import { fetchAniList } from '../src/lib/fetchers/anilist.ts';
import { fetchRss } from '../src/lib/fetchers/rss.ts';
import { SITE_CONFIG } from '../src/lib/config.ts';
import { readdirSync, readFileSync } from 'node:fs';

// Collect ghRepo values straight from the project markdown frontmatter.
function projectRepos() {
  const dir = 'src/content/projects';
  const repos = [];
  for (const f of readdirSync(dir)) {
    const m = readFileSync(`${dir}/${f}`, 'utf8').match(/^ghRepo:\s*"([^"]+)"/m);
    if (m) repos.push(m[1]);
  }
  return repos;
}

const token = process.env.GITHUB_TOKEN ?? '';

await withCache('github', () =>
  token ? fetchGithub(projectRepos(), token) : Promise.reject(new Error('no GITHUB_TOKEN')));

await withCache('anilist', () => fetchAniList(SITE_CONFIG.anilistUser));

await withCache('medium', () => fetchRss(SITE_CONFIG.mediumFeed, SITE_CONFIG.feedLimit));

await withCache('youtube', () =>
  SITE_CONFIG.youtubeChannelId
    ? fetchRss(`https://www.youtube.com/feeds/videos.xml?channel_id=${SITE_CONFIG.youtubeChannelId}`, SITE_CONFIG.feedLimit)
    : Promise.reject(new Error('no youtubeChannelId configured')));

console.log('[fetch] done');
