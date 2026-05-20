/**
 * Testimonials API
 * Returns approved testimonials from Supabase (combined with Google Reviews)
 */
import { applyCors } from './_lib/cors.js';
import { getServiceClient, isSupabaseConfigured } from './_lib/supabase-server.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'public, max-age=300'); // Cache for 5 minutes
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
