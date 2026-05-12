import React from 'react';
import styles from './PortfolioSkeleton.module.css';

interface PortfolioSkeletonProps {
  count?: number;
  showFilters?: boolean;
}

const PortfolioSkeleton: React.FC<PortfolioSkeletonProps> = ({ 
  count = 6, 
  showFilters = true 
}) => {
  return (
    <div className={styles.portfolioSkeleton}>
      {showFilters && (
        <div className={styles.filtersSkeleton}>
          <div className={styles.filterButton} />
          <div className={styles.filterButton} />
          <div className={styles.filterButton} />
          <div className={styles.filterButton} />
          <div className={styles.filterButton} />
        </div>
      )}
      
      <div className={styles.gridSkeleton}>
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className={styles.cardSkeleton}>
            <div className={styles.imageSkeleton} />
            <div className={styles.contentSkeleton}>
              <div className={styles.titleSkeleton} />
              <div className={styles.metaSkeleton} />
              <div className={styles.metaSkeleton} style={{ width: '60%' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PortfolioSkeleton;
