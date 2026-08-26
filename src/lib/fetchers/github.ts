export interface RepoStat { nameWithOwner: string; stars: number; pushedAt: string }

export function parseGithub(payload: unknown): Record<string, RepoStat> {
  const data = (payload as { data?: Record<string, unknown> })?.data;
  const out: Record<string, RepoStat> = {};
  if (!data) return out;
  for (const node of Object.values(data)) {
    if (!node || typeof node !== 'object') continue;
    const r = node as { nameWithOwner?: string; stargazerCount?: number; pushedAt?: string };
    if (!r.nameWithOwner) continue;
    out[r.nameWithOwner] = {
      nameWithOwner: r.nameWithOwner,
      stars: r.stargazerCount ?? 0,
      pushedAt: r.pushedAt ?? '',
    };
  }
  return out;
}

export async function fetchGithub(repos: string[], token: string): Promise<Record<string, RepoStat>> {
  if (repos.length === 0) return {};
  const parts = repos.map((full, i) => {
    const [owner, name] = full.split('/');
    return `r${i}: repository(owner:"${owner}", name:"${name}"){ nameWithOwner stargazerCount pushedAt }`;
  });
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { Authorization: `bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: `{ ${parts.join(' ')} }` }),
  });
  if (!res.ok) throw new Error(`GitHub HTTP ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(json.errors.map((e: { message: string }) => e.message).join('; '));
  return parseGithub(json);
}
