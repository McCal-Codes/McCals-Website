import { requireAdminSession } from '../../../_lib/auth.js';
import { createBlogPost, listBlogPosts } from '../../../_lib/blog-posts-data.js';
import { markdownToBody } from '../../../_lib/blog-markdown.js';
import { slugify } from '../../../_lib/slug.js';

export default async function handler(req, res) {
  const session = requireAdminSession(req, res);
  if (!session) return;

  if (req.method === 'GET') {
    try {
      const posts = await listBlogPosts();
      res.setHeader('Cache-Control', 'no-store, max-age=0');
      return res.status(200).json({ ok: true, data: posts });
    } catch (err) {
      console.error('[admin/blog/posts] Error:', err);
      return res.status(err.statusCode || 500).json({
        ok: false,
        error: err.code || 'failed_to_load_posts',
        message: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  }

  if (req.method === 'POST') {
    try {
      const body = req.body || {};
      const title = String(body.title || '').trim();
      if (!title) {
        return res.status(400).json({ ok: false, error: 'missing_title' });
      }

      const slug = slugify(body.slug || title);
      if (!slug) {
        return res.status(400).json({ ok: false, error: 'invalid_slug' });
      }

      const post = await createBlogPost({
        slug,
        title,
        author_id: body.authorId || 'mccal',
        date: body.date || new Date().toISOString().slice(0, 10),
        category: body.category || null,
        excerpt: body.excerpt || null,
        lead_image: body.leadImage || null,
        lead_image_alt: body.leadImageAlt || null,
        lead_image_caption: body.leadImageCaption || null,
        published: body.published !== false,
        tags: Array.isArray(body.tags) ? body.tags : [],
        sources: Array.isArray(body.sources) ? body.sources : [],
        body: markdownToBody(body.bodyText || ''),
      });

      res.setHeader('Cache-Control', 'no-store, max-age=0');
      return res.status(201).json({ ok: true, data: post });
    } catch (err) {
      console.error('[admin/blog/posts] Error:', err);
      return res.status(err.statusCode || 500).json({
        ok: false,
        error: err.code || 'failed_to_create_post',
        message: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ ok: false, error: 'method_not_allowed' });
}
