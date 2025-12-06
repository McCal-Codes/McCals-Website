/**
 * Blog Post List Component
 * 
 * Displays a list of blog posts from the API
 * Part of Phase 2: Next.js components implementation
 */

import { BlogPost } from '../utils/api-client';
import styles from './BlogPostList.module.css';

interface BlogPostListProps {
  posts: BlogPost[];
  loading?: boolean;
  error?: string;
  onPostClick?: (post: BlogPost) => void;
}

export default function BlogPostList({
  posts,
  loading,
  error,
  onPostClick,
}: BlogPostListProps) {
  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Loading blog posts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', backgroundColor: '#ffebee', borderRadius: '4px', color: '#c62828' }}>
        <p>Error loading blog posts:</p>
        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{error}</pre>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div style={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '4px', textAlign: 'center' }}>
        <p style={{ color: '#666' }}>No blog posts yet</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '0' }}>
      <h2 style={{ marginTop: 0 }}>Blog Posts ({posts.length})</h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px',
        }}
      >
        {posts.map((post) => (
          <article
            key={post.id}
            style={{
              padding: '20px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              cursor: onPostClick ? 'pointer' : 'default',
              transition: onPostClick ? 'all 0.3s ease' : 'none',
            }}
            onMouseEnter={(e) => {
              if (onPostClick) {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={(e) => {
              if (onPostClick) {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
            onClick={() => onPostClick?.(post)}
          >
            <div style={{ marginBottom: '10px' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', lineHeight: '1.4' }}>
                {post.title}
              </h3>
              <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>
                by <strong>{post.author.name}</strong>
              </p>
            </div>

            <p style={{ margin: '0 0 15px 0', color: '#555', fontSize: '14px', lineHeight: '1.5' }}>
              {post.excerpt}
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '12px', color: '#999' }}>
                <time dateTime={post.createdAt}>
                  {new Date(post.createdAt).toLocaleDateString()}
                </time>
              </div>

              <div>
                {post.published ? (
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '4px 12px',
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
                      padding: '4px 12px',
                      backgroundColor: '#999',
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

            {onPostClick && (
              <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #eee' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPostClick(post);
                  }}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#2196f3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  Read More
                </button>
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
