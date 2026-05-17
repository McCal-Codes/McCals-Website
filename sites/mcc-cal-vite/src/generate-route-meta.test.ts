import { describe, expect, it } from 'vitest';
import { buildRouteMetaEntries } from '../scripts/generate-route-meta.js';

describe('generate-route-meta', () => {
  it('builds static HTML metadata entries for static pages and published blog posts', () => {
    const entries = buildRouteMetaEntries({
      pageSeo: {
        home: {
          route: '/',
          title: 'Home Title',
          description: 'Home description for a public page.',
          ogTitle: 'Home OG',
          ogDescription: 'Home OG description.',
          imagePath: '/images/social/home.jpg',
          imageAlt: 'Home image alt',
        },
        about: {
          route: '/about',
          title: 'About Title',
          description: 'About description for a public page.',
          ogTitle: 'About OG',
          ogDescription: 'About OG description.',
          imagePath: '/images/social/about.jpg',
          imageAlt: 'About image alt',
        },
      },
      blogManifest: {
        posts: [
          {
            slug: 'published-story',
            title: 'Published Story',
            excerpt: 'A useful story excerpt for search previews.',
            leadImage: 'posts/published-story/images/lead.jpg',
            leadImageAlt: 'Published story image alt',
            published: true,
          },
          {
            slug: 'draft-story',
            title: 'Draft Story',
            excerpt: 'Draft story excerpt.',
            leadImage: 'posts/draft-story/images/lead.jpg',
            published: false,
          },
        ],
      },
    });

    expect(entries.map((entry) => entry.route)).toEqual(['/about', '/blog/published-story']);
    expect(entries[1]).toMatchObject({
      title: 'Published Story | McCal Media',
      description: 'A useful story excerpt for search previews.',
      ogType: 'article',
      ogTitle: 'Published Story',
      imagePath: '/content/blog-static/posts/published-story/images/lead.jpg',
      imageAlt: 'Published story image alt',
    });
  });
});
