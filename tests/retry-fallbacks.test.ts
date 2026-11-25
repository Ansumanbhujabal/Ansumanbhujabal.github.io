import { expect, it } from 'vitest';
import { planFallbackRetries, stampRetry } from '../scripts/retry-fallbacks';

it('selects only bounded fallback entries and preserves slug/date', () => {
  const plan = planFallbackRetries([
    { slug: 'a', generation: 'fallback', date: '2026-11-20', retryCount: 0 },
    { slug: 'b', generation: 'manual', date: '2026-11-20', retryCount: 0 },
    { slug: 'c', generation: 'fallback', date: '2026-11-20', retryCount: 3 },
  ], 3);
  expect(plan.map(x => x.slug)).toEqual(['a']);
  expect(plan[0].date).toBe('2026-11-20');
});

it('updates retry metadata without duplicate frontmatter keys', () => {
  const original = '---\ndate: "2026-11-20"\ngeneration: "fallback"\n---\n\nNote.\n';
  const once = stampRetry(original, 1, '2026-11-25T00:00:00.000Z');
  const twice = stampRetry(once, 2, '2026-11-26T00:00:00.000Z');
  expect(twice.match(/^retryCount:/gm)).toHaveLength(1);
  expect(twice.match(/^lastRetryAt:/gm)).toHaveLength(1);
  expect(twice.match(/^modifiedAt:/gm)).toHaveLength(1);
  expect(twice).toContain('retryCount: 2');
  expect(twice).toContain('lastRetryAt: "2026-11-26T00:00:00.000Z"');
});
