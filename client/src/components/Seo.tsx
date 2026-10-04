import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SITE, absoluteUrl } from '../config/site';

type RouteSeo = {
  title: string;
  description: string;
  /** Signed-in app screens should stay out of search results. */
  noIndex?: boolean;
};

// Titles stay under ~60 characters so search results don't truncate them.
const ROUTE_SEO: Record<string, RouteSeo> = {
  '/': {
    title: `${SITE.name} — Migraine Diary & Trigger Tracker`,
    description: SITE.description,
  },
  '/dashboard': {
    title: `Dashboard — ${SITE.name}`,
    description: 'Your migraine overview: recent entries, patterns, and insights.',
    noIndex: true,
  },
  '/daily-log': {
    title: `Migraine Diary Entry — ${SITE.name}`,
    description: 'Log today’s migraine: intensity, duration, sleep, triggers, and symptoms.',
    noIndex: true,
  },
  '/visualization': {
    title: `Your Migraine Report — ${SITE.name}`,
    description: 'Charts, trigger rankings, and a severity heatmap built from your diary.',
    noIndex: true,
  },
  '/ai-assistant': {
    title: `AI Assistant — ${SITE.name}`,
    description: 'Ask questions about your migraine patterns, grounded in your own logs.',
    noIndex: true,
  },
  '/wellness-program': {
    title: `Wellness Program — ${SITE.name}`,
    description: 'Guided relief and prevention content for migraine management.',
    noIndex: true,
  },
  '/account': {
    title: `Account — ${SITE.name}`,
    description: 'Manage your profile, login access, and account data.',
    noIndex: true,
  },
  '/verify-email': {
    title: `Verify Your Email — ${SITE.name}`,
    description: 'Confirm your email address to finish setting up your account.',
    noIndex: true,
  },
};

const FALLBACK: RouteSeo = {
  title: `${SITE.name} — ${SITE.tagline}`,
  description: SITE.description,
  noIndex: true,
};

/** Create or update a <meta> tag, keyed by name or property. */
const setMeta = (attr: 'name' | 'property', key: string, content: string) => {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
};

const setCanonical = (href: string) => {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }
  link.href = href;
};

/**
 * Keeps document metadata in sync with the current route.
 *
 * This is a single-page app, so the static tags in index.html only describe the
 * first page loaded. Without this, every route would share the landing page's
 * title and description — and private app screens would be indexable.
 */
const Seo: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const seo = ROUTE_SEO[pathname] ?? FALLBACK;
    const canonical = absoluteUrl(pathname);

    document.title = seo.title;
    setMeta('name', 'description', seo.description);
    setMeta('name', 'robots', seo.noIndex ? 'noindex, nofollow' : 'index, follow');
    setCanonical(canonical);

    // Open Graph / Twitter previews
    setMeta('property', 'og:title', seo.title);
    setMeta('property', 'og:description', seo.description);
    setMeta('property', 'og:url', canonical);
    setMeta('name', 'twitter:title', seo.title);
    setMeta('name', 'twitter:description', seo.description);
  }, [pathname]);

  return null;
};

export default Seo;
