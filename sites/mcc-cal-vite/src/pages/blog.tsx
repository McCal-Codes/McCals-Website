import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import { usePageMeta } from '@/hooks/usePageMeta';
import '@/styles/blog.css';

const BLOG_BASE = '/content/blog-static';
const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://mcc-cal.com').replace(/\/$/, '');
const DEFAULT_AUTHOR_ID = 'mccal';

interface BlogAuthor {
  id: string;
  name: string;
  avatar?: string;
  bio?: string;
  headline?: string;
  location?: string;
  links?: {
    label: string;
    href: string;
  }[];
}

interface BlogAuthorsFile {
  authors: BlogAuthor[];
}

const FALLBACK_AUTHOR: BlogAuthor = {
  id: DEFAULT_AUTHOR_ID,
  name: 'Caleb McCartney',
};

interface BlogManifestPost {
  slug: string;
  title: string;
  authorId?: string;
  authorName?: string | null;
  date: string;
  category?: string;
  excerpt?: string;
  leadImage?: string | null;
  leadImageFallback?: string | null;
  leadImageAlt?: string;
  leadImageCaption?: string;
  published?: boolean;
  readingTime?: number;
}

interface BlogManifest {
  version: string;
  generated: string;
  total: number;
  posts: BlogManifestPost[];
}

interface BlogTextBlock {
  type: 'text' | 'quote';
  content: string;
}

interface BlogImageBlock {
  type: 'image';
  src: string;
  alt?: string;
  caption?: string;
}

type BlogBodyBlock = BlogTextBlock | BlogImageBlock;

interface BlogPostDocument extends BlogManifestPost {
  body: BlogBodyBlock[];
  tags?: string[];
}

function formatDate(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function readingTimeLabel(minutes?: number): string | null {
  if (!minutes || minutes <= 0) return null;
  return `${minutes} min read`;
}

function toAssetUrl(assetPath?: string | null): string | null {
  if (!assetPath) return null;
  if (/^https?:\/\//i.test(assetPath) || assetPath.startsWith('/')) return assetPath;
  return `${BLOG_BASE}/${assetPath.replace(/^\.?\//, '')}`;
}

function toPostAssetUrl(slug: string, assetPath?: string | null): string | null {
  if (!assetPath) return null;
  if (/^https?:\/\//i.test(assetPath) || assetPath.startsWith('/')) return assetPath;
  if (assetPath.startsWith(`posts/${slug}/`)) return `${BLOG_BASE}/${assetPath}`;
  return `${BLOG_BASE}/posts/${slug}/${assetPath.replace(/^\.?\//, '')}`;
}

function toAbsoluteUrl(assetPath?: string | null): string | undefined {
  if (!assetPath) return undefined;
  if (/^https?:\/\//i.test(assetPath)) return assetPath;
  return `${SITE_URL}${assetPath.startsWith('/') ? assetPath : `/${assetPath}`}`;
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

function buildIndexJsonLd(posts: BlogManifestPost[], getAuthor: (post: BlogManifestPost) => BlogAuthor) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'McCal Media Blog',
    description: 'Field notes, visual essays, and reporting from McCal Media.',
    url: `${SITE_URL}/blog`,
    publisher: {
      '@type': 'Organization',
      name: 'McCal Media',
      url: SITE_URL,
    },
    blogPost: posts.slice(0, 8).map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt,
      datePublished: post.date,
      url: `${SITE_URL}/blog/${post.slug}`,
      image: toAbsoluteUrl(toAssetUrl(post.leadImage || post.leadImageFallback)),
      author: {
        '@type': 'Person',
        name: getAuthor(post).name,
      },
    })),
  };
}

function buildPostJsonLd(post: BlogPostDocument, authorName: string, image?: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.date,
    articleSection: post.category,
    keywords: post.tags?.join(', '),
    url: `${SITE_URL}/blog/${post.slug}`,
    image,
    author: {
      '@type': 'Person',
      name: authorName,
      url: `${SITE_URL}/about`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'McCal Media',
      url: SITE_URL,
    },
  };
}

function SmartImage({
  src,
  fallbackSrc,
  alt,
  className,
  loading,
  fetchPriority,
  placeholderClassName,
}: {
  src?: string | null;
  fallbackSrc?: string | null;
  alt: string;
  className?: string;
  loading?: 'eager' | 'lazy';
  fetchPriority?: 'high' | 'low' | 'auto';
  placeholderClassName?: string;
}) {
  const [currentSrc, setCurrentSrc] = useState<string | null>(src || null);
  const [usedFallback, setUsedFallback] = useState(false);

  useEffect(() => {
    setCurrentSrc(src || null);
    setUsedFallback(false);
  }, [src, fallbackSrc]);

  if (!currentSrc) {
    return placeholderClassName ? <div className={placeholderClassName} /> : null;
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      loading={loading}
      fetchPriority={fetchPriority}
      onError={() => {
        if (!usedFallback && fallbackSrc && fallbackSrc !== currentSrc) {
          setCurrentSrc(fallbackSrc);
          setUsedFallback(true);
          return;
        }

        setCurrentSrc(null);
      }}
    />
  );
}

