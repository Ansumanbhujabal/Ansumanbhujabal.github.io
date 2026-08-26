import { describe, it, expect } from 'vitest';
import { resolveArtSlug } from '../src/lib/project-art.ts';

describe('resolveArtSlug', () => {
  it('maps every current project name to its illustration slug', () => {
    expect(resolveArtSlug('Polly Harness')).toBe('polly');
    expect(resolveArtSlug('UltraDoc')).toBe('ultradoc');
    expect(resolveArtSlug('Mentis')).toBe('mentis');
    expect(resolveArtSlug('Pugmark')).toBe('pugmark');
    expect(resolveArtSlug('Pulse')).toBe('pulse');
  });
  it('returns null for an unrecognized project name instead of a default illustration', () => {
    expect(resolveArtSlug('Some Brand New Sixth Project')).toBeNull();
    expect(resolveArtSlug('Renamed Polly Successor')).toBeNull();
  });
});
