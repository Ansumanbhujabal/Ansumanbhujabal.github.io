import { expect, it } from 'vitest';
import { trimDescription } from '../src/lib/log/description';

it('keeps descriptions within 22 words and 150 characters without splitting a word', () => {
  const long = Array.from({ length: 40 }, (_, index) => `word${index}`).join(' ');
  const trimmed = trimDescription(long);
  expect(trimmed.split(/\s+/)).toHaveLength(22);
  expect([...trimmed].length).toBeLessThanOrEqual(150);
  expect(trimmed).not.toContain('word22');
  const wide = `A ${'longword '.repeat(30)}`;
  const bounded = trimDescription(wide);
  expect([...bounded].length).toBeLessThanOrEqual(150);
  expect(bounded.endsWith(' ')).toBe(false);
});
