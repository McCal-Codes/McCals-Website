/**
 * Testimonials API
 * Returns approved testimonials from Supabase (combined with Google Reviews)
 */
import { applyCors } from './_lib/cors.js';
import { getServiceClient, isSupabaseConfigured } from './_lib/supabase-server.js';

/**
 * Real testimonial data is cached at the edge; approvals land on the order of days,
 * so an hour of CDN cache is generous and keeps origin invocations near zero.
 *
 * `max-age=0` keeps browsers revalidating so a newly approved testimonial is not
 * stranded in someone's browser cache, while `s-maxage` does the actual serving.
 *
 * The empty-array fallbacks returned when Supabase is unavailable get a short TTL
 * instead: they are a degraded response, and caching "no testimonials" for an hour
 * would outlast the outage that caused it.
 */
const SUCCESS_CACHE_CONTROL = 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400';
const DEGRADED_CACHE_CONTROL = 'public, max-age=0, s-maxage=60';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', DEGRADED_CACHE_CONTROL);
  if (applyCors(req, res, { methods: 'GET, OPTIONS' })) {
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { featured, limit = '10' } = req.query;
  const maxLimit = Math.min(parseInt(limit, 10) || 10, 50);

  try {
    // Fetch from Supabase if configured
    if (isSupabaseConfigured()) {
      const supabase = getServiceClient();
      
      let query = supabase
        .from('testimonials')
        .select('*')
        .eq('is_approved', true)
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(maxLimit);
      
      if (featured === 'true') {
        query = query.eq('is_featured', true);
      }
      
      const { data: testimonials, error } = await query;
      
      if (error) {
        console.warn('[testimonials] Database unavailable, using client fallback:', error.message);
        res.status(200).json({ testimonials: [], source: 'supabase-error' });
        return;
      }
      
      // Transform to consistent format
      const formatted = testimonials?.map(t => ({
        id: t.id,
        author: t.author_name,
        role: t.author_title,
        rating: t.rating,
        text: t.content,
        source: t.source,
        featured: t.is_featured,
        date: t.created_at,
      })) || [];
      
      res.setHeader('Cache-Control', SUCCESS_CACHE_CONTROL);
      res.status(200).json({ testimonials: formatted, source: 'supabase' });
      return;
    }
    
    // Fallback: return empty array if Supabase not configured
    res.status(200).json({ testimonials: [], source: 'none' });
  } catch (err) {
    console.error('[testimonials] Error:', err);
    res.status(500).json({ error: 'Failed to load testimonials' });
  }
}
