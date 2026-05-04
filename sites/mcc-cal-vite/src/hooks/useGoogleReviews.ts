import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface GoogleReview {
  author_name: string;
  rating: number;
  text: string;
  time: number;
  profile_photo_url?: string;
}

export interface LinkedInReview {
  author_name: string;
  headline: string;
  text: string;
  relationship: string;
  time: number;
}

export interface Testimonial {
  id: string;
  author: string;
  role: string | null;
  rating: number | null;
  text: string;
  source: 'google' | 'linkedin' | 'direct';
  featured: boolean;
  date: string;
}

// Database row type for Supabase testimonials table
interface TestimonialRow {
  id: string;
  author_name: string;
  author_title: string | null;
  rating: number | null;
  content: string;
  source: 'google' | 'linkedin' | 'direct';
  is_featured: boolean;
  created_at: string;
}

interface UseGoogleReviewsOptions {
  placeId?: string;
  apiKey?: string;
  maxResults?: number;
  featuredOnly?: boolean;
}

export function useGoogleReviews(options: UseGoogleReviewsOptions = {}) {
  const { maxResults = 8, featuredOnly = false } = options;
  const [reviews, setReviews] = useState<GoogleReview[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const [source, setSource] = useState<'supabase' | 'google-api' | 'fallback'>('fallback');

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      setError(null);
      setUsingFallback(false);

      try {
        // Try Supabase first if configured
        if (isSupabaseConfigured()) {
          let query = supabase
            .from('testimonials')
            .select('*')
            .eq('is_approved', true)
            .order('is_featured', { ascending: false })
            .order('created_at', { ascending: false })
            .limit(maxResults);

          if (featuredOnly) {
            query = query.eq('is_featured', true);
          }

          const { data: dbTestimonials, error: dbError } = await query;

          if (!dbError && dbTestimonials && dbTestimonials.length > 0) {
            const formatted: Testimonial[] = (dbTestimonials as TestimonialRow[]).map((t: TestimonialRow) => ({
              id: t.id,
              author: t.author_name,
              role: t.author_title,
              rating: t.rating,
              text: t.content,
              source: t.source,
              featured: t.is_featured,
              date: t.created_at,
            }));

            setTestimonials(formatted);
            setSource('supabase');
            setLoading(false);
            return;
          }
        }

        // Fallback to API testimonials endpoint
        const response = await fetch(`/api/testimonials?limit=${maxResults}${featuredOnly ? '&featured=true' : ''}`);

        if (response.ok) {
          const data = await response.json();
          if (data.testimonials?.length > 0) {
            setTestimonials(data.testimonials);
            setSource('google-api');
            setLoading(false);
            return;
          }
        }

        // Final fallback: static data
        setReviews(staticGoogleReviews.slice(0, maxResults));
        setUsingFallback(true);
        setSource('fallback');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        // Use fallback on error
        setReviews(staticGoogleReviews.slice(0, maxResults));
        setUsingFallback(true);
        setSource('fallback');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [maxResults, featuredOnly]);

  return { 
    reviews, 
    testimonials,
    loading, 
    error, 
    usingFallback,
    source,
    hasData: testimonials.length > 0 || reviews.length > 0,
  };
}

// Fallback: Static Google reviews data (real testimonials from clients)
export const staticGoogleReviews: GoogleReview[] = [
  {
    author_name: 'Kelly Gibson',
    rating: 5,
    text: 'Caleb is highly professional and fun to work with. His pricing is reasonable, and the photos turned out beautiful. Strongly recommended for events, parties, professional shoots, or family photos.',
    time: Date.now() - 86400000 * 15,
  },
  {
    author_name: 'Marc Palombo',
    rating: 5,
    text: 'Caleb brings out the best in people and understands both the technical and human side of photography. He\'s an excellent collaborator and someone I would gladly work with again.',
    time: Date.now() - 86400000 * 30,
  },
  {
    author_name: "LaNae' Ferguson",
    rating: 5,
    text: 'Kind, personable, and relatable. The shoot feels natural, like working with a friend. His editing skills are outstanding, and I always look forward to working with him.',
    time: Date.now() - 86400000 * 45,
  },
  {
    author_name: 'Ben Orr',
    rating: 5,
    text: 'An incredibly talented photographer. His concert photography consistently impresses both us and our audience.',
    time: Date.now() - 86400000 * 60,
  },
  {
    author_name: 'Kayla Jackson',
    rating: 5,
    text: 'Caleb is genuine, positive, and creates an upbeat, comfortable shoot environment. He gives great posing direction, especially for beginners.',
    time: Date.now() - 86400000 * 75,
  },
  {
    author_name: 'Devan Sanders',
    rating: 5,
    text: 'Very easy to work with, especially for a first-time model. The final edits were beautiful, and the experience felt supportive and confidence-boosting.',
    time: Date.now() - 86400000 * 90,
  },
];

// Fallback: Static LinkedIn recommendations (real testimonials from clients)
export const staticLinkedInReviews: LinkedInReview[] = [
  {
    author_name: 'Frank Rocks',
    headline: 'Creative Director & Brand Strategist',
    text: 'Caleb has covered a few events for me and even captured BTS on a film set. He\'s got an eye for capturing beyond the general "what\'s happening" with his real focus on people and how they truly feel in that moment. His ability to frame these emotions is what makes him a standout.',
    relationship: 'Worked together on same team',
    time: Date.now() - 86400000 * 20,
  },
  {
    author_name: 'Logan Spiker',
    headline: 'Former Argo AI, Business Owner',
    text: 'Caleb is great to work with, always prompt and professional. His work speaks for itself. The photos he captured for our corporate events were outstanding and exactly what we needed.',
    relationship: 'Client',
    time: Date.now() - 86400000 * 45,
  },
];
