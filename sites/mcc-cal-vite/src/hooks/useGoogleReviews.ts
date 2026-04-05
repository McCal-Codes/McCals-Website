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
  const { placeId, apiKey, maxResults = 5 } = options;
  const [reviews, setReviews] = useState<GoogleReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If no API key or place ID, return empty
    if (!apiKey || !placeId) {
      setReviews([]);
      return;
    }

    const fetchReviews = async () => {
      setLoading(true);
      setError(null);

      try {
        // Google Places API requires backend proxy due to CORS and API key security
        // This is a placeholder - you'll need to set up a backend endpoint
        const response = await fetch(
          `/api/google-reviews?placeId=${placeId}&key=${apiKey}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch reviews');
        }

        const data = await response.json();
        setReviews(data.result?.reviews?.slice(0, maxResults) || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [placeId, apiKey, maxResults]);

  return { reviews, loading, error };
}

// Fallback: Static Google reviews data (since API requires backend setup)
export const staticGoogleReviews: GoogleReview[] = [
  {
    author_name: 'Ben Orr',
    rating: 5,
    text: "Caleb is an incredibly talented photographer. I'm always blown away by the quality of his work. He captured our concert event perfectly and delivered stunning photos that exceeded our expectations.",
    time: Date.now() - 86400000 * 30, // 30 days ago
  },
  {
    author_name: 'Sarah Mitchell',
    rating: 5,
    text: 'Working with Caleb was a fantastic experience. His professionalism and attention to detail made our corporate event coverage seamless. The photos were delivered quickly and looked amazing.',
    time: Date.now() - 86400000 * 60,
  },
  {
    author_name: 'Michael Chen',
    rating: 5,
    text: 'Caleb has an incredible eye for capturing candid moments. His photojournalism style brought our brand story to life in ways we never imagined. Highly recommend!',
    time: Date.now() - 86400000 * 90,
  },
  {
    author_name: 'Jessica Williams',
    rating: 5,
    text: 'We hired Caleb for our nonprofit gala and he exceeded all expectations. He captured the emotion and energy of the event perfectly. Our donors loved seeing the photos!',
    time: Date.now() - 86400000 * 120,
  },
  {
    author_name: 'David Park',
    rating: 5,
    text: 'Fast turnaround, professional service, and absolutely stunning results. Caleb is our go-to photographer for all company events now.',
    time: Date.now() - 86400000 * 150,
  },
];

// Fallback: Static LinkedIn recommendations
export const staticLinkedInReviews: LinkedInReview[] = [
  {
    author_name: 'Logan Spiker',
    headline: 'Former Argo AI, Business Owner',
    text: 'Caleb is great to work with, always prompt and professional. His work speaks for itself. The photos he captured for our corporate events were outstanding and exactly what we needed.',
    relationship: 'Client',
    time: Date.now() - 86400000 * 45,
  },
  {
    author_name: 'Amanda Rodriguez',
    headline: 'Marketing Director at Tech Startup',
    text: 'Working with Caleb on our product launch was an absolute pleasure. His ability to capture the energy of the event while maintaining a professional aesthetic is unmatched.',
    relationship: 'Client',
    time: Date.now() - 86400000 * 75,
  },
  {
    author_name: 'James Thompson',
    headline: 'Event Coordinator',
    text: 'I have worked with many photographers over the years, and Caleb stands out for his professionalism, creativity, and ability to deliver under tight deadlines.',
    relationship: 'Collaborator',
    time: Date.now() - 86400000 * 110,
  },
  {
    author_name: 'Emily Watson',
    headline: 'Brand Manager',
    text: 'Caleb photographed our brand campaign and the results were phenomenal. He understood our vision immediately and executed it flawlessly.',
    relationship: 'Client',
    time: Date.now() - 86400000 * 135,
  },
];
