import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './BlogEmptyState.module.css';

interface BlogEmptyStateProps {
  type: 'no-posts' | 'no-search-results';
  searchTerm?: string;
  onClearSearch?: () => void;
}

const BlogEmptyState: React.FC<BlogEmptyStateProps> = ({ 
  type, 
  searchTerm, 
  onClearSearch 
}) => {
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm || '');

  // Debounce search input to improve performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm || '');
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  if (type === 'no-search-results') {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyStateIcon}>
          <svg 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </div>
        
        <h3 className={styles.emptyStateTitle}>No Search Results</h3>
        <p className={styles.emptyStateDescription}>
          No blog posts found for "{debouncedSearch}". Try different keywords or browse all posts.
        </p>
        
        <div className={styles.emptyStateActions}>
          {onClearSearch && (
            <button 
              onClick={onClearSearch}
              className={styles.emptyStateButton}
            >
              Clear Search
            </button>
          )}
          <Link to="/blog" className={styles.emptyStateButton}>
            Browse All Posts
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyStateIcon}>
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14,2 14,8 20,8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10,9 9,9 8,9" />
        </svg>
      </div>
      
      <h3 className={styles.emptyStateTitle}>No Blog Posts</h3>
      <p className={styles.emptyStateDescription}>
        No blog posts are available at the moment. Check back soon for photography insights, behind-the-scenes content, and industry updates.
      </p>
      
      <div className={styles.emptyStateActions}>
        <Link to="/journalism" className={styles.emptyStateButton}>
          View Journalism Portfolio
        </Link>
        <Link to="/concerts" className={styles.emptyStateButton}>
          View Concert Photography
        </Link>
      </div>
    </div>
  );
};

export default BlogEmptyState;
