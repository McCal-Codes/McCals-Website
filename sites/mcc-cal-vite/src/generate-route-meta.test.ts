import { describe, expect, it } from 'vitest';
import { STATIC_PAGE_ROUTES } from './config/public-routes.js';
import { buildRouteMetaEntries, routeOutputPaths } from '../scripts/generate-route-meta.js';

function buildPageSeoFixture() {
  return Object.fromEntries(
    STATIC_PAGE_ROUTES.map((route) => {
      const seoKey = route.seoKey || route.routeKey;
      return [
        seoKey,
        {
          route: route.path,
          title: `${seoKey} title`,
          description: `${seoKey} description for a public page.`,
          ogTitle: `${seoKey} OG`,
          ogDescription: `${seoKey} OG description.`,
          imagePath: `/images/social/${seoKey}.jpg`,
          imageAlt: `${seoKey} image alt`,
        },
      ];
    }),
  );
}

describe('generate-route-meta', () => {
  it('builds static HTML metadata entries for static pages and published blog posts', () => {
    const entries = buildRouteMetaEntries({
      pageSeo: buildPageSeoFixture(),
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

    expect(entries.map((entry) => entry.route)).toContain('/about');
    expect(entries.map((entry) => entry.route)).toContain('/contact-us');
    expect(entries.at(-1)).toMatchObject({
      title: 'Published Story | McCal Media',
      description: 'A useful story excerpt for search previews.',
      ogType: 'article',
      ogTitle: 'Published Story',
      imagePath: '/content/blog-static/posts/published-story/images/lead.jpg',
      imageAlt: 'Published story image alt',
    });
  });

  it('writes nested and clean-url HTML paths for public routes', () => {
    expect(routeOutputPaths('/blog')).toEqual(['blog/index.html', 'blog.html']);
    expect(routeOutputPaths('/blog/published-story')).toEqual([
      'blog/published-story/index.html',
      'blog/published-story.html',
    ]);
    expect(routeOutputPaths('/')).toEqual(['index.html']);
  });
});
