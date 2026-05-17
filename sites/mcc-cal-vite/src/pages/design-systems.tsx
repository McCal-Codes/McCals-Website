import Layout from '@/components/Layout/Layout';
import { usePageMeta } from '@/hooks/usePageMeta';
import styles from './design-systems.module.css';
import { Palette, Layers, Zap, Code, Smartphone, Monitor, CheckCircle, ArrowRight } from 'lucide-react';

const DesignSystemsPage = () => {
  const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://mcc-cal.com').replace(/\/$/, '');

  usePageMeta({
    title: 'Design Systems & UI Components | McCal Media',
    description: 'Custom design systems, component libraries, and UI/UX solutions for consistent digital experiences. Scalable design patterns for modern web applications.',
    canonical: `${SITE_URL}/design-systems`,
    robots: 'index, follow',
    og: {
      type: 'website',
      title: 'Design Systems & UI Components | McCal Media',
      description: 'Custom design systems and component libraries for consistent digital experiences.',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Design Systems & UI Components | McCal Media',
      description: 'Scalable design patterns and component libraries for modern web applications.',
    },
  });

  const services = [
    {
      icon: <Palette className={styles.icon} />,
      title: 'Design System Architecture',
      description: 'Comprehensive design systems with color palettes, typography, spacing, and component guidelines.',
      features: ['Color Systems', 'Typography Scales', 'Spacing Grids', 'Design Tokens'],
    },
    {
      icon: <Layers className={styles.icon} />,
      title: 'Component Libraries',
      description: 'Reusable, accessible React components built with modern best practices and comprehensive documentation.',
      features: ['React Components', 'Storybook Integration', 'Accessibility', 'TypeScript Support'],
    },
    {
      icon: <Zap className={styles.icon} />,
      title: 'Design Tokens',
      description: 'Centralized design tokens that ensure consistency across platforms and development teams.',
      features: ['CSS Variables', 'Theme Switching', 'Brand Consistency', 'Developer Experience'],
    },
    {
      icon: <Code className={styles.icon} />,
      title: 'Pattern Libraries',
      description: 'Documented UI patterns and interaction guidelines that accelerate development and ensure consistency.',
      features: ['Pattern Documentation', 'Usage Guidelines', 'Code Examples', 'Best Practices'],
    },
  ];

  const technologies = [
    'React & TypeScript',
    'Styled Components & CSS-in-JS',
    'Tailwind CSS',
    'Storybook',
    'Figma Integration',
    'Design Tokens Manager',
    'Component Testing',
    'Accessibility Standards',
  ];

  const process = [
    {
      step: '01',
      title: 'Discovery & Audit',
      description: 'Analyze existing design patterns, user needs, and technical requirements to define the design system scope.',
    },
    {
      step: '02',
      title: 'System Architecture',
      description: 'Design the foundational elements including colors, typography, spacing, and component hierarchy.',
    },
    {
      step: '03',
      title: 'Component Development',
      description: 'Build reusable components with comprehensive documentation, testing, and accessibility features.',
    },
    {
      step: '04',
      title: 'Integration & Training',
      description: 'Integrate the design system into your workflow and train your team on usage and best practices.',
    },
  ];

  const caseStudies = [
    {
      title: 'E-commerce Platform',
      description: 'Complete design system for a multi-brand e-commerce platform with theme switching capability.',
      result: '40% faster development, 100% design consistency',
    },
    {
      title: 'SaaS Dashboard',
      description: 'Component library and design tokens for a complex analytics dashboard with data visualization.',
      result: '60% reduction in UI bugs, improved developer experience',
    },
    {
      title: 'Mobile App Design System',
      description: 'Cross-platform design system supporting iOS, Android, and web applications.',
      result: 'Unified brand experience across all platforms',
    },
  ];

  return (
    <Layout>
      <div className={styles.container}>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.title}>Design Systems & UI Components</h1>
            <p className={styles.subtitle}>
              Scalable design systems and component libraries that ensure consistency, accelerate development, and elevate user experiences.
            </p>
            <div className={styles.ctaButtons}>
              <button className={styles.primaryButton}>Start Your Project</button>
              <button className={styles.secondaryButton}>View Case Studies</button>
            </div>
          </div>
        </section>

        <section className={styles.services}>
          <div className={styles.sectionHeader}>
            <h2>Our Services</h2>
            <p>Comprehensive design system solutions tailored to your needs</p>
          </div>
          <div className={styles.servicesGrid}>
            {services.map((service, index) => (
              <div key={index} className={styles.serviceCard}>
                <div className={styles.iconWrapper}>{service.icon}</div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <ul className={styles.featuresList}>
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex}>
                      <CheckCircle className={styles.checkIcon} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.technologies}>
          <div className={styles.sectionHeader}>
            <h2>Technologies & Tools</h2>
            <p>Modern tools and frameworks for robust design systems</p>
          </div>
          <div className={styles.technologiesGrid}>
            {technologies.map((tech, index) => (
              <div key={index} className={styles.techItem}>
                <Code className={styles.techIcon} />
                <span>{tech}</span>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.process}>
          <div className={styles.sectionHeader}>
            <h2>Our Process</h2>
            <p>From discovery to implementation, we build systems that scale</p>
          </div>
          <div className={styles.processTimeline}>
            {process.map((item, index) => (
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

        <section className={styles.caseStudies}>
          <div className={styles.sectionHeader}>
            <h2>Success Stories</h2>
            <p>Real-world impact of well-designed systems</p>
          </div>
          <div className={styles.caseStudiesGrid}>
            {caseStudies.map((study, index) => (
              <div key={index} className={styles.caseStudyCard}>
                <h3>{study.title}</h3>
                <p>{study.description}</p>
                <div className={styles.result}>
                  <strong>Result:</strong> {study.result}
                </div>
                <button className={styles.learnMore}>
                  Learn More <ArrowRight className={styles.arrowIcon} />
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.benefits}>
          <div className={styles.sectionHeader}>
            <h2>Why Invest in a Design System?</h2>
          </div>
          <div className={styles.benefitsGrid}>
            <div className={styles.benefitCard}>
              <Monitor className={styles.benefitIcon} />
              <h3>Consistency</h3>
              <p>Ensure brand consistency across all products and platforms</p>
            </div>
            <div className={styles.benefitCard}>
              <Zap className={styles.benefitIcon} />
              <h3>Speed</h3>
              <p>Accelerate development with reusable components and patterns</p>
            </div>
            <div className={styles.benefitCard}>
              <Smartphone className={styles.benefitIcon} />
              <h3>Scalability</h3>
              <p>Build products that can grow and evolve with your business</p>
            </div>
            <div className={styles.benefitCard}>
              <Layers className={styles.benefitIcon} />
              <h3>Collaboration</h3>
              <p>Improve collaboration between designers and developers</p>
            </div>
          </div>
        </section>

        <section className={styles.cta}>
          <div className={styles.ctaContent}>
            <h2>Ready to Build Your Design System?</h2>
            <p>Let's create a scalable design system that will accelerate your development and ensure consistency across all your products.</p>
            <button className={styles.primaryButton}>Get Started</button>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default DesignSystemsPage;
