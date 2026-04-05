/**
 * StoryBody component - Renders blog post content blocks
 */

import type { BlogPostDocument } from '@/types/blog';
import { toPostAssetUrl } from './utils';

interface StoryBodyProps {
  slug: string;
  post: BlogPostDocument;
}

export default function StoryBody({ slug, post }: StoryBodyProps) {
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
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt={block.alt || ''}
                  loading="lazy"
                  className="story__media-image"
                />
              )}
              {block.caption && (
                <figcaption className="story__caption">{block.caption}</figcaption>
              )}
            </figure>
          );
        }

        if (block.type === 'code') {
          return (
            <pre key={`${block.type}-${index}`} className="story__code">
              <code>{block.content}</code>
            </pre>
          );
        }

        return null;
      })}
    </div>
  );
}
