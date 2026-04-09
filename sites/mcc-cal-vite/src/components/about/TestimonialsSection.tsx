import { Link } from 'react-router-dom';
import { useGoogleReviews, staticLinkedInReviews, type GoogleReview, type LinkedInReview } from '@/hooks/useGoogleReviews';
import { useState, useEffect, useCallback, memo, useMemo } from 'react';
import styles from './about-sections.module.css';

interface TestimonialsSectionProps {
  className?: string;
}

const sourceIcons: Record<string, string> = {
  Google: '/icons/google.svg',
  LinkedIn: '/icons/linkedin.svg',
};

const sourceLabels: Record<string, string> = {
  Google: 'Google Review',
  LinkedIn: 'LinkedIn Recommendation',
};

// Unified testimonial type
interface UnifiedTestimonial {
  source: 'Google' | 'LinkedIn';
  quote: string;
  name: string;
  role: string;
  rating?: string;
}

// Convert Google review to unified format
function formatGoogleReview(review: GoogleReview): UnifiedTestimonial {
  // Customize role based on reviewer
  const customRoles: Record<string, string> = {
    'Ben Orr': 'Musician',
  };
  
  return {
    source: 'Google',
    quote: review.text,
    name: review.author_name,
    role: customRoles[review.author_name] || 'Verified Client',
    rating: review.rating.toString(),
  };
}

// Convert LinkedIn review to unified format
function formatLinkedInReview(review: LinkedInReview): UnifiedTestimonial {
  return {
    source: 'LinkedIn',
    quote: review.text,
    name: review.author_name,
    role: review.headline,
    rating: '5',
  };
}

// Memoized TestimonialCard to prevent unnecessary re-renders
const TestimonialCard = memo(function TestimonialCard({ 
  testimonial, 
  isActive 
}: { 
  testimonial: UnifiedTestimonial; 
  isActive?: boolean;
}) {
  return (
    <blockquote
      className={`${styles.testimonialCard} ${isActive ? styles.active : ''}`}
    >
      <div className={styles.testimonialHeader}>
        <div className={styles.testimonialAvatar}>
          <span className={styles.avatarInitials}>
            {testimonial.name.split(' ').map(n => n[0]).join('')}
          </span>
        </div>
        <div className={styles.testimonialMeta}>
          <strong className={styles.testimonialName}>{testimonial.name}</strong>
          <span className={styles.testimonialRole}>{testimonial.role}</span>
        </div>
        <div className={styles.testimonialSource} title={sourceLabels[testimonial.source]}>
          <img 
            src={sourceIcons[testimonial.source]} 
            alt={testimonial.source}
            className={styles.sourceIcon}
          />
        </div>
      </div>

      {testimonial.rating && testimonial.source === 'Google' && (
        <div className={styles.testimonialStars}>
          {'★'.repeat(parseInt(testimonial.rating))}
        </div>
      )}

      <p className={styles.testimonialQuote}>&ldquo;{testimonial.quote}&rdquo;</p>

      <div className={styles.testimonialFooter}>
        <span className={styles.sourceBadge}>{sourceLabels[testimonial.source]}</span>
      </div>
    </blockquote>
  );
});

const AUTO_ADVANCE_INTERVAL = 6000; // 6 seconds

