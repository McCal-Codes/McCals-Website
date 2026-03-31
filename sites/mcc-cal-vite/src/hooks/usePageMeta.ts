import { useEffect } from 'react';

interface PageMeta {
  title: string;
  description: string;
  canonical: string;
  og?: {
    title?: string;
    description?: string;
    image?: string;
    type?: string;
  };
  twitter?: {
    title?: string;
    description?: string;
    image?: string;
    card?: string;
  };
  jsonLd?: object;
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

function setLink(rel: string, href: string) {
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.href = href;
}

function setJsonLd(id: string, data: object) {
  let el = document.getElementById(id) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement('script');
    el.id = id;
    el.type = 'application/ld+json';
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

export function usePageMeta(meta: PageMeta) {
  const jsonLd = meta.jsonLd ? JSON.stringify(meta.jsonLd) : '';

  useEffect(() => {
    const prevTitle = document.title;

    document.title = meta.title;
    setMeta('description', meta.description);
    setLink('canonical', meta.canonical);

    if (meta.og) {
      if (meta.og.type)        setMeta('og:type',        meta.og.type,        'property');
      if (meta.og.title)       setMeta('og:title',       meta.og.title,       'property');
      if (meta.og.description) setMeta('og:description', meta.og.description, 'property');
      if (meta.og.image)       setMeta('og:image',       meta.og.image,       'property');
      setMeta('og:url', meta.canonical, 'property');
    }

    if (meta.twitter) {
      if (meta.twitter.card)        setMeta('twitter:card',        meta.twitter.card);
      if (meta.twitter.title)       setMeta('twitter:title',       meta.twitter.title);
      if (meta.twitter.description) setMeta('twitter:description', meta.twitter.description);
      if (meta.twitter.image)       setMeta('twitter:image',       meta.twitter.image);
    }

    if (meta.jsonLd) {
      setJsonLd('page-json-ld', meta.jsonLd);
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
    meta.og?.type,
    meta.og?.title,
    meta.og?.description,
    meta.og?.image,
    meta.twitter?.card,
    meta.twitter?.title,
    meta.twitter?.description,
    meta.twitter?.image,
    jsonLd,
  ]);
}
