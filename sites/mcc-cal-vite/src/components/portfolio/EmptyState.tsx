import React from 'react';
import styles from './EmptyState.module.css';

interface EmptyStateProps {
  type: 'concerts' | 'journalism' | 'portfolio' | 'blog';
  title?: string;
  description?: string;
  action?: {
    text: string;
    href: string;
  };
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  type, 
  title, 
  description, 
  action 
}) => {
  const getDefaultContent = () => {
    switch (type) {
      case 'concerts':
        return {
          title: 'No Concerts Available',
          description: 'Check back soon for new concert photography coverage. We\'re always adding fresh live music content from Pittsburgh venues and touring acts.',
          action: {
            text: 'View Other Work',
            href: '/journalism'
          }
        };
      case 'journalism':
        return {
          title: 'No Journalism Available',
          description: 'No published journalism work is currently available. Check back for political events, sports coverage, and community stories from Pittsburgh and beyond.',
          action: {
            text: 'View Concert Photography',
            href: '/concerts'
          }
        };
      case 'portfolio':
        return {
          title: 'No Portfolio Items',
          description: 'This portfolio section is currently being updated. Explore our other collections for photography work.',
          action: {
            text: 'View All Projects',
            href: '/projects'
          }
        };
      case 'blog':
        return {
          title: 'No Blog Posts',
          description: 'No blog posts are available at the moment. Check back soon for photography insights, behind-the-scenes content, and industry updates.',
          action: {
            text: 'View Portfolio',
            href: '/journalism'
          }
        };
      default:
        return {
          title: 'No Content Available',
          description: 'This section is currently empty. Please check back later.',
          action: null
        };
    }
  };

  const content = getDefaultContent();
  const finalTitle = title || content.title;
  const finalDescription = description || content.description;
  const finalAction = action || content.action;

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
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      </div>
      
      <h3 className={styles.emptyStateTitle}>{finalTitle}</h3>
      <p className={styles.emptyStateDescription}>{finalDescription}</p>
      
      {finalAction && (
        <a 
          href={finalAction.href} 
          className={styles.emptyStateAction}
        >
          {finalAction.text}
        </a>
      )}
    </div>
  );
};

export default EmptyState;
