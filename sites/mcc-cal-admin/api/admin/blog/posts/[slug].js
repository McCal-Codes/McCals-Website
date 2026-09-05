import { requireAdminSession } from '../../../_lib/auth.js';
import { getBlogPostBySlug, updateBlogPost } from '../../../_lib/blog-posts-data.js';
import { bodyToMarkdown, markdownToBody } from '../../../_lib/blog-markdown.js';

function getSlug(req) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const parts = url.pathname.split('/').filter(Boolean);
  return decodeURIComponent(parts[parts.length - 1] || '');
}

export default async function handler(req, res) {
  const session = requireAdminSession(req, res);
  if (!session) return;

  const slug = getSlug(req);
  if (!slug) {
    return res.status(400).json({ ok: false, error: 'missing_slug' });
  }

  if (req.method === 'GET') {
    try {
      const post = await getBlogPostBySlug(slug);
      if (!post) {
        return res.status(404).json({ ok: false, error: 'post_not_found' });
      }

      res.setHeader('Cache-Control', 'no-store, max-age=0');
      return res.status(200).json({ ok: true, data: { ...post, bodyText: bodyToMarkdown(post.body) } });
    } catch (err) {
      console.error('[admin/blog/posts/detail] Error:', err);
      return res.status(err.statusCode || 500).json({
        ok: false,
        error: err.code || 'failed_to_load_post',
        message: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  }

  if (req.method === 'PATCH') {
    try {
      const body = req.body || {};
      const fields = {};

      if (body.title !== undefined) fields.title = String(body.title).trim();
      if (body.authorId !== undefined) fields.author_id = body.authorId;
      if (body.date !== undefined) fields.date = body.date;
      if (body.category !== undefined) fields.category = body.category || null;
      if (body.excerpt !== undefined) fields.excerpt = body.excerpt || null;
      if (body.leadImage !== undefined) fields.lead_image = body.leadImage || null;
      if (body.leadImageAlt !== undefined) fields.lead_image_alt = body.leadImageAlt || null;
      if (body.leadImageCaption !== undefined) fields.lead_image_caption = body.leadImageCaption || null;
      if (body.published !== undefined) fields.published = Boolean(body.published);
      if (body.tags !== undefined) fields.tags = Array.isArray(body.tags) ? body.tags : [];
      if (body.sources !== undefined) fields.sources = Array.isArray(body.sources) ? body.sources : [];
      if (body.bodyText !== undefined) fields.body = markdownToBody(body.bodyText);

      const post = await updateBlogPost(slug, fields);

      res.setHeader('Cache-Control', 'no-store, max-age=0');
      return res.status(200).json({ ok: true, data: post });
    } catch (err) {
      console.error('[admin/blog/posts/detail] Error:', err);
      return res.status(err.statusCode || 500).json({
        ok: false,
        error: err.code || 'failed_to_update_post',
        message: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  }

  res.setHeader('Allow', 'GET, PATCH');
  return res.status(405).json({ ok: false, error: 'method_not_allowed' });
}
