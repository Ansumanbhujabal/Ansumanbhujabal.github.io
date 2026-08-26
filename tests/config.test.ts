import { describe, it, expect } from 'vitest';
import { SITE_CONFIG } from '../src/lib/config.ts';

describe('SITE_CONFIG', () => {
  it('sets the anilist user', () => { expect(SITE_CONFIG.anilistUser).toBe('sputniksw'); });
  it('limits the log to 8 entries per the spec', () => { expect(SITE_CONFIG.logLimit).toBe(8); });
  it('uses a youtube channel id, not an @handle', () => {
    expect(SITE_CONFIG.youtubeChannelId.startsWith('@')).toBe(false);
  });
});
