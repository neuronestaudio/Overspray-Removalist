import { useEffect } from 'react';
import { recordHead } from '../lib/headStore';
import { SITE_ORIGIN, BUSINESS } from '../lib/site';
import { imageUrl } from './Img';

interface PageMetaProps {
  title: string;
  description: string;
  /** Path only, e.g. "/pricing". Made absolute here so no page can get it wrong. */
  path: string;
  noindex?: boolean;
  /** Image STEM, resolved through the manifest. No width, no extension. */
  ogImage?: string;
  ogAlt?: string;
  jsonLd?: object[];
}

const DEFAULT_OG_STEM = 'job-splatter-2';

export default function PageMeta({
  title,
  description,
  path,
  noindex = false,
  ogImage,
  ogAlt,
  jsonLd,
}: PageMetaProps) {
  const canonical = `${SITE_ORIGIN}${path === '/' ? '/' : path}`;
  const image = imageUrl(SITE_ORIGIN, ogImage || DEFAULT_OG_STEM);

  /* Called during render, not in an effect: the SSR pass never runs effects, and
     this is the only hook the pre-renderer has to read the head from. */
  recordHead({ title, description, canonical, noindex, image, imageAlt: ogAlt, jsonLd });

  const jsonLdKey = jsonLd ? JSON.stringify(jsonLd) : '';

  useEffect(() => {
    document.title = title;
    setMeta('name', 'description', description);
    setLink('canonical', canonical);
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', canonical);
    setMeta('property', 'og:type', 'website');
    setMeta('property', 'og:site_name', BUSINESS.name);
    setMeta('property', 'og:locale', 'en_AU');
    setMeta('property', 'og:image', image);
    if (ogAlt) setMeta('property', 'og:image:alt', ogAlt);
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', image);

    if (noindex) {
      setMeta('name', 'robots', 'noindex,nofollow');
    } else {
      document.querySelector('meta[name="robots"]')?.remove();
    }

    document.querySelectorAll('script[data-pagemeta-jsonld]').forEach((el) => el.remove());
    if (jsonLd && jsonLd.length) {
      for (const item of jsonLd) {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.setAttribute('data-pagemeta-jsonld', '');
        script.text = JSON.stringify(item).replace(/<\//g, '<\\/');
        document.head.appendChild(script);
      }
    }
  }, [title, description, canonical, noindex, image, ogAlt, jsonLdKey, jsonLd]);

  return null;
}

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setLink(rel: string, href: string) {
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}
