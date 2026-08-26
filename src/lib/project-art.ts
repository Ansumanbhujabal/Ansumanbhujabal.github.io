const KNOWN_SLUGS = ['polly', 'ultradoc', 'mentis', 'pugmark', 'pulse'] as const;
export type ProjectArtSlug = (typeof KNOWN_SLUGS)[number];

/**
 * Maps a project name to the illustration slug it should render.
 * Returns null for anything unrecognized rather than falling back to a
 * default illustration — a silent fallback would mislabel a renamed or
 * new project with an unrelated piece of art.
 */
export function resolveArtSlug(name: string): ProjectArtSlug | null {
  const lower = name.toLowerCase();
  return KNOWN_SLUGS.find((slug) => lower.startsWith(slug)) ?? null;
}
