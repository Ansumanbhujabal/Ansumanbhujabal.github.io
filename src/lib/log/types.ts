export type LogGeneration = 'copilot' | 'fallback' | 'manual';

export interface LogView {
  id: string;
  slug: string;
  title: string;
  url: string | null;
  canonicalSourceUrl: string | null;
  date: Date;
  publishedAt: Date | null;
  kind: 'read' | 'built' | 'learned' | 'watched';
  author: string | null;
  source: string;
  description: string;
  synopsis: string;
  category: string;
  contentType: string;
  tags: string[];
  image: string | null;
  generation: LogGeneration;
  indexable: boolean;
}
