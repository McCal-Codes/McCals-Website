import Layout from '@/components/Layout/Layout';
import { usePageMeta } from '@/hooks/usePageMeta';
import styles from './video.module.css';
import { Camera, Video, Film, Settings, CheckCircle, Play } from 'lucide-react';
import { videoServices, videoEquipment, videoProcess } from '@/data/video-services';

const VideoPage = () => {
  const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://mccalmedia.com').replace(/\/$/, '');

  usePageMeta({
    title: 'Video Production Services | McCal Media',
    description: 'Professional video production services including event coverage, interviews, documentaries, and promotional content. High-quality videography for businesses and individuals.',
    canonical: `${SITE_URL}/video`,
    robots: 'index, follow',
    og: {
      type: 'website',
      title: 'Video Production Services | McCal Media',
      description: 'Professional video production services including event coverage, interviews, and promotional content.',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Video Production Services | McCal Media',
      description: 'Professional video production services for businesses and individuals.',
    },
  });

  // Helper function to get icon component
  const getIcon = (iconName: string) => {
    const icons: Record<string, React.ReactNode> = {
      Camera: <Camera className={styles.icon} />,
      Video: <Video className={styles.icon} />,
      Film: <Film className={styles.icon} />,
      Settings: <Settings className={styles.icon} />,
    };
    return icons[iconName] || <Camera className={styles.icon} />;
  };

  return (
    <Layout>
      <div className={styles.container}>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.title}>Video Production Services</h1>
            <p className={styles.subtitle}>
              Professional videography that brings your stories to life with cinematic quality and attention to detail.
            </p>
            <div className={styles.ctaButtons}>
              <button className={styles.primaryButton}>Get Quote</button>
              <button className={styles.secondaryButton}>View Portfolio</button>
            </div>
          </div>
        </section>

        <section className={styles.services}>
          <div className={styles.sectionHeader}>
            <h2>Our Services</h2>
            <p>Comprehensive video production services tailored to your needs</p>
          </div>
          <div className={styles.servicesGrid}>
            {videoServices.map((service, index) => (
              <div key={index} className={styles.serviceCard}>
                <div className={styles.iconWrapper}>{getIcon(service.icon)}</div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.equipment}>
          <div className={styles.sectionHeader}>
            <h2>Professional Equipment</h2>
            <p>Industry-standard gear for exceptional quality</p>
          </div>
          <div className={styles.equipmentGrid}>
            {videoEquipment.map((item, index) => (
              <div key={index} className={styles.equipmentItem}>
                <CheckCircle className={styles.checkIcon} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.process}>
          <div className={styles.sectionHeader}>
            <h2>Our Process</h2>
            <p>From concept to delivery, we ensure quality at every step</p>
          </div>
          <div className={styles.processTimeline}>
            {videoProcess.map((item, index) => (
              <div key={index} className={styles.processItem}>
                <div className={styles.stepNumber}>{item.step}</div>
                <div className={styles.stepContent}>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.portfolioPreview}>
          <div className={styles.sectionHeader}>
            <h2>Recent Work</h2>
            <p>See our video production in action</p>
          </div>
          <div className={styles.portfolioGrid}>
            <div className={styles.portfolioPlaceholder}>
              <Play className={styles.playIcon} />
              <span>Event Coverage Demo</span>
            </div>
            <div className={styles.portfolioPlaceholder}>
              <Play className={styles.playIcon} />
              <span>Interview Sample</span>
            </div>
            <div className={styles.portfolioPlaceholder}>
              <Play className={styles.playIcon} />
              <span>Documentary Preview</span>
            </div>
          </div>
        </section>

        <section className={styles.cta}>
          <div className={styles.ctaContent}>
            <h2>Ready to Tell Your Story?</h2>
            <p>Let's create compelling video content that captures your vision and engages your audience.</p>
            <button className={styles.primaryButton}>Start Your Project</button>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default VideoPage;
