import { describe, it, expect } from 'vitest';
import { formatDate, recentLog, liveFields } from '../src/lib/display.ts';

describe('formatDate', () => {
  it('renders an absolute date', () => {
    expect(formatDate(new Date('2026-08-26T00:00:00Z'))).toBe('26 Aug 2026');
  });
});

describe('recentLog', () => {
  const mk = (d: string) => ({ data: { date: new Date(d) } });
  it('sorts newest first', () => {
    const out = recentLog([mk('2026-08-21'), mk('2026-08-26'), mk('2026-08-24')], 8);
    expect(out.map(e => e.data.date.getUTCDate())).toEqual([26, 24, 21]);
  });
  it('caps at the limit', () => {
    expect(recentLog(Array.from({ length: 20 }, () => mk('2026-08-01')), 8)).toHaveLength(8);
  });
  it('returns an empty array unchanged rather than padding', () => {
    expect(recentLog([], 8)).toEqual([]);
  });
});

describe('liveFields', () => {
  it('omits fields with no value', () => {
    expect(liveFields({ shipping: 'Mentis', watching: null, lastLog: '26 Aug 2026' }))
      .toEqual([{ label: 'Shipping', value: 'Mentis' }, { label: 'Last log', value: '26 Aug 2026' }]);
  });
  it('returns an empty array when nothing is available', () => {
    expect(liveFields({})).toEqual([]);
  });
});