function StoryMeta({ post, author }: { post: BlogManifestPost; author: BlogAuthor }) {
  const readTime = readingTimeLabel(post.readingTime);

  return (
    <div className="blog-meta" aria-label="Story metadata">
      <Link to={`/authors/${author.id}`} className="blog-meta__author">
        {author.name}
      </Link>
      <time dateTime={post.date}>{formatDate(post.date)}</time>
      {readTime && <span>{readTime}</span>}
      {post.category && <span>{post.category}</span>}
    </div>
  );
}

function StoryCard({
  post,
  author,
  variant,
}: {
  post: BlogManifestPost;
  author: BlogAuthor;
  variant?: 'lead' | 'sidebar';
}) {
  const imageUrl = toAssetUrl(post.leadImage);
  const fallbackImageUrl = toAssetUrl(post.leadImageFallback);
  const resolvedImageUrl = imageUrl || fallbackImageUrl;

  if (variant === 'lead') {
    return (
      <article className="blog-lead">
        <Link to={`/blog/${post.slug}`} className="blog-lead__image-wrap" aria-label={`Read ${post.title}`}>
          {resolvedImageUrl ? (
            <SmartImage
              src={resolvedImageUrl}
              fallbackSrc={fallbackImageUrl}
              alt={post.leadImageAlt || post.title}
              className="blog-lead__img"
              loading="eager"
              fetchPriority="high"
              placeholderClassName="blog-card__placeholder"
            />
          ) : (
            <div className="blog-card__placeholder" />
          )}
        </Link>
        {post.category && <p className="blog-kicker">{post.category}</p>}
        <h2 className="blog-lead__title">
          <Link to={`/blog/${post.slug}`}>{post.title}</Link>
        </h2>
        {post.excerpt && <p className="blog-lead__excerpt">{post.excerpt}</p>}
        <StoryMeta post={post} author={author} />
      </article>
    );
  }

  if (variant === 'sidebar') {
    return (
      <article className="blog-sidebar__item">
        <Link to={`/blog/${post.slug}`} aria-label={`Read ${post.title}`}>
          {resolvedImageUrl ? (
            <SmartImage
              src={resolvedImageUrl}
              fallbackSrc={fallbackImageUrl}
              alt={post.leadImageAlt || post.title}
              className="blog-sidebar__thumb"
              loading="lazy"
              placeholderClassName="blog-sidebar__thumb blog-sidebar__thumb--placeholder"
            />
          ) : (
            <div className="blog-sidebar__thumb blog-sidebar__thumb--placeholder" />
          )}
        </Link>
        <div className="blog-sidebar__copy">
          <h3 className="blog-sidebar__title">
            <Link to={`/blog/${post.slug}`}>{post.title}</Link>
          </h3>
          <time className="blog-sidebar__date" dateTime={post.date}>
            {formatDate(post.date)}
          </time>
        </div>
      </article>
    );
  }

  return (
    <article className="blog-card">
      <Link to={`/blog/${post.slug}`} className="blog-card__media" aria-label={`Read ${post.title}`}>
        {resolvedImageUrl ? (
          <SmartImage
            src={resolvedImageUrl}
            fallbackSrc={fallbackImageUrl}
            alt={post.leadImageAlt || post.title}
            className="blog-card__image"
            loading="lazy"
            placeholderClassName="blog-card__placeholder"
          />
        ) : (
          <div className="blog-card__placeholder" />
        )}
      </Link>
      <div className="blog-card__body">
        {post.category && <p className="blog-card__eyebrow">{post.category}</p>}
        <h3 className="blog-card__title">
          <Link to={`/blog/${post.slug}`}>{post.title}</Link>
        </h3>
        <time className="blog-meta" dateTime={post.date}>
          {formatDate(post.date)}
        </time>
      </div>
    </article>
  );
}

function StoryBody({ slug, post }: { slug: string; post: BlogPostDocument }) {
  return (
    <div className="story__body">
      {post.body.map((block, index) => {
        if (block.type === 'text') {
          return (
            <p key={`${block.type}-${index}`} className="story__paragraph">
              {block.content}
            </p>
          );
        }

        if (block.type === 'quote') {
          return (
            <blockquote key={`${block.type}-${index}`} className="story__quote">
              <p>{block.content}</p>
            </blockquote>
          );
        }

        if (block.type === 'image') {
          const imageUrl = toPostAssetUrl(slug, block.src);

          return (
            <figure key={`${block.type}-${index}`} className="story__media">
              {imageUrl && <img src={imageUrl} alt={block.alt || ''} loading="lazy" className="story__media-image" />}
              {block.caption && <figcaption className="story__caption">{block.caption}</figcaption>}
            </figure>
          );
        }

        return null;
      })}
    </div>
  );
}

