import { useEffect } from 'react';

interface PageMeta {
  title: string;
  description: string;
  canonical: string;
  robots?: string;
  og?: {
    title?: string;
    description?: string;
    image?: string;
    imageAlt?: string;
    type?: string;
  };
  twitter?: {
    title?: string;
    description?: string;
    image?: string;
    imageAlt?: string;
    card?: string;
  };
  jsonLd?: object;
}

function withPreviewDirectives(robots?: string) {
  const directives = (robots || '')
    .split(',')
    .map((directive) => directive.trim())
    .filter(Boolean);

  if (!directives.some((directive) => directive.startsWith('max-image-preview:'))) {
    directives.push('max-image-preview:large');
  }

  return directives.join(', ');
}

function setMeta(name: string, content: string, attr: 'name' | 'property' = 'name') {
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function removeMeta(name: string, attr: 'name' | 'property' = 'name') {
  const el = document.querySelector(`meta[${attr}="${name}"]`);
  if (el) {
    el.remove();
  }
}

function setOptionalMeta(name: string, content?: string, attr: 'name' | 'property' = 'name') {
  if (content) {
    setMeta(name, content, attr);
    return;
  }
  removeMeta(name, attr);
}

function setLink(rel: string, href: string) {
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.href = href;
}

function setJsonLdText(id: string, data: string) {
  let el = document.getElementById(id) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement('script');
    el.id = id;
    el.type = 'application/ld+json';
    document.head.appendChild(el);
  }
  el.textContent = data;
}

export function usePageMeta(meta: PageMeta) {
  const jsonLd = meta.jsonLd ? JSON.stringify(meta.jsonLd) : '';
  const hasOpenGraph =
    Boolean(meta.og?.type) ||
    Boolean(meta.og?.title) ||
    Boolean(meta.og?.description) ||
    Boolean(meta.og?.image) ||
    Boolean(meta.og?.imageAlt);

  useEffect(() => {
    const prevTitle = document.title;

    document.title = meta.title;
    setMeta('description', meta.description);
    setLink('canonical', meta.canonical);
    setOptionalMeta('robots', withPreviewDirectives(meta.robots));

    setOptionalMeta('og:type', meta.og?.type, 'property');
    setOptionalMeta('og:title', meta.og?.title, 'property');
    setOptionalMeta('og:description', meta.og?.description, 'property');
    setOptionalMeta('og:image', meta.og?.image, 'property');
    setOptionalMeta('og:image:alt', meta.og?.imageAlt, 'property');
    setOptionalMeta('og:url', hasOpenGraph ? meta.canonical : undefined, 'property');

    setOptionalMeta('twitter:card', meta.twitter?.card);
    setOptionalMeta('twitter:title', meta.twitter?.title);
    setOptionalMeta('twitter:description', meta.twitter?.description);
    setOptionalMeta('twitter:image', meta.twitter?.image);
    setOptionalMeta('twitter:image:alt', meta.twitter?.imageAlt);

    if (jsonLd) {
      setJsonLdText('page-json-ld', jsonLd);
    }

    return () => {
      document.title = prevTitle;
      const el = document.getElementById('page-json-ld');
      if (el) el.remove();
    };
  }, [
    meta.title,
    meta.description,
    meta.canonical,
    meta.robots,
    meta.og?.type,
    meta.og?.title,
    meta.og?.description,
    meta.og?.image,
    meta.og?.imageAlt,
    hasOpenGraph,
    meta.twitter?.card,
    meta.twitter?.title,
    meta.twitter?.description,
    meta.twitter?.image,
    meta.twitter?.imageAlt,
    jsonLd,
  ]);
}
