import { useState, useEffect } from 'react';

export function useReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      // Guard against SSR and ensure elements exist
      if (typeof window === 'undefined') return;
      
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      
      // Guard against division by zero
      if (scrollHeight <= 0) {
        setProgress(0);
        return;
      }
      
      const scrollProgress = (scrollTop / scrollHeight) * 100;
      setProgress(Math.min(Math.max(scrollProgress, 0), 100));
    };

    // Use passive event listener for better performance
    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress(); // Initial call

    return () => {
      window.removeEventListener('scroll', updateProgress);
    };
  }, []);

  return progress;
}
