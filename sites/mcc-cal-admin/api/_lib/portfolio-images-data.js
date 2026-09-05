const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const EDITABLE_FIELDS = ['caption', 'alt_text', 'tags', 'is_featured', 'sort_order'];

function supabaseConfigError() {
  const error = new Error('Supabase album access is not configured');
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

/**
 * PostgREST caps a single response at db-max-rows (1,000 on hosted Supabase)
 * and says nothing about it — the body simply ends. Any listing that counts or
 * groups rows client-side has to page, or it silently reports on a prefix of
 * the table. Pages until a short response proves the end was reached.
 */
const PAGE_SIZE = 1000;

/**
 * Bound on the paging loop. A server that ignored Range would return a full
 * page forever and spin this until the function's execution budget ran out, so
 * the loop gives up rather than hanging. 50 pages is 50,000 images, far beyond
 * any plausible portfolio.
 */
const MAX_PAGES = 50;

async function fetchAllRows(config, url, code) {
  const all = [];

  for (let page = 0; page < MAX_PAGES; page += 1) {
    const offset = page * PAGE_SIZE;
    const response = await fetch(url, {
      headers: authHeaders(config, { Range: `${offset}-${offset + PAGE_SIZE - 1}` }),
    });
    await throwOnError(response, code);

    const rows = await response.json();
    all.push(...rows);

    if (rows.length < PAGE_SIZE) return all;
  }

  const error = new Error(
    `Refusing to page past ${MAX_PAGES * PAGE_SIZE} rows; the server may be ignoring Range`,
  );
  error.statusCode = 500;
  error.code = code;
  throw error;
}

/**
 * Where a new upload should sit in a collection, and where its already-present
 * images currently sit.
 *
 * Returns the existing sort_order for every storage_path in the collection,
 * plus the next free slot after the highest. Without this an upload restarts
 * numbering at 0 and interleaves itself through everything uploaded before it.
 */
export async function getCollectionPlacement(portfolioType, collectionName) {
  const config = getSupabaseConfig();
  const url = new URL(`${config.url}/rest/v1/portfolio_images`);
  url.searchParams.set('select', 'storage_path,sort_order');
  url.searchParams.set('portfolio_type', `eq.${portfolioType}`);
  url.searchParams.set('collection_name', `eq.${collectionName}`);

  const rows = await fetchAllRows(config, url, 'supabase_collection_placement_failed');

  const existingSortOrder = new Map();
  let highest = -1;

  for (const row of rows) {
    const order = Number.isInteger(row.sort_order) ? row.sort_order : 0;
    existingSortOrder.set(row.storage_path, order);
    if (order > highest) highest = order;
  }

  return { existingSortOrder, nextSortOrder: highest + 1 };
}

export async function upsertPortfolioImages(rows) {
  const config = getSupabaseConfig();
  const url = `${config.url}/rest/v1/portfolio_images?on_conflict=storage_path`;

  const response = await fetch(url, {
    method: 'POST',
    headers: authHeaders(config, {
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=representation',
    }),
    body: JSON.stringify(rows),
  });

  await throwOnError(response, 'supabase_portfolio_images_upsert_failed');
  return response.json();
}

export async function listAlbums() {
  const config = getSupabaseConfig();
  const url = new URL(`${config.url}/rest/v1/portfolio_images`);
  url.searchParams.set('select', 'portfolio_type,collection_name');
  url.searchParams.set('order', 'portfolio_type.asc,collection_name.asc');

  // One row per image, counted client-side, so this must read the whole table:
  // unpaged it stops at 1,000 and whole albums disappear from the admin page.
  const rows = await fetchAllRows(config, url, 'supabase_albums_list_failed');

  const counts = new Map();
  for (const row of rows) {
    const key = `${row.portfolio_type}\u0000${row.collection_name}`;
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  return Array.from(counts.entries()).map(([key, count]) => {
    const [portfolioType, collectionName] = key.split('\u0000');
    return { portfolioType, collectionName, count };
  });
}

export async function listAlbumImages(portfolioType, collectionName) {
  const config = getSupabaseConfig();
  const url = new URL(`${config.url}/rest/v1/portfolio_images`);
  url.searchParams.set(
    'select',
    'id,portfolio_type,collection_name,storage_path,filename,alt_text,caption,tags,is_featured,sort_order,created_at',
  );
  url.searchParams.set('portfolio_type', `eq.${portfolioType}`);
  url.searchParams.set('collection_name', `eq.${collectionName}`);
  url.searchParams.set('order', 'sort_order.asc,filename.asc');

  return fetchAllRows(config, url, 'supabase_album_images_list_failed');
}

export async function updatePortfolioImage(id, fields) {
  const config = getSupabaseConfig();
  const patch = {};

  for (const key of EDITABLE_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(fields, key)) {
      patch[key] = fields[key];
    }
  }

  if (Object.keys(patch).length === 0) {
    const error = new Error('No editable fields provided');
    error.statusCode = 400;
    error.code = 'no_editable_fields';
    throw error;
  }

  const url = new URL(`${config.url}/rest/v1/portfolio_images`);
  url.searchParams.set('id', `eq.${id}`);

  const response = await fetch(url, {
    method: 'PATCH',
    headers: authHeaders(config, {
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    }),
    body: JSON.stringify(patch),
  });

  await throwOnError(response, 'supabase_portfolio_image_update_failed');
  const rows = await response.json();

  if (!rows.length) {
    const error = new Error(`No portfolio image found with ID: ${id}`);
    error.statusCode = 404;
    error.code = 'portfolio_image_not_found';
    throw error;
  }

  return rows[0];
}