export function TestimonialsSection({ className = '' }: TestimonialsSectionProps) {
  // Fetch live Google reviews (with fallback to static data)
  const { reviews: googleReviewsData, usingFallback } = useGoogleReviews({ maxResults: 5 });
  
  // Combine Google and LinkedIn reviews - memoized to prevent re-calculation
  const googleReviews = useMemo(() => 
    googleReviewsData.map(formatGoogleReview), 
    [googleReviewsData]
  );
  const linkedInReviews = useMemo(() => staticLinkedInReviews.map(formatLinkedInReview), []);
  const allTestimonials = useMemo(() => [...googleReviews, ...linkedInReviews], [googleReviews, linkedInReviews]);
  
  // Shuffle for variety - deterministic based on date to avoid hydration mismatch
  const shuffledTestimonials = useMemo(() => {
    // Use a deterministic seed based on day of month to avoid hydration mismatch
    // while still giving variety across days
    const seed = new Date().getDate();
    return [...allTestimonials].sort((a, b) => {
      const hashA = a.name.charCodeAt(0) + seed;
      const hashB = b.name.charCodeAt(0) + seed;
      return hashA - hashB;
    });
  }, [allTestimonials]);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768;
  });
  const [isExpanded, setIsExpanded] = useState(false);

  // Handle resize for mobile detection with passive listener
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const totalSlides = isMobile ? shuffledTestimonials.length : Math.ceil(shuffledTestimonials.length / 2);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  // Keyboard navigation for carousel
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (isMobile) return;
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        prevSlide();
        break;
      case 'ArrowRight':
        e.preventDefault();
        nextSlide();
        break;
      case 'Home':
        e.preventDefault();
        goToSlide(0);
        break;
      case 'End':
        e.preventDefault();
        goToSlide(totalSlides - 1);
        break;
    }
  }, [isMobile, prevSlide, nextSlide, goToSlide, totalSlides]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Auto-advance (only on desktop and when tab is visible)
  useEffect(() => {
    if (isPaused || isMobile) return;

    // Pause when tab is not visible to save resources
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsPaused(true);
      } else {
        setIsPaused(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    const timer = setInterval(nextSlide, AUTO_ADVANCE_INTERVAL);

    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isPaused, isMobile, nextSlide]);

  // Show limited testimonials on mobile when collapsed
  const visibleTestimonials = isMobile && !isExpanded 
    ? shuffledTestimonials.slice(0, 3) 
    : shuffledTestimonials;

  return (
    <section 
      className={`${styles.testimonials} ${className}`} 
      aria-labelledby="testimonials-heading"
      onMouseEnter={() => !isMobile && setIsPaused(true)}
      onMouseLeave={() => !isMobile && setIsPaused(false)}
    >
      <div className={styles.testimonialsHeader}>
        <p className={styles.eyebrow}>Client testimonials</p>
        <h2 id="testimonials-heading">What clients say about working with me</h2>
        <p className={styles.testimonialsSubtitle}>
          Real reviews from Google Business Profile & LinkedIn
          {!usingFallback && (
            <span className={styles.liveBadge} aria-label="Live reviews from Google"> ● Live</span>
          )}
        </p>
      </div>

      {/* Screen reader announcements for slide changes */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {`Showing testimonial ${currentIndex + 1} of ${totalSlides}`}
      </div>

      {/* Mobile: Expandable stacked layout */}
      {isMobile ? (
        <>
          <div className={`${styles.testimonialsStack} ${isExpanded ? styles.expanded : ''}`}>
            {visibleTestimonials.map((item, index) => (
              <TestimonialCard key={`${item.name}-${index}`} testimonial={item} />
            ))}
          </div>
          {shuffledTestimonials.length > 3 && (
            <button 
              className={styles.expandButton}
              onClick={() => setIsExpanded(!isExpanded)}
              aria-expanded={isExpanded}
            >
              {isExpanded ? 'Show less' : `Show all ${shuffledTestimonials.length} testimonials`}
              <svg 
                className={`${styles.expandIcon} ${isExpanded ? styles.expanded : ''}`} 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <path d={isExpanded ? "M18 15l-6-6-6 6" : "M6 9l6 6 6-6"} />
              </svg>
            </button>
          )}
        </>
      ) : (
        /* Desktop: Carousel */
        <div
          className={styles.testimonialsCarousel}
          role="region"
          aria-roledescription="carousel"
          aria-label="Client testimonials"
          tabIndex={0}
        >
          <div 
            className={styles.testimonialsTrack}
            style={{ transform: `translateX(-${currentIndex * 50}%)` }}
          >
            {shuffledTestimonials.map((item, index) => (
              <div key={`${item.name}-${index}`} className={styles.testimonialSlide}>
                <TestimonialCard testimonial={item} isActive={index === currentIndex} />
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          <button 
            className={`${styles.carouselArrow} ${styles.carouselArrowPrev}`}
            onClick={prevSlide}
            aria-label="Previous testimonial"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button 
            className={`${styles.carouselArrow} ${styles.carouselArrowNext}`}
            onClick={nextSlide}
            aria-label="Next testimonial"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>

          {/* Dots Navigation */}
          <div className={styles.carouselDots}>
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                className={`${styles.carouselDot} ${index === currentIndex ? styles.activeDot : ''}`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to testimonial ${index + 1}`}
                aria-current={index === currentIndex ? 'true' : undefined}
              />
            ))}
          </div>
        </div>
      )}

      {/* Trust Badges - Third Party Validation */}
      <div className={styles.trustBadges}>
        <div className={styles.trustBadge}>
          <img
            src="/icons/google.svg"
            alt="Google"
            className={styles.trustBadgeIcon}
            loading="lazy"
          />
          <span className={styles.trustBadgeText}>
            <strong>5.0</strong> ★★★★★
            <span className={styles.trustBadgeSubtext}>Google Reviews</span>
          </span>
        </div>
        <div className={styles.trustBadge}>
          <img
            src="/icons/linkedin.svg"
            alt="LinkedIn"
            className={styles.trustBadgeIcon}
            loading="lazy"
          />
          <span className={styles.trustBadgeText}>
            <strong>LinkedIn</strong>
            <span className={styles.trustBadgeSubtext}>Recommendations</span>
          </span>
        </div>
      </div>

      <div className={styles.testimonialsFooter}>
        <a
          href="https://maps.app.goo.gl/CKztLDxynn6mwSwS8"
          target="_blank"
          rel="noopener noreferrer"
          className={`${styles.actionButton} ${styles.actionSecondary}`}
        >
          View all Google reviews
        </a>
        <Link to="/contact-us" className={`${styles.actionButton} ${styles.actionPrimary}`}>
          Work with me
        </Link>
      </div>
    </section>
  );
}
