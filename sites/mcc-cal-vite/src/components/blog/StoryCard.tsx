/**
 * StoryCard component - Displays blog post cards in various layouts
 */

import { Link } from 'react-router-dom';
import type { BlogManifestPost, BlogAuthor } from '@/types/blog';
import { formatDateLong } from '@/utils/formatters';
import SmartImage from './SmartImage';
import StoryMeta from './StoryMeta';
import { toAssetUrl } from './utils';

interface StoryCardProps {
  post: BlogManifestPost;
  author: BlogAuthor;
  variant?: 'lead' | 'sidebar' | 'default';
}

export default function StoryCard({ post, author, variant = 'default' }: StoryCardProps) {
  const imageUrl = toAssetUrl(post.leadImage);
  const fallbackImageUrl = toAssetUrl(post.leadImageFallback);
  const resolvedImageUrl = imageUrl || fallbackImageUrl;

  // Lead variant - large featured layout
  if (variant === 'lead') {
    return (
      <article className="blog-lead">
        <Link
          to={`/blog/${post.slug}`}
          className="blog-lead__image-wrap"
          aria-label={`Read ${post.title}`}
        >
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

  // Sidebar variant - compact list item
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
            {formatDateLong(post.date)}
          </time>
        </div>
      </article>
    );
  }

  // Default variant - standard card layout
  return (
    <article className="blog-card">
      <Link
        to={`/blog/${post.slug}`}
        className="blog-card__media"
        aria-label={`Read ${post.title}`}
      >
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
          {formatDateLong(post.date)}
        </time>
      </div>
    </article>
  );
}
