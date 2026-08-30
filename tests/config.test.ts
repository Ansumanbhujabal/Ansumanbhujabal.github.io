import { describe, it, expect } from 'vitest';
import { SITE_CONFIG } from '../src/lib/config.ts';

describe('SITE_CONFIG', () => {
  it('sets the anilist user', () => { expect(SITE_CONFIG.anilistUser).toBe('sputniksw'); });
  it('does not cap the log — every entry renders', () => { expect(SITE_CONFIG.logLimit).toBe(Number.POSITIVE_INFINITY); });
  it('uses a youtube channel id, not an @handle', () => {
    expect(SITE_CONFIG.youtubeChannelId.startsWith('@')).toBe(false);
  });
});
