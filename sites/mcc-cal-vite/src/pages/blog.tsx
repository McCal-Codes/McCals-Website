import { useState, useEffect } from 'react';
import Layout from '@/components/Layout/Layout';

interface BlogPostImage {
  src: string;
  alt: string;
  caption?: string;
}

interface BlogPost {
  title: string;
  author: string;
  date: string;
  excerpt: string;
  body: string[];
  images?: BlogPostImage[];
}

const API_BASE = import.meta.env.VITE_API_URL || 'https://api.mcc-cal.com';

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function PostCard({ post, onClick }: { post: BlogPost; onClick: () => void }) {
  return (
    <article className="blog-card" onClick={onClick}>
      {post.images && post.images.length > 0 && (
        <div className="blog-card__image-wrap">
          <img src={post.images[0].src} alt={post.images[0].alt} className="blog-card__image" loading="lazy" />
        </div>
      )}
      <div className="blog-card__body">
        <h2 className="blog-card__title">{post.title}</h2>
        <div className="blog-card__meta">
          <span className="blog-card__author">{post.author}</span>
          <time className="blog-card__date" dateTime={post.date}>{formatDate(post.date)}</time>
        </div>
        <p className="blog-card__excerpt">{post.excerpt}</p>
        <span className="blog-card__read-more">Read more &rarr;</span>
      </div>
    </article>
  );
}

function PostDetail({ post, onBack }: { post: BlogPost; onBack: () => void }) {
  return (
    <article className="blog-post">
      <button className="blog-post__back" onClick={onBack}>&larr; All Posts</button>
      <header className="blog-post__header">
        <h1 className="blog-post__title">{post.title}</h1>
        <div className="blog-post__meta">
          <span className="blog-post__author">{post.author}</span>
          <time className="blog-post__date" dateTime={post.date}>{formatDate(post.date)}</time>
        </div>
      </header>
      {post.excerpt && <p className="blog-post__excerpt">{post.excerpt}</p>}
      <div className="blog-post__content">
        {post.body.map((paragraph, i) => (
          <p key={i} className="blog-post__paragraph">{paragraph}</p>
        ))}
      </div>
      {post.images && post.images.length > 1 && (
        <div className="blog-post__gallery">
          {post.images.map((img, i) => (
            <figure key={i} className="blog-post__figure">
              <img src={img.src} alt={img.alt} className="blog-post__figure-img" loading="lazy" />
              {img.caption && <figcaption className="blog-post__caption">{img.caption}</figcaption>}
            </figure>
          ))}
        </div>
      )}
      <button className="blog-post__back blog-post__back--bottom" onClick={onBack}>&larr; All Posts</button>
    </article>
  );
}

const BlogPage = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<BlogPost | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/blog/posts`)
      .then((res) => {
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        return res.json();
      })
      .then((data) => setPosts(data.posts || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <style>{`
        .blog-page { padding: clamp(40px, 6vw, 80px) 0; }
        .blog-page__heading {
          font-size: clamp(1.8rem, 4vw, 2.8rem);
          font-weight: 700;
          margin: 0 0 0.4em 0;
          letter-spacing: -0.02em;
        }
        .blog-page__subheading {
          font-size: 1.05rem;
          opacity: 0.6;
          margin: 0 0 3rem 0;
        }
        .blog-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 2rem;
        }
        .blog-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        }
        body[data-theme="light"] .blog-card {
          background: #fff;
          border-color: rgba(0,0,0,0.08);
        }
        .blog-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 30px rgba(0,0,0,0.25);
          border-color: rgba(255,255,255,0.18);
        }
        body[data-theme="light"] .blog-card:hover { box-shadow: 0 8px 30px rgba(0,0,0,0.1); border-color: rgba(0,0,0,0.15); }
        .blog-card__image-wrap { aspect-ratio: 16/9; overflow: hidden; }
        .blog-card__image { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease; }
        .blog-card:hover .blog-card__image { transform: scale(1.03); }
        .blog-card__body { padding: 1.4rem 1.5rem 1.6rem; }
        .blog-card__title { font-size: 1.15rem; font-weight: 600; margin: 0 0 0.5rem 0; line-height: 1.35; }
        .blog-card__meta { display: flex; gap: 1rem; font-size: 0.8rem; opacity: 0.55; margin-bottom: 0.75rem; flex-wrap: wrap; }
        .blog-card__excerpt { font-size: 0.9rem; line-height: 1.6; opacity: 0.75; margin: 0 0 1rem 0; }
        .blog-card__read-more { font-size: 0.85rem; font-weight: 600; opacity: 0.8; letter-spacing: 0.01em; }

        .blog-post { max-width: 720px; padding: clamp(40px, 6vw, 80px) 0; }
        .blog-post__back {
          background: none;
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 6px;
          color: inherit;
          cursor: pointer;
          font-size: 0.85rem;
          padding: 0.45rem 1rem;
          opacity: 0.7;
          transition: opacity 0.15s;
          margin-bottom: 2rem;
          display: inline-block;
        }
        body[data-theme="light"] .blog-post__back { border-color: rgba(0,0,0,0.15); }
        .blog-post__back:hover { opacity: 1; }
        .blog-post__back--bottom { margin-top: 3rem; margin-bottom: 0; }
        .blog-post__header { margin-bottom: 1.5rem; }
        .blog-post__title { font-size: clamp(1.6rem, 4vw, 2.4rem); font-weight: 700; margin: 0 0 0.6rem 0; line-height: 1.2; letter-spacing: -0.02em; }
        .blog-post__meta { display: flex; gap: 1rem; font-size: 0.85rem; opacity: 0.55; flex-wrap: wrap; }
        .blog-post__excerpt {
          font-size: 1.1rem;
          font-style: italic;
          opacity: 0.65;
          margin: 0 0 2rem 0;
          padding: 1rem 1.2rem;
          border-left: 3px solid rgba(255,255,255,0.2);
        }
        body[data-theme="light"] .blog-post__excerpt { border-left-color: rgba(0,0,0,0.15); }
        .blog-post__paragraph { font-size: 1rem; line-height: 1.8; margin: 0 0 1.2rem 0; opacity: 0.85; }
        .blog-post__gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.2rem; margin-top: 2.5rem; }
        .blog-post__figure { margin: 0; }
        .blog-post__figure-img { width: 100%; border-radius: 8px; display: block; }
        .blog-post__caption { font-size: 0.8rem; opacity: 0.5; margin-top: 0.4rem; text-align: center; }

        .blog-status { padding: 4rem 0; text-align: center; opacity: 0.55; font-size: 0.95rem; }
        .blog-error { padding: 2rem; background: rgba(220,38,38,0.08); border: 1px solid rgba(220,38,38,0.2); border-radius: 8px; color: #f87171; font-size: 0.9rem; }
      `}</style>

      <div className="blog-page">
        {!selected && (
          <>
            <h1 className="blog-page__heading">Blog</h1>
            <p className="blog-page__subheading">Stories, updates, and field notes.</p>
          </>
        )}

        {loading && <div className="blog-status">Loading posts&hellip;</div>}
        {error && <div className="blog-error">Failed to load posts: {error}</div>}

        {!loading && !error && !selected && (
          posts.length === 0
            ? <div className="blog-status">No posts yet — check back soon.</div>
            : <div className="blog-grid">
                {posts.map((post, i) => (
                  <PostCard key={i} post={post} onClick={() => setSelected(post)} />
                ))}
              </div>
        )}

        {selected && (
          <PostDetail post={selected} onBack={() => setSelected(null)} />
        )}
      </div>
    </Layout>
  );
};

export default BlogPage;
