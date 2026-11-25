import { describe, it, expect } from 'vitest';
import { SITE_CONFIG } from '../src/lib/config.ts';

describe('SITE_CONFIG', () => {
  it('sets the anilist user', () => { expect(SITE_CONFIG.anilistUser).toBe('sputniksw'); });
  it('caps only the homepage log preview at six entries', () => { expect(SITE_CONFIG.homeLogLimit).toBe(6); });
  it('uses a youtube channel id, not an @handle', () => {
    expect(SITE_CONFIG.youtubeChannelId.startsWith('@')).toBe(false);
  });
});
