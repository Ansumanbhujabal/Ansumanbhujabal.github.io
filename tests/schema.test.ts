import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const projectSchema = z.object({
  name: z.string(),
  order: z.number().int().positive(),
  status: z.enum(['live', 'running', 'research', 'shipped', 'early access']),
  repo: z.string().url().optional(),
  demo: z.string().url().optional(),
  ghRepo: z.string().regex(/^[\w.-]+\/[\w.-]+$/).optional(),
  summary: z.string().min(1),
  metrics: z.array(z.string()).optional(),
});

describe('projectSchema', () => {
  it('accepts a valid project', () => {
    expect(projectSchema.safeParse({
      name: 'Polly Harness', order: 1, status: 'live', summary: 'x',
    }).success).toBe(true);
  });
  it('rejects an unknown status', () => {
    expect(projectSchema.safeParse({
      name: 'X', order: 1, status: 'archived', summary: 'x',
    }).success).toBe(false);
  });
  it('rejects a malformed ghRepo', () => {
    expect(projectSchema.safeParse({
      name: 'X', order: 1, status: 'live', summary: 'x', ghRepo: 'not-a-repo',
    }).success).toBe(false);
  });
});