export default function BlogPage() {
  const { slug } = useParams<{ slug?: string }>();
  const [manifest, setManifest] = useState<BlogManifest | null>(null);
  const [authors, setAuthors] = useState<BlogAuthor[]>([]);
  const [manifestError, setManifestError] = useState<string | null>(null);
  const [manifestLoading, setManifestLoading] = useState(true);
  const [post, setPost] = useState<BlogPostDocument | null>(null);
  const [postError, setPostError] = useState<string | null>(null);
  const [postLoading, setPostLoading] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [slug]);

  useEffect(() => {
    let active = true;

    setManifestLoading(true);
    setManifestError(null);

    fetchJson<BlogManifest>(`${BLOG_BASE}/blog-manifest.json`)
      .then((data) => {
        if (!active) return;
        setManifest(data);
      })
      .catch((error: Error) => {
        if (!active) return;
        setManifestError(error.message);
      })
      .finally(() => {
        if (!active) return;
        setManifestLoading(false);
      });

    fetchJson<BlogAuthorsFile>(`${BLOG_BASE}/authors.json`)
      .then((data) => {
        if (!active) return;
        setAuthors(Array.isArray(data.authors) ? data.authors : []);
      })
      .catch(() => {
        if (!active) return;
        setAuthors([]);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!slug) {
      setPost(null);
      setPostError(null);
      setPostLoading(false);
      return;
    }

    let active = true;

    setPostLoading(true);
    setPostError(null);

    fetchJson<BlogPostDocument>(`${BLOG_BASE}/posts/${slug}/post.json`)
      .then((data) => {
        if (!active) return;
        setPost(data);
      })
      .catch((error: Error) => {
        if (!active) return;
        setPost(null);
        setPostError(error.message);
      })
      .finally(() => {
        if (!active) return;
        setPostLoading(false);
      });

    return () => {
      active = false;
    };
  }, [slug]);

  const posts = manifest?.posts ?? [];
  const leadPost = posts[0];
  const sidebarPosts = posts.slice(1, 4);
  const gridPosts = posts.slice(4);
  const manifestPost = slug ? posts.find((entry) => entry.slug === slug) ?? null : null;
  const resolvedPost = post
    ? {
        ...(manifestPost ?? {}),
        ...post,
      }
    : null;
  const getAuthor = (postLike?: Pick<BlogManifestPost, 'authorId' | 'authorName'> | null): BlogAuthor => {
    if (!postLike) return FALLBACK_AUTHOR;
    const id = postLike.authorId || DEFAULT_AUTHOR_ID;
    const author = authors.find((entry) => entry.id === id);
    if (author) return author;
    if (postLike.authorName) {
      return {
        ...FALLBACK_AUTHOR,
        id,
        name: postLike.authorName,
      };
    }
    return FALLBACK_AUTHOR;
  };

  const resolvedAuthor = getAuthor(resolvedPost);
  const leadImage = resolvedPost ? toPostAssetUrl(resolvedPost.slug, resolvedPost.leadImage) : undefined;
  const leadImageFallback = resolvedPost
    ? toPostAssetUrl(resolvedPost.slug, resolvedPost.leadImageFallback)
    : undefined;
  const absoluteLeadImage = toAbsoluteUrl(leadImage || leadImageFallback);
  const relatedPosts = resolvedPost ? posts.filter((entry) => entry.slug !== resolvedPost.slug).slice(0, 3) : [];
  const authorName = resolvedAuthor.name;

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
          jsonLd: buildPostJsonLd(resolvedPost, authorName, absoluteLeadImage),
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
          image: toAbsoluteUrl(toAssetUrl(leadPost?.leadImage || leadPost?.leadImageFallback)),
        },
        twitter: {
          card: 'summary_large_image',
          title: 'McCal Media Blog',
          description: 'Field notes, visual essays, and reporting from McCal Media.',
          image: toAbsoluteUrl(toAssetUrl(leadPost?.leadImage || leadPost?.leadImageFallback)),
        },
        jsonLd: buildIndexJsonLd(posts, getAuthor),
      };

  usePageMeta(pageMeta);

  return (
    <Layout>
      <div className="blog-page">
        {manifestLoading && <div className="blog-status">Loading stories...</div>}
        {!manifestLoading && manifestError && (
          <div className="blog-message blog-message--error">Failed to load the blog manifest: {manifestError}</div>
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

            {!postLoading && (postError || (!resolvedPost && !postLoading)) && (
              <div className="blog-message blog-message--error">
                {postError ? `Failed to load this story: ${postError}` : 'This story could not be found.'}
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
