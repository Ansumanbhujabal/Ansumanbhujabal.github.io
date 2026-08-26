export interface Watching { title: string; progress: number; episodes: number | null }

const QUERY = `query($n:String){MediaListCollection(userName:$n,type:ANIME,status_in:[CURRENT,REPEATING]){lists{entries{progress media{title{romaji english} episodes}}}}}`;

export function parseAniList(payload: unknown): Watching | null {
  const lists = (payload as { data?: { MediaListCollection?: { lists?: unknown[] } } })
    ?.data?.MediaListCollection?.lists;
  if (!Array.isArray(lists)) return null;
  for (const list of lists) {
    const entries = (list as { entries?: unknown[] })?.entries;
    if (!Array.isArray(entries)) continue;
    for (const e of entries) {
      const entry = e as { progress?: number; media?: { title?: { romaji?: string; english?: string | null }; episodes?: number | null } };
      const title = entry.media?.title?.english || entry.media?.title?.romaji;
      if (!title) continue;
      return { title, progress: entry.progress ?? 0, episodes: entry.media?.episodes ?? null };
    }
  }
  return null;
}

export async function fetchAniList(userName: string): Promise<Watching | null> {
  const res = await fetch('https://graphql.anilist.co', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: QUERY, variables: { n: userName } }),
  });
  if (!res.ok) throw new Error(`AniList HTTP ${res.status}`);
  return parseAniList(await res.json());
}
