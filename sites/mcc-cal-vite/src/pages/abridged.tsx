import Layout from '@/components/Layout/Layout';
import { usePageMeta } from '@/hooks/usePageMeta';
import { usePageData } from '@/hooks/usePageData';
import styles from './abridged.module.css';
import { Camera, Image, Clock, Heart, ArrowRight, Filter } from 'lucide-react';
import { useState } from 'react';
import SkeletonLoader from '@/components/LoadingStates/SkeletonLoader';
import PageErrorBoundary from '@/components/ErrorBoundaries/PageErrorBoundary';
import { featuredWork, services } from '@/data/abridged-data';

const AbridgedPage = () => {
  const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://mcc-cal.com').replace(/\/$/, '');

  usePageMeta({
    title: 'Abridged Portfolio | McCal Media',
    description: 'A curated selection of my best photography work. Quick portfolio overview featuring concert photography, portraits, events, and documentary projects.',
    canonical: `${SITE_URL}/abridged`,
    robots: 'noindex, follow',
    og: {
      type: 'website',
      title: 'Abridged Portfolio | McCal Media',
      description: 'Curated selection of best photography work across concerts, portraits, and events.',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Abridged Portfolio | McCal Media',
      description: 'Quick portfolio overview of best photography work.',
    },
  });

  const [activeCategory, setActiveCategory] = useState('all');

  // Simulate data fetching with loading states
  const { data: portfolioData, loading, error } = usePageData(
    async () => {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      return featuredWork;
    },
    { simulateLoading: true, loadingDelay: 300 }
  );

  // Helper function to get icon component
  const getIcon = (iconName: string) => {
    const icons: Record<string, React.ReactNode> = {
      Image: <Image className={styles.categoryIcon} />,
      Camera: <Camera className={styles.categoryIcon} />,
      Heart: <Heart className={styles.categoryIcon} />,
      Clock: <Clock className={styles.categoryIcon} />,
    };
    return icons[iconName] || <Image className={styles.categoryIcon} />;
  };

  const categories = [
    { id: 'all', label: 'All Work', icon: getIcon('Image') },
    { id: 'concerts', label: 'Concerts', icon: getIcon('Camera') },
    { id: 'portraits', label: 'Portraits', icon: getIcon('Heart') },
    { id: 'events', label: 'Events', icon: getIcon('Clock') },
  ];

  const filteredWork = portfolioData?.filter(
    work => activeCategory === 'all' || work.category === activeCategory
  ) || [];

  return (
    <PageErrorBoundary pageName="Abridged Portfolio">
      <Layout>
        <div className={styles.container}>
          <section className={styles.hero}>
            <div className={styles.heroContent}>
              <h1 className={styles.title}>Abridged Portfolio</h1>
              <p className={styles.subtitle}>
                A curated selection of my best work across concerts, portraits, and events. 
                Quick overview of my photography style and capabilities.
              </p>
              <button className={styles.viewFullButton}>
                View Full Portfolio <ArrowRight className={styles.arrowIcon} />
              </button>
            </div>
          </section>

          <section className={styles.categories}>
            <div className={styles.categoryHeader}>
              <Filter className={styles.filterIcon} />
              <h2>Filter by Category</h2>
            </div>
            <div className={styles.categoryGrid}>
              {categories.map((category) => (
                <button
                  key={category.id}
                  className={`${styles.categoryButton} ${
                    activeCategory === category.id ? styles.active : ''
                  }`}
                  onClick={() => setActiveCategory(category.id)}
                >
                  {category.icon}
                  <span>{category.label}</span>
                </button>
              ))}
            </div>
          </section>

          <section className={styles.gallery}>
            <div className={styles.galleryHeader}>
              <h2>Featured Work</h2>
              <p>
                {activeCategory === 'all' 
                  ? 'All categories' 
                  : categories.find(c => c.id === activeCategory)?.label
                } • {loading ? 'Loading...' : `${filteredWork.length} projects`}
              </p>
            </div>
            <div className={styles.galleryGrid}>
              {loading ? (
                <SkeletonLoader type="card" count={6} />
              ) : error ? (
                <div className={styles.errorState}>
                  <p>Error loading portfolio: {error}</p>
                  <button onClick={() => window.location.reload()} className={styles.retryButton}>
                    Retry
                  </button>
                </div>
              ) : (
                filteredWork.map((work) => (
                  <div key={work.id} className={styles.galleryItem}>
                    <div className={styles.imageContainer}>
                      <div className={styles.imagePlaceholder}>
                        <Image className={styles.placeholderIcon} />
                      </div>
                      <div className={styles.imageOverlay}>
                        <button className={styles.viewButton}>View Project</button>
                      </div>
                    </div>
                    <div className={styles.projectInfo}>
                      <h3>{work.title}</h3>
                      <p>{work.description}</p>
                      <div className={styles.tags}>
                        {work.tags.map((tag, index) => (
                          <span key={index} className={styles.tag}>{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className={styles.services}>
            <div className={styles.sectionHeader}>
              <h2>Services & Specialties</h2>
              <p>Professional photography services tailored to your needs</p>
            </div>
            <div className={styles.servicesGrid}>
              {services.map((service, index) => (
                <div key={index} className={styles.serviceCard}>
                  {getIcon(service.icon)}
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.cta}>
            <div className={styles.ctaContent}>
              <h2>Ready to Work Together?</h2>
              <p>Let's discuss your photography needs and create something amazing together.</p>
              <div className={styles.ctaButtons}>
                <button className={styles.primaryButton}>Get Quote</button>
                <button className={styles.secondaryButton}>Contact Me</button>
              </div>
            </div>
          </section>
        </div>
      </Layout>
    </PageErrorBoundary>
  );
};

export default AbridgedPage;
