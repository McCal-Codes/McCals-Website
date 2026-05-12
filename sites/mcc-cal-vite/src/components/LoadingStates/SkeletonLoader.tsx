import styles from './SkeletonLoader.module.css';

interface SkeletonLoaderProps {
  type?: 'card' | 'text' | 'image' | 'list';
  count?: number;
}

const SkeletonLoader = ({ type = 'card', count = 1 }: SkeletonLoaderProps) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className={styles.skeletonCard}>
            <div className={styles.skeletonImage}></div>
            <div className={styles.skeletonContent}>
              <div className={styles.skeletonTitle}></div>
              <div className={styles.skeletonText}></div>
              <div className={styles.skeletonText}></div>
            </div>
          </div>
        );
      case 'text':
        return (
          <div className={styles.skeletonTextContainer}>
            <div className={styles.skeletonTitle}></div>
            <div className={styles.skeletonText}></div>
            <div className={styles.skeletonText}></div>
          </div>
        );
      case 'image':
        return <div className={styles.skeletonImage}></div>;
      case 'list':
        return (
          <div className={styles.skeletonList}>
            {[...Array(3)].map((_, i) => (
              <div key={i} className={styles.skeletonListItem}>
                <div className={styles.skeletonListIcon}></div>
                <div className={styles.skeletonListText}></div>
              </div>
            ))}
          </div>
        );
      default:
        return <div className={styles.skeletonDefault}></div>;
    }
  };

  return (
    <div className={styles.skeletonContainer}>
      {[...Array(count)].map((_, index) => (
        <div key={index}>{renderSkeleton()}</div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
