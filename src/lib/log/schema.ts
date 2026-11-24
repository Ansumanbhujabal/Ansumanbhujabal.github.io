import { z } from 'zod';

export const logSchema = z.object({
  date: z.coerce.date(),
  kind: z.enum(['read', 'built', 'learned', 'watched']),
  title: z.string().min(1),
  url: z.string().url().optional(),
  canonicalSourceUrl: z.string().url().optional(),
  publishedAt: z.coerce.date().optional(),
  author: z.string().min(1).optional(),
  source: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  category: z.string().min(1).default('general'),
  contentType: z.string().min(1).optional(),
  tags: z.array(z.string().min(1)).default([]),
  image: z.string().url().optional(),
  generation: z.enum(['copilot', 'fallback', 'manual']).default('manual'),
  indexable: z.boolean().default(true),
});

export type LogData = z.infer<typeof logSchema>;
