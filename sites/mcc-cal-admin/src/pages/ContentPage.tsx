import { useEffect, useState } from 'react';
import SectionCard from '@/components/SectionCard';
import StatusBadge from '@/components/StatusBadge';

const AUTHORS = [
  { id: 'mccal', name: 'Caleb McCartney' },
  { id: 'ladybrain', name: 'Divine Eyth' },
];

interface BlogPostSummary {
  id: string;
  slug: string;
  title: string;
  author_id: string;
  date: string;
  category: string | null;
  published: boolean;
  updated_at: string;
}

interface BlogPostDetail extends BlogPostSummary {
  excerpt: string | null;
  lead_image: string | null;
  lead_image_alt: string | null;
  lead_image_caption: string | null;
  tags: string[] | null;
  bodyText: string;
}

interface PostFormState {
  slug: string;
  title: string;
  authorId: string;
  date: string;
  category: string;
  excerpt: string;
  leadImage: string;
  leadImageAlt: string;
  leadImageCaption: string;
  published: boolean;
  tags: string;
  bodyText: string;
}

const EMPTY_FORM: PostFormState = {
  slug: '',
  title: '',
  authorId: 'mccal',
  date: new Date().toISOString().slice(0, 10),
  category: '',
  excerpt: '',
  leadImage: '',
  leadImageAlt: '',
  leadImageCaption: '',
  published: true,
  tags: '',
  bodyText: '',
};

function detailToForm(post: BlogPostDetail): PostFormState {
  return {
    slug: post.slug,
    title: post.title,
    authorId: post.author_id,
    date: post.date,
    category: post.category || '',
    excerpt: post.excerpt || '',
    leadImage: post.lead_image || '',
    leadImageAlt: post.lead_image_alt || '',
    leadImageCaption: post.lead_image_caption || '',
    published: post.published,
    tags: (post.tags || []).join(', '),
    bodyText: post.bodyText,
  };
}

