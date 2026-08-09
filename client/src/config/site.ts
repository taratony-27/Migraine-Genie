/**
 * Single source of truth for brand and site metadata.
 * Update here rather than hard-coding the name or domain in components.
 */
export const SITE = {
  name: 'Migraine Genie',
  domain: 'migraine-genie.com',
  url: 'https://migraine-genie.com',
  tagline: 'Track your migraines. Understand your triggers.',
  description:
    'Migraine Genie is a free migraine diary that turns your daily logs into clear patterns — track symptoms, sleep and triggers, then see what actually sets your migraines off.',
  supportEmail: 'support@migraine-genie.com',
  themeColor: '#0d47a1',
  twitterHandle: '', // e.g. '@migrainegenie' — omitted from tags while empty
} as const;

export const absoluteUrl = (path = '/') =>
  `${SITE.url}${path.startsWith('/') ? path : `/${path}`}`;
