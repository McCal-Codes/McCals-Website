import { useState, useEffect } from 'react';

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

interface UseGoogleReviewsOptions {
  placeId?: string;
  apiKey?: string;
  maxResults?: number;
}

export function useGoogleReviews(options: UseGoogleReviewsOptions = {}) {
  const { maxResults = 8 } = options;
  const [reviews, setReviews] = useState<GoogleReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      setError(null);
      setUsingFallback(false);

      try {
        // Call our backend proxy (API key is kept secure on server)
        const response = await fetch('/api/google-reviews');

        if (!response.ok) {
          if (response.status === 503) {
            // Service not configured - use fallback data
            setReviews(staticGoogleReviews.slice(0, maxResults));
            setUsingFallback(true);
            setLoading(false);
            return;
          }
          throw new Error('Failed to fetch reviews');
        }

        const data = await response.json();
        const fetchedReviews = data.result?.reviews?.slice(0, maxResults) || [];
        
        if (fetchedReviews.length === 0) {
          // No reviews from API - use fallback
          setReviews(staticGoogleReviews.slice(0, maxResults));
          setUsingFallback(true);
        } else {
          setReviews(fetchedReviews);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        // Use fallback on error
        setReviews(staticGoogleReviews.slice(0, maxResults));
        setUsingFallback(true);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [maxResults]);

  return { reviews, loading, error, usingFallback };
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
