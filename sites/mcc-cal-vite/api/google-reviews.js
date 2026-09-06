import { applyRateLimit } from './_lib/rate-limit-redis.js';
import { applyCors } from './_lib/cors.js';

const REVIEWS_RATE_LIMIT = {
  route: 'google-reviews',
  limit: 30,
  windowMs: 60 * 1000, // 1 minute
};

/**
 * Successful responses are cached at the edge. Google reviews change on the order of
 * weeks, and every origin miss is a billed Google Places API call, so serving most
 * traffic from cache cuts both latency and cost.
 *
 * Only the success path gets this. Errors, rate-limit rejections, and the
 * not-configured response keep `no-store` so a transient failure is not pinned at
 * the edge for an hour.
 *
 * `max-age=0` keeps browsers revalidating while `s-maxage` lets the CDN serve, so a
 * newly published review appears within the hour rather than being stuck in
 * someone's browser cache.
 */
const SUCCESS_CACHE_CONTROL = 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400';
const NO_CACHE = 'no-store, max-age=0';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', NO_CACHE);
  if (applyCors(req, res, { methods: 'GET, OPTIONS' })) {
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Apply rate limiting
  const rateLimit = await applyRateLimit(req, res, REVIEWS_RATE_LIMIT);
  if (!rateLimit.allowed) {
    res.status(429).json({ error: 'Too many requests. Please try again later.' });
    return;
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  if (!apiKey || !placeId) {
    console.error('[google-reviews] Missing GOOGLE_PLACES_API_KEY or GOOGLE_PLACE_ID');
    res.status(503).json({ error: 'Review service not configured.' });
    return;
  }

  try {
    // Use Google Places API (New) - Place Details
    const url = new URL('https://places.googleapis.com/v1/places/' + placeId);
    url.searchParams.append('fields', 'reviews,rating,userRatingCount,displayName');

    const response = await fetch(url.toString(), {
      headers: {
        'X-Goog-Api-Key': apiKey,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[google-reviews] API error:', response.status, errorText);
      throw new Error(`Places API returned ${response.status}`);
    }

    const data = await response.json();

    // Transform to the format expected by the frontend
    const reviews = (data.reviews || [])
      .filter(review => review.text && review.text.text) // Only include reviews with text
      .slice(0, 8) // Limit to 8 reviews
      .map(review => ({
        author_name: review.authorAttribution?.displayName || 'Anonymous',
        rating: review.rating || 5,
        text: review.text.text,
        time: review.publishTime ? new Date(review.publishTime).getTime() : Date.now(),
        profile_photo_url: review.authorAttribution?.photoUri || null,
      }));

    res.setHeader('Cache-Control', SUCCESS_CACHE_CONTROL);
    res.status(200).json({
      result: {
        reviews,
        rating: data.rating,
        user_ratings_total: data.userRatingCount,
        name: data.displayName?.text,
      },
    });
  } catch (err) {
    console.error('[google-reviews] Error:', err);
    res.status(500).json({ error: 'Failed to fetch reviews. Please try again.' });
  }
}
