import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Layout } from '@/components';
import { usePageMeta } from '@/hooks/usePageMeta';
import { fetchBlogAuthors, fetchBlogPosts, type BlogAuthor, type BlogPostSummary } from '@/utils/api-client';
import { formatDateLong } from '@/utils/formatters';
import '@/styles/authors.css';

const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://mcc-cal.com').replace(/\/$/, '');

function authorStoryCountLabel(count: number): string {
  return `${count} stor${count === 1 ? 'y' : 'ies'}`;
}

export default function AuthorsPage() {
  const { authorId } = useParams<{ authorId?: string }>();
  const [authors, setAuthors] = useState<BlogAuthor[]>([]);
  const [posts, setPosts] = useState<BlogPostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError(null);

    Promise.all([fetchBlogAuthors(), fetchBlogPosts()])
      .then(([loadedAuthors, loadedPosts]) => {
        if (!active) return;
        setAuthors(loadedAuthors);
        setPosts(loadedPosts);
      })
      .catch((loadError: Error) => {
        if (!active) return;
        setError(loadError.message);
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const storiesByAuthor = useMemo(() => {
    return posts.reduce<Record<string, BlogPostSummary[]>>((accumulator, post) => {
      const key = post.author.id;
      accumulator[key] ||= [];
      accumulator[key].push(post);
      return accumulator;
    }, {});
  }, [posts]);

  const activeAuthors = useMemo(() => {
    return authors.filter((author) => {
      const authoredStories = storiesByAuthor[author.id] || [];
      return authoredStories.length > 0 || author.bio || author.headline;
    });
  }, [authors, storiesByAuthor]);

  const selectedAuthor = authorId
    ? activeAuthors.find((author) => author.id === authorId) || null
    : null;
  const selectedPosts = selectedAuthor ? storiesByAuthor[selectedAuthor.id] || [] : [];

  const pageTitle = selectedAuthor
    ? `${selectedAuthor.name} | Authors | McCal Media`
    : 'Authors | McCal Media';
  const pageDescription = selectedAuthor
    ? selectedAuthor.bio || `${selectedAuthor.name}'s writing and reporting for McCal Media.`
    : 'Meet the writers behind McCal Media field notes, essays, and reporting.';
  const canonical = `${SITE_URL}${selectedAuthor ? `/authors/${selectedAuthor.id}` : '/authors'}`;
  const ogImage = selectedAuthor?.avatar
    ? selectedAuthor.avatar.startsWith('http')
      ? selectedAuthor.avatar
      : `${SITE_URL}${selectedAuthor.avatar}`
    : `${SITE_URL}/about/caleb-mccartney-photo.jpg`;

  usePageMeta({
    title: pageTitle,
    description: pageDescription,
    canonical,
    og: {
      type: 'profile',
      title: pageTitle,
      description: pageDescription,
      image: ogImage,
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      image: ogImage,
    },
    jsonLd: selectedAuthor
      ? {
          '@context': 'https://schema.org',
          '@type': 'ProfilePage',
          url: canonical,
          mainEntity: {
            '@type': 'Person',
            name: selectedAuthor.name,
            description: pageDescription,
            image: ogImage,
            url: canonical,
            jobTitle: selectedAuthor.headline,
            homeLocation: selectedAuthor.location
              ? {
                  '@type': 'Place',
                  name: selectedAuthor.location,
                }
              : undefined,
            identifier: selectedAuthor.id,
            agentInteractionStatistic: {
              '@type': 'InteractionCounter',
              interactionType: 'https://schema.org/WriteAction',
              userInteractionCount: selectedPosts.length,
            },
          },
          hasPart: selectedPosts.slice(0, 5).map((post) => ({
            '@type': 'Article',
            headline: post.title,
            url: `${SITE_URL}/blog/${post.slug}`,
            datePublished: post.date,
            author: { '@id': `#${selectedAuthor.id}` },
          })),
        }
      : {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: 'McCal Media authors',
          itemListElement: activeAuthors.map((author, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            url: `${SITE_URL}/authors/${author.id}`,
            name: author.name,
          })),
        },
  });

  return (
    <Layout>
      <div className="authors-page">
        <header className="authors-hero">
          <p className="authors-hero__kicker">McCal Media</p>
          <h1 className="authors-hero__title">
            {selectedAuthor ? selectedAuthor.name : 'Authors'}
          </h1>
          <p className="authors-hero__lede">
            {selectedAuthor
              ? selectedAuthor.bio || 'Writing, reporting, and visual storytelling from the archive.'
              : 'Short bios, current work, and the stories each contributor has published on the site.'}
          </p>
        </header>

        {loading && <div className="authors-state">Loading authors...</div>}
        {!loading && error && (
          <div className="authors-state authors-state--error">Failed to load authors: {error}</div>
        )}

        {!loading && !error && authorId && !selectedAuthor && (
          <div className="authors-state authors-state--error">That author page could not be found.</div>
        )}

        {!loading && !error && !authorId && (
          <section className="authors-grid" aria-label="Authors">
            {activeAuthors.map((author) => {
              const authorPosts = storiesByAuthor[author.id] || [];

              return (
                <article key={author.id} className="author-card">
                  <div className="author-card__header">
                    {author.avatar && (
                      <img
                        src={author.avatar}
                        alt={author.name}
                        className="author-card__avatar"
                        loading="lazy"
                      />
                    )}
                    <div className="author-card__copy">
                      <p className="author-card__eyebrow">{author.location || 'McCal Media'}</p>
                      <h2 className="author-card__name">
                        <Link to={`/authors/${author.id}`}>{author.name}</Link>
                      </h2>
                      {author.headline && <p className="author-card__headline">{author.headline}</p>}
                    </div>
                  </div>

                  {author.bio && <p className="author-card__bio">{author.bio}</p>}

                  <div className="author-card__meta">
                    <span>{authorStoryCountLabel(authorPosts.length)}</span>
                  </div>

                  {authorPosts.length > 0 && (
                    <ul className="author-card__stories" role="list">
                      {authorPosts.slice(0, 3).map((post) => (
                        <li key={post.slug}>
                          <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                          <time dateTime={post.date}>{formatDateLong(post.date)}</time>
                        </li>
                      ))}
                    </ul>
                  )}

                  <Link to={`/authors/${author.id}`} className="author-card__cta">
                    View bio and stories
                  </Link>
                </article>
              );
            })}
          </section>
        )}

        {!loading && !error && selectedAuthor && (
          <div className="author-detail">
            <Link to="/authors" className="authors-back">
              All authors
            </Link>

            <section className="author-profile">
              {selectedAuthor.avatar && (
                <img
                  src={selectedAuthor.avatar}
                  alt={selectedAuthor.name}
                  className="author-profile__avatar"
                  loading="eager"
                />
              )}

              <div className="author-profile__copy">
                <p className="author-profile__eyebrow">{selectedAuthor.location || 'McCal Media'}</p>
                <h2 className="author-profile__name">{selectedAuthor.name}</h2>
                {selectedAuthor.headline && (
                  <p className="author-profile__headline">{selectedAuthor.headline}</p>
                )}
                {selectedAuthor.bio && <p className="author-profile__bio">{selectedAuthor.bio}</p>}

                <div className="author-profile__stats">
                  <div>
                    <strong>{selectedPosts.length}</strong>
                    <span>Published stories</span>
                  </div>
                  <div>
                    <strong>
                      {new Set(selectedPosts.map((post) => post.category).filter(Boolean)).size || 1}
                    </strong>
                    <span>Categories</span>
                  </div>
                </div>

                {selectedAuthor.links && selectedAuthor.links.length > 0 && (
                  <div className="author-profile__links">
                    {selectedAuthor.links.map((link) => (
                      <Link key={link.href} to={link.href} className="author-profile__link">
                        {link.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <section className="author-stories" aria-labelledby="author-stories-heading">
              <div className="author-stories__heading">
                <h2 id="author-stories-heading">Stories by {selectedAuthor.name}</h2>
                <p>Field notes, essays, and reported work from the archive.</p>
              </div>

              {selectedPosts.length > 0 ? (
                <div className="author-stories__grid">
                  {selectedPosts.map((post) => (
                    <article key={post.slug} className="author-story-card">
                      {post.leadImage && (
                        <Link to={`/blog/${post.slug}`} className="author-story-card__image-wrap">
                          <img
                            src={post.leadImage}
                            alt={post.leadImageAlt || post.title}
                            className="author-story-card__image"
                            loading="lazy"
                          />
                        </Link>
                      )}
                      <div className="author-story-card__body">
                        {post.category && <p className="author-story-card__category">{post.category}</p>}
                        <h3 className="author-story-card__title">
                          <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                        </h3>
                        {post.excerpt && <p className="author-story-card__excerpt">{post.excerpt}</p>}
                        <time dateTime={post.date}>{formatDateLong(post.date)}</time>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="authors-state">No stories are published for this author yet.</div>
              )}
            </section>
          </div>
        )}
      </div>
    </Layout>
  );
}
