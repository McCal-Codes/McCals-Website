/**
 * Blog post + manifest data, backed by Supabase's blog_posts table (written
 * through the admin app). Authors stay in the static authors.json — there's
 * no editing UI for them and they rarely change, so there was no reason to
 * move them off the file that already works.
 */

import { supabase } from '@/lib/supabase';
import type { BlogBodyBlock, BlogManifest, BlogManifestPost, BlogPostDocument, BlogSource } from '@/types/blog';

const MANIFEST_SELECT =
  'slug,title,author_id,date,category,excerpt,lead_image,lead_image_alt,lead_image_caption,published,tags,body';
const POST_SELECT = `${MANIFEST_SELECT},sources`;

interface BlogPostRow {
  slug: string;
  title: string;
  author_id: string | null;
  date: string;
  category: string | null;
  excerpt: string | null;
  lead_image: string | null;
  lead_image_alt: string | null;
  lead_image_caption: string | null;
  published: boolean;
  tags: string[] | null;
  body: BlogBodyBlock[] | null;
  sources?: BlogSource[] | null;
}

function computeReadingTime(body: BlogBodyBlock[] | null): number {
  const words = (body || []).reduce((sum, block) => {
    if (block.type !== 'text' && block.type !== 'quote') return sum;
    return sum + block.content.split(/\s+/).filter(Boolean).length;
  }, 0);
  return Math.max(1, Math.round(words / 200));
}

function mapRow(row: BlogPostRow): BlogManifestPost {
  return {
    slug: row.slug,
    title: row.title,
    authorId: row.author_id || undefined,
    date: row.date,
    category: row.category || undefined,
    excerpt: row.excerpt || undefined,
    leadImage: row.lead_image,
    leadImageAlt: row.lead_image_alt || undefined,
    leadImageCaption: row.lead_image_caption || undefined,
    published: row.published,
    readingTime: computeReadingTime(row.body),
  };
}

export async function fetchBlogManifestFromSupabase(): Promise<BlogManifest> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select(MANIFEST_SELECT)
    .eq('published', true)
    .order('date', { ascending: false });

  if (error) throw new Error(error.message);

  const rows = (data || []) as unknown as BlogPostRow[];
  const posts = rows.map(mapRow);
  return { version: 'supabase', generated: new Date().toISOString(), total: posts.length, posts };
}

export async function fetchBlogPostFromSupabase(slug: string): Promise<BlogPostDocument> {
  const { data, error } = await supabase.from('blog_posts').select(POST_SELECT).eq('slug', slug).maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error(`404 Post not found: ${slug}`);

  const row = data as unknown as BlogPostRow;
  return {
    ...mapRow(row),
    tags: row.tags || [],
    sources: row.sources || [],
    body: row.body || [],
  };
}
