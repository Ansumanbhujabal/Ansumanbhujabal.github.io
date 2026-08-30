export const SITE_CONFIG = {
  anilistUser: 'sputniksw',
  mediumFeed: 'https://ansumanbhujabal.medium.com/feed',
  // Replace with the UC… channel id; the @handle does not work in the RSS endpoint.
  youtubeChannelId: '',
  feedLimit: 3,
  // No cap: every log entry renders, newest first.
  logLimit: Number.POSITIVE_INFINITY,
} as const;
