export interface FeedItem { title: string; url: string; date: string }

const strip = (s: string) => s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim();

function field(block: string, tag: string): string {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
  return m ? strip(m[1]) : '';
}

export function parseRss(xml: string, limit: number): FeedItem[] {
  const blocks = xml.match(/<(item|entry)\b[\s\S]*?<\/\1>/g) ?? [];
  const items: FeedItem[] = [];
  for (const b of blocks.slice(0, limit)) {
    const title = field(b, 'title');
    // RSS uses <link>text</link>; Atom uses <link href="..."/>
    const href = b.match(/<link[^>]*href="([^"]+)"/)?.[1];
    const url = href ?? field(b, 'link');
    const date = field(b, 'pubDate') || field(b, 'published') || field(b, 'updated');
    if (title && url) items.push({ title, url, date });
  }
  return items;
}

export async function fetchRss(url: string, limit: number): Promise<FeedItem[]> {
  const res = await fetch(url, { headers: { 'User-Agent': 'ansumanbhujabal.github.io build' } });
  if (!res.ok) throw new Error(`RSS HTTP ${res.status} for ${url}`);
  return parseRss(await res.text(), limit);
}
