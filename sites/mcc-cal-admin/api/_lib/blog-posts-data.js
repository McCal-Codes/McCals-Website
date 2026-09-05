const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const EDITABLE_FIELDS = [
  'title',
  'author_id',
  'date',
  'category',
  'excerpt',
  'lead_image',
  'lead_image_alt',
  'lead_image_caption',
  'published',
  'tags',
  'sources',
  'body',
];

function supabaseConfigError() {
  const error = new Error('Supabase blog access is not configured');
  error.statusCode = 503;
  error.code = 'supabase_not_configured';
  return error;
}

function getSupabaseConfig() {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    throw supabaseConfigError();
  }

  return {
    url: SUPABASE_URL.replace(/\/$/, ''),
    key: SERVICE_ROLE_KEY,
  };
}

function authHeaders(config, extra = {}) {
  return {
    apikey: config.key,
    Authorization: `Bearer ${config.key}`,
    Accept: 'application/json',
    ...extra,
  };
}

async function throwOnError(response, code) {
  if (response.ok) return;
  const error = new Error(`Supabase request failed: ${response.status}`);
  error.statusCode = response.status;
  error.code = code;
  try {
    error.details = await response.json();
  } catch {
    // response body wasn't JSON, ignore
  }
  throw error;
}

export async function listBlogPosts() {
  const config = getSupabaseConfig();
  const url = new URL(`${config.url}/rest/v1/blog_posts`);
  url.searchParams.set('select', 'id,slug,title,author_id,date,category,published,updated_at');
  url.searchParams.set('order', 'date.desc');

  const response = await fetch(url, { headers: authHeaders(config) });
  await throwOnError(response, 'supabase_blog_posts_list_failed');
  return response.json();
}

export async function getBlogPostBySlug(slug) {
  const config = getSupabaseConfig();
  const url = new URL(`${config.url}/rest/v1/blog_posts`);
  url.searchParams.set('select', '*');
  url.searchParams.set('slug', `eq.${slug}`);

  const response = await fetch(url, { headers: authHeaders(config) });
  await throwOnError(response, 'supabase_blog_post_get_failed');
  const rows = await response.json();
  return rows[0] || null;
}

export async function createBlogPost(fields) {
  const config = getSupabaseConfig();
  const url = `${config.url}/rest/v1/blog_posts`;

  const response = await fetch(url, {
    method: 'POST',
    headers: authHeaders(config, {
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    }),
    body: JSON.stringify({ slug: fields.slug, ...pickEditable(fields) }),
  });

  await throwOnError(response, 'supabase_blog_post_create_failed');
  const rows = await response.json();
  return rows[0];
}

export async function updateBlogPost(slug, fields) {
  const config = getSupabaseConfig();
  const patch = { ...pickEditable(fields), updated_at: new Date().toISOString() };

  const url = new URL(`${config.url}/rest/v1/blog_posts`);
  url.searchParams.set('slug', `eq.${slug}`);

  const response = await fetch(url, {
    method: 'PATCH',
    headers: authHeaders(config, {
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    }),
    body: JSON.stringify(patch),
  });

  await throwOnError(response, 'supabase_blog_post_update_failed');
  const rows = await response.json();

  if (!rows.length) {
    const error = new Error(`No blog post found with slug: ${slug}`);
    error.statusCode = 404;
    error.code = 'blog_post_not_found';
    throw error;
  }

  return rows[0];
}

function pickEditable(fields) {
  const patch = {};
  for (const key of EDITABLE_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(fields, key)) {
      patch[key] = fields[key];
    }
  }
  return patch;
}
