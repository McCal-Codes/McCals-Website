import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import { usePageMeta } from '@/hooks/usePageMeta';
import {
  SmartImage,
  StoryCard,
  StoryBody,
  StoryCitations,
  StoryMeta,
  useBlogPageData,
  toPostAssetUrl,
  toAbsoluteUrl,
  buildIndexJsonLd,
  buildPostJsonLd,
} from '@/components/blog';
import '@/styles/blog.css';

const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://mcc-cal.com').replace(/\/$/, '');

export default function BlogPage() {
  const { slug } = useParams<{ slug?: string }>();
  const {
    manifestLoading,
    manifestError,
    postLoading,
    postError,
    posts,
    leadPost,
    sidebarPosts,
    gridPosts,
    resolvedPost,
    resolvedAuthor,
    relatedPosts,
    getAuthor,
  } = useBlogPageData(slug);

  // Scroll to top when slug changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [slug]);

  // Compute image URLs for meta
  const leadImage = resolvedPost ? toPostAssetUrl(resolvedPost.slug, resolvedPost.leadImage) : undefined;
  const leadImageFallback = resolvedPost
    ? toPostAssetUrl(resolvedPost.slug, resolvedPost.leadImageFallback)
    : undefined;
  const absoluteLeadImage = toAbsoluteUrl(leadImage || leadImageFallback);

  // Build page meta
  const pageMeta = slug
    ? resolvedPost
      ? {
          title: `${resolvedPost.title} | McCal Media`,
          description:
            resolvedPost.excerpt ||
            'Photojournalism and field reporting from McCal Media.',
          canonical: `${SITE_URL}/blog/${resolvedPost.slug}`,
          og: {
            type: 'article',
            title: resolvedPost.title,
            description:
              resolvedPost.excerpt ||
              'Photojournalism and field reporting from McCal Media.',
            image: absoluteLeadImage,
          },
          twitter: {
            card: 'summary_large_image',
            title: resolvedPost.title,
            description:
              resolvedPost.excerpt ||
              'Photojournalism and field reporting from McCal Media.',
            image: absoluteLeadImage,
          },
          jsonLd: buildPostJsonLd(resolvedPost, resolvedAuthor.name, absoluteLeadImage),
        }
      : {
          title: postLoading ? 'Loading Story | McCal Media' : 'Story Not Found | McCal Media',
          description: 'The requested story could not be loaded.',
          canonical: `${SITE_URL}/blog/${slug}`,
          og: {
            type: 'article',
            title: 'Story Not Found',
            description: 'The requested story could not be loaded.',
            image: toAbsoluteUrl('/brand/abridged-icon.png'),
          },
          twitter: {
            card: 'summary',
            title: 'Story Not Found',
            description: 'The requested story could not be loaded.',
            image: toAbsoluteUrl('/brand/abridged-icon.png'),
          },
        }
    : {
        title: 'Blog | McCal Media',
        description: 'Field notes, visual essays, and reporting from McCal Media.',
        canonical: `${SITE_URL}/blog`,
        og: {
          type: 'website',
          title: 'McCal Media Blog',
          description: 'Field notes, visual essays, and reporting from McCal Media.',
          image: toAbsoluteUrl(toPostAssetUrl(leadPost?.slug ?? '', leadPost?.leadImage || leadPost?.leadImageFallback)),
        },
        twitter: {
          card: 'summary_large_image',
          title: 'McCal Media Blog',
          description: 'Field notes, visual essays, and reporting from McCal Media.',
          image: toAbsoluteUrl(toPostAssetUrl(leadPost?.slug ?? '', leadPost?.leadImage || leadPost?.leadImageFallback)),
        },
        jsonLd: buildIndexJsonLd(posts, getAuthor),
      };

  usePageMeta(pageMeta);

  return (
    <Layout>
      <div className="blog-page">
        {manifestLoading && <div className="blog-status">Loading stories...</div>}
        {!manifestLoading && manifestError && (
          <div className="blog-message blog-message--error">Failed to load the blog manifest: {manifestError.message}</div>
        )}

        {!manifestLoading && !manifestError && !slug && (
          posts.length > 0 ? (
            <div className="blog-shell">
              {/* Masthead */}
              <header className="blog-masthead">
                <p className="blog-masthead__kicker">McCal Media &mdash; Photography &amp; Field Reporting</p>
                <h1 className="blog-masthead__title">Field Notes</h1>
                <hr className="blog-masthead__rule" />
              </header>

              {/* Lead row */}
              {leadPost && (
                <div className="blog-lead-row">
                  <StoryCard post={leadPost} author={getAuthor(leadPost)} variant="lead" />
                  {sidebarPosts.length > 0 && (
                    <aside className="blog-sidebar">
                      {sidebarPosts.map((entry) => (
                        <StoryCard key={entry.slug} post={entry} author={getAuthor(entry)} variant="sidebar" />
                      ))}
                    </aside>
                  )}
                </div>
              )}

              {/* More stories grid */}
              {gridPosts.length > 0 && (
                <section className="blog-grid-section" aria-labelledby="blog-more-heading">
                  <div className="blog-grid-section__header">
                    <h2 id="blog-more-heading">More Stories</h2>
                    <hr />
                  </div>
                  <div className="blog-grid">
                    {gridPosts.map((entry) => (
                      <StoryCard key={entry.slug} post={entry} author={getAuthor(entry)} />
                    ))}
                  </div>
                </section>
              )}
            </div>
          ) : (
            <div className="blog-message">No stories are published yet.</div>
          )
        )}

        {!manifestLoading && !manifestError && slug && (
          <article className="story">
            <Link to="/blog" className="story__back">
              All stories
            </Link>

            {postLoading && <div className="blog-status">Loading story...</div>}

            {!postLoading && (postError || !resolvedPost) && (
              <div className="blog-message blog-message--error">
                {postError ? `Failed to load this story: ${postError.message}` : 'This story could not be found.'}
              </div>
            )}

            {!postLoading && resolvedPost && (
              <>
                <header className="story__header">
                  {resolvedPost.category && <p className="blog-kicker">{resolvedPost.category}</p>}
                  <h1 className="story__title">{resolvedPost.title}</h1>
                  {resolvedPost.excerpt && <p className="story__excerpt">{resolvedPost.excerpt}</p>}
                  <StoryMeta post={resolvedPost} author={resolvedAuthor} />
                </header>

                {(leadImage || leadImageFallback) && (
                  <figure className="story__lead">
                    <SmartImage
                      src={leadImage || leadImageFallback}
                      fallbackSrc={leadImageFallback}
                      alt={resolvedPost.leadImageAlt || resolvedPost.title}
                      className="story__lead-image"
                      loading="eager"
                      fetchPriority="high"
                      placeholderClassName="blog-card__placeholder"
                    />
                    {resolvedPost.leadImageCaption && (
                      <figcaption className="story__caption">{resolvedPost.leadImageCaption}</figcaption>
                    )}
                  </figure>
                )}

                <StoryBody slug={resolvedPost.slug} post={resolvedPost} />
                <StoryCitations sources={resolvedPost.sources} />

                {(resolvedAuthor.avatar || resolvedAuthor.bio) && (
                  <section className="story__author-card" aria-labelledby="story-author-heading">
                    {resolvedAuthor.avatar && (
                      <img
                        src={resolvedAuthor.avatar}
                        alt={resolvedAuthor.name}
                        className="story__author-avatar"
                        loading="lazy"
                      />
                    )}
                    <div className="story__author-copy">
                      <p className="blog-kicker">Written By</p>
                      <h2 id="story-author-heading" className="story__author-name">
                        <Link to={`/authors/${resolvedAuthor.id}`} className="story__author-name-link">
                          {resolvedAuthor.name}
                        </Link>
                      </h2>
                      {resolvedAuthor.headline && (
                        <p className="story__author-headline">{resolvedAuthor.headline}</p>
                      )}
                      {resolvedAuthor.bio && <p className="story__author-bio">{resolvedAuthor.bio}</p>}
                      <div className="story__author-actions">
                        <Link to={`/authors/${resolvedAuthor.id}`} className="story__author-link">
                          View author page
                        </Link>
                      </div>
                    </div>
                  </section>
                )}

                {relatedPosts.length > 0 && (
                  <section className="story__related" aria-labelledby="related-stories-heading">
                    <div className="blog-grid-section__header">
                      <h2 id="related-stories-heading">Continue Reading</h2>
                      <p>More reporting from the archive.</p>
                    </div>
                    <div className="blog-grid">
                      {relatedPosts.map((entry) => (
                        <StoryCard key={entry.slug} post={entry} author={getAuthor(entry)} />
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}
          </article>
        )}
      </div>
    </Layout>
  );
}
