/**
 * Blog Post Detail Component
 * 
 * Displays a single blog post with full content
 * Part of Phase 2: Next.js components implementation
 */

import { BlogPost, ContentBlock } from '../utils/api-client';

interface BlogPostDetailProps {
  post: BlogPost;
  loading?: boolean;
  error?: string;
  onBack?: () => void;
}

export default function BlogPostDetail({
  post,
  loading,
  error,
  onBack,
}: BlogPostDetailProps) {
  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Loading blog post...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', backgroundColor: '#ffebee', borderRadius: '4px', color: '#c62828' }}>
        <p>Error loading blog post:</p>
        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{error}</pre>
      </div>
    );
  }

  const renderContentBlock = (block: ContentBlock, idx: number) => {
    switch (block.type) {
      case 'text':
        return (
          <p
            key={idx}
            style={{
              fontSize: '16px',
              lineHeight: '1.6',
              margin: '0 0 16px 0',
              color: '#333',
            }}
          >
            {block.content}
          </p>
        );

      case 'image':
        return (
          <figure
            key={idx}
            style={{
              margin: '24px 0',
              textAlign: 'center',
            }}
          >
            <img
              src={block.content}
              alt="Blog post image"
              style={{
                maxWidth: '100%',
                height: 'auto',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            />
          </figure>
        );

      case 'quote':
        return (
          <blockquote
            key={idx}
            style={{
              margin: '20px 0',
              padding: '16px 20px',
              backgroundColor: '#f5f5f5',
              borderLeft: '4px solid #2196f3',
              fontStyle: 'italic',
              color: '#666',
              fontSize: '15px',
            }}
          >
            {block.content}
          </blockquote>
        );

      case 'code':
        return (
          <pre
            key={idx}
            style={{
              margin: '20px 0',
              padding: '16px',
              backgroundColor: '#f5f5f5',
              borderRadius: '4px',
              overflow: 'auto',
              fontSize: '13px',
              fontFamily: 'monospace',
            }}
          >
            <code>{block.content}</code>
          </pre>
        );

      default:
        return null;
    }
  };

  return (
    <article style={{ maxWidth: '800px', margin: '0 auto' }}>
      {onBack && (
        <button
          onClick={onBack}
          style={{
            marginBottom: '20px',
            padding: '8px 16px',
            backgroundColor: '#f5f5f5',
            border: '1px solid #ddd',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          ← Back to Posts
        </button>
      )}

      <header style={{ marginBottom: '30px', borderBottom: '1px solid #eee', paddingBottom: '20px' }}>
        <h1 style={{ margin: '0 0 16px 0', fontSize: '32px', lineHeight: '1.2' }}>
          {post.title}
        </h1>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div style={{ fontSize: '14px', color: '#666' }}>
            <div style={{ marginBottom: '4px' }}>
              By <strong>{post.author.name}</strong>
            </div>
            <time dateTime={post.createdAt}>
              {new Date(post.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
            {post.updatedAt !== post.createdAt && (
              <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                Updated{' '}
                <time dateTime={post.updatedAt}>
                  {new Date(post.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </time>
              </div>
            )}
          </div>

          <div>
            {post.published ? (
              <span
                style={{
                  display: 'inline-block',
                  padding: '6px 14px',
                  backgroundColor: '#4caf50',
                  color: 'white',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                }}
              >
                Published
              </span>
            ) : (
              <span
                style={{
                  display: 'inline-block',
                  padding: '6px 14px',
                  backgroundColor: '#ff9800',
                  color: 'white',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                }}
              >
                Draft
              </span>
            )}
          </div>
        </div>
      </header>

      {post.excerpt && (
        <div
          style={{
            fontSize: '18px',
            fontStyle: 'italic',
            color: '#666',
            marginBottom: '30px',
            padding: '16px',
            backgroundColor: '#f9f9f9',
            borderLeft: '4px solid #2196f3',
            borderRadius: '4px',
          }}
        >
          {post.excerpt}
        </div>
      )}

      <div style={{ fontSize: '16px', lineHeight: '1.8', color: '#333' }}>
        {post.content && post.content.length > 0 ? (
          post.content.map((block, idx) => renderContentBlock(block, idx))
        ) : (
          <p style={{ color: '#999', fontStyle: 'italic' }}>No content available</p>
        )}
      </div>

      {onBack && (
        <button
          onClick={onBack}
          style={{
            marginTop: '40px',
            padding: '8px 16px',
            backgroundColor: '#f5f5f5',
            border: '1px solid #ddd',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          ← Back to Posts
        </button>
      )}
    </article>
  );
}
