import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

export const projectSchema = z.object({
  name: z.string(),
  order: z.number().int().positive(),
  status: z.enum(['live', 'running', 'research', 'shipped', 'early access']),
  repo: z.string().url().optional(),
  demo: z.string().url().optional(),
  ghRepo: z.string().regex(/^[\w.-]+\/[\w.-]+$/).optional(),
  summary: z.string().min(1),
  metrics: z.array(z.string()).optional(),
});

export const logSchema = z.object({
  date: z.coerce.date(),
  kind: z.enum(['read', 'built', 'learned', 'watched']),
  title: z.string().min(1),
  url: z.string().url().optional(),
});

export const collections = {
  projects: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
    schema: projectSchema,
  }),
  log: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/log' }),
    schema: logSchema,
  }),
};