function PostList({ onSelect, onNew }: { onSelect: (slug: string) => void; onNew: () => void }) {
  const [posts, setPosts] = useState<BlogPostSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch('/api/admin/blog/posts')
      .then((res) => res.json())
      .then((json) => {
        if (!active) return;
        if (!json.ok || !json.data) throw new Error(json.error || 'Failed to load posts');
        setPosts(json.data);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Failed to load posts');
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <SectionCard title="Blog posts" eyebrow="Written and published here — no separate CMS">
      {error ? <p className="inline-error">{error}</p> : null}

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button type="button" className="button-link" onClick={onNew}>
          New post
        </button>
      </div>

      {posts === null ? (
        <p className="upload-file-row__size">Loading…</p>
      ) : posts.length === 0 ? (
        <p className="upload-file-row__size">No posts yet.</p>
      ) : (
        <div className="upload-file-list">
          {posts.map((post) => (
            <button
              key={post.id}
              type="button"
              className="upload-file-row"
              style={{ textAlign: 'left', cursor: 'pointer' }}
              onClick={() => onSelect(post.slug)}
            >
              <div>
                <p className="upload-file-row__name">{post.title}</p>
                <p className="upload-file-row__size">
                  {post.date} · {AUTHORS.find((a) => a.id === post.author_id)?.name || post.author_id}
                  {post.category ? ` · ${post.category}` : ''}
                </p>
              </div>
              <StatusBadge tone={post.published ? 'success' : 'pending'} label={post.published ? 'Published' : 'Draft'} />
            </button>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

function PostEditor({
  slug,
  onDone,
}: {
  slug: string | null; // null = creating a new post
  onDone: () => void;
}) {
  const [form, setForm] = useState<PostFormState>(EMPTY_FORM);
  const [loading, setLoading] = useState(Boolean(slug));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setForm(EMPTY_FORM);
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    fetch(`/api/admin/blog/posts/${encodeURIComponent(slug)}`)
      .then((res) => res.json())
      .then((json) => {
        if (!active) return;
        if (!json.ok || !json.data) throw new Error(json.error || 'Failed to load post');
        setForm(detailToForm(json.data));
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Failed to load post');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [slug]);

  const update = <K extends keyof PostFormState>(key: K, value: PostFormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    const tags = form.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    try {
      if (!slug) {
        const res = await fetch('/api/admin/blog/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slug: form.slug,
            title: form.title,
            authorId: form.authorId,
            date: form.date,
            category: form.category,
            excerpt: form.excerpt,
            leadImage: form.leadImage,
            leadImageAlt: form.leadImageAlt,
            leadImageCaption: form.leadImageCaption,
            published: form.published,
            tags,
            bodyText: form.bodyText,
          }),
        });
        const json = await res.json();
        if (!res.ok || !json.ok) throw new Error(json.error || 'Failed to create post');
      } else {
        const res = await fetch(`/api/admin/blog/posts/${encodeURIComponent(slug)}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: form.title,
            authorId: form.authorId,
            date: form.date,
            category: form.category,
            excerpt: form.excerpt,
            leadImage: form.leadImage,
            leadImageAlt: form.leadImageAlt,
            leadImageCaption: form.leadImageCaption,
            published: form.published,
            tags,
            bodyText: form.bodyText,
          }),
        });
        const json = await res.json();
        if (!res.ok || !json.ok) throw new Error(json.error || 'Failed to save post');
      }

      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save post');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SectionCard title={slug ? 'Edit post' : 'New post'} eyebrow="Blog">
        <p className="upload-file-row__size">Loading…</p>
      </SectionCard>
    );
  }

  return (
    <SectionCard title={slug ? 'Edit post' : 'New post'} eyebrow="Blog">
      <button type="button" className="button-link button-link--ghost" onClick={onDone}>
        ← Back to posts
      </button>

      <div className="form-row">
        <label className="form-field">
          <span className="form-field__label">Title</span>
          <input type="text" value={form.title} onChange={(e) => update('title', e.target.value)} />
        </label>
        {!slug && (
          <label className="form-field">
            <span className="form-field__label">Slug (leave blank to derive from title)</span>
            <input type="text" value={form.slug} onChange={(e) => update('slug', e.target.value)} />
          </label>
        )}
      </div>

      <div className="form-row">
        <label className="form-field">
          <span className="form-field__label">Author</span>
          <select value={form.authorId} onChange={(e) => update('authorId', e.target.value)}>
            {AUTHORS.map((author) => (
              <option key={author.id} value={author.id}>
                {author.name}
              </option>
            ))}
          </select>
        </label>
        <label className="form-field">
          <span className="form-field__label">Date</span>
          <input type="text" value={form.date} onChange={(e) => update('date', e.target.value)} placeholder="YYYY-MM-DD" />
        </label>
        <label className="form-field">
          <span className="form-field__label">Category</span>
          <input type="text" value={form.category} onChange={(e) => update('category', e.target.value)} />
        </label>
      </div>

      <label className="form-field">
        <span className="form-field__label">Excerpt</span>
        <input type="text" value={form.excerpt} onChange={(e) => update('excerpt', e.target.value)} />
      </label>

      <div className="form-row">
        <label className="form-field">
          <span className="form-field__label">Lead image URL</span>
          <input type="text" value={form.leadImage} onChange={(e) => update('leadImage', e.target.value)} placeholder="Paste a URL, e.g. from the Albums upload" />
        </label>
        <label className="form-field">
          <span className="form-field__label">Lead image alt text</span>
          <input type="text" value={form.leadImageAlt} onChange={(e) => update('leadImageAlt', e.target.value)} />
        </label>
        <label className="form-field">
          <span className="form-field__label">Lead image caption</span>
          <input type="text" value={form.leadImageCaption} onChange={(e) => update('leadImageCaption', e.target.value)} />
        </label>
      </div>

      <label className="form-field">
        <span className="form-field__label">Tags (comma separated)</span>
        <input type="text" value={form.tags} onChange={(e) => update('tags', e.target.value)} />
      </label>

      <label className="checkbox-field">
        <input type="checkbox" checked={form.published} onChange={(e) => update('published', e.target.checked)} />
        Published
      </label>

      <label className="form-field">
        <span className="form-field__label">
          Body — blank line between paragraphs, {'>'} for a pull quote, ``` for code, ![alt](url "caption") for an
          inline image
        </span>
        <textarea
          rows={16}
          value={form.bodyText}
          onChange={(e) => update('bodyText', e.target.value)}
          style={{
            padding: '0.7rem 0.9rem',
            borderRadius: '0.8rem',
            border: '1px solid var(--line)',
            background: 'var(--bg-soft)',
            color: 'var(--text)',
            fontFamily: 'inherit',
            resize: 'vertical',
          }}
        />
      </label>

      {error ? <p className="inline-error">{error}</p> : null}

      <div>
        <button type="button" className="button-link" onClick={handleSave} disabled={saving || !form.title}>
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </SectionCard>
  );
}

export default function ContentPage() {
  const [view, setView] = useState<{ mode: 'list' } | { mode: 'edit'; slug: string | null }>({ mode: 'list' });

  return (
    <div className="page-grid">
      {view.mode === 'list' ? (
        <PostList
          onSelect={(slug) => setView({ mode: 'edit', slug })}
          onNew={() => setView({ mode: 'edit', slug: null })}
        />
      ) : (
        <PostEditor slug={view.slug} onDone={() => setView({ mode: 'list' })} />
      )}

      <SectionCard title="Album photos" eyebrow="A separate page">
        <p className="lead-copy">
          Photo uploads and album metadata (captions, alt text, tags, featured) are handled on the{' '}
          <a className="text-link" href="/albums">
            Albums
          </a>{' '}
          page — backed by Supabase and Cloudflare R2.
        </p>
      </SectionCard>
    </div>
  );
}
