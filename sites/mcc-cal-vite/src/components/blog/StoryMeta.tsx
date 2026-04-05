/**
 * StoryMeta component - Displays post metadata (author, date, read time)
 */

import { Link } from 'react-router-dom';
import type { BlogManifestPost } from '@/types/blog';
import { formatDateLong, readingTimeLabel } from '@/utils/formatters';

interface StoryMetaProps {
  post: BlogManifestPost;
  author: { name: string; id: string };
}

export default function StoryMeta({ post, author }: StoryMetaProps) {
  const readTime = readingTimeLabel(post.readingTime);

  return (
    <div className="blog-meta" aria-label="Story metadata">
      <Link to={`/authors/${author.id}`} className="blog-meta__author">
        {author.name}
      </Link>
      <time dateTime={post.date}>{formatDateLong(post.date)}</time>
      {readTime && <span>{readTime}</span>}
      {post.category && <span>{post.category}</span>}
    </div>
  );
}
