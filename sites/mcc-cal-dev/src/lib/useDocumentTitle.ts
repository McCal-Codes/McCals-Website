import { useEffect } from 'react';
import { SITE } from '@/content/site';

/**
 * Sets the document title and meta description per route.
 *
 * This is a client-rendered SPA, so these are for people and for crawlers that run
 * JavaScript. The `index.html` head carries the values that matter for link unfurls.
 */
export function useDocumentMeta(title: string, description?: string) {
  useEffect(() => {
    document.title = title === SITE.name ? title : `${title} · ${SITE.shortName}`;

    if (!description) return;
    const tag = document.querySelector('meta[name="description"]');
    if (tag) tag.setAttribute('content', description);
  }, [title, description]);
}
