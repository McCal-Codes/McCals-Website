import Layout from '@/components/Layout/Layout';
import { usePageMeta } from '@/hooks/usePageMeta';
import styles from './roadmap.module.css';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Rocket, CheckCircle, Circle, ArrowRight, Clock, Target, Zap, Camera, Video, Users, Code } from 'lucide-react';

const RoadmapPage = () => {
  const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://mcc-cal.com').replace(/\/$/, '');

  usePageMeta({
    title: 'Roadmap | McCal Media',
    description: 'Future plans and development roadmap for McCal Media. Upcoming features, services, and projects in photography, videography, and digital media.',
    canonical: `${SITE_URL}/roadmap`,
    robots: 'index, follow',
    og: {
      type: 'website',
      title: 'Roadmap | McCal Media',
      description: 'Future plans and development roadmap for photography and media services.',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Roadmap | McCal Media',
      description: 'Upcoming features and projects for McCal Media.',
    },
  });

  const roadmapPhases = [
    {
      phase: 'Q2 2026',
      status: 'completed',
      title: 'Foundation Complete',
      description: 'Core website infrastructure and portfolio migration complete.',
      items: [
        'Vite + React migration',
        'Portfolio manifest system',
        'Responsive design implementation',
        'SEO optimization',
        'Performance improvements',
      ],
    },
    {
      phase: 'Q3 2026',
      status: 'in-progress',
      title: 'Service Expansion',
      description: 'Expanding service offerings and improving client experience.',
      items: [
        'Video production services launch',
        'Design system consulting',
        'Enhanced booking system',
        'Client portal development',
        'Mobile app planning',
      ],
    },
    {
      phase: 'Q4 2026',
      status: 'planned',
      title: 'Advanced Features',
      description: 'Sophisticated features and automation for better service delivery.',
      items: [
        'AI-powered photo editing',
        'Automated gallery generation',
        'Real-time collaboration tools',
        'Advanced analytics dashboard',
        'Integration with creative tools',
      ],
    },
    {
      phase: 'Q1 2027',
      status: 'planned',
      title: 'Platform Evolution',
      description: 'Transforming into a comprehensive creative platform.',
      items: [
        'Multi-creator portfolio platform',
        'Community features',
        'Educational content launch',
        'Marketplace integration',
        'Global expansion planning',
      ],
    },
  ];

  const upcomingFeatures = [
    {
      category: 'Photography',
      icon: <Camera className={styles.featureIcon} />,
      features: [
        'Advanced photo editing suite',
        'AI-assisted culling tools',
        'Automated backup systems',
        'Client proofing galleries',
      ],
    },
    {
      category: 'Videography',
      icon: <Video className={styles.featureIcon} />,
      features: [
        'Video editing services',
        'Drone photography integration',
        'Live streaming capabilities',
        'Motion graphics templates',
      ],
    },
    {
      category: 'Client Experience',
      icon: <Users className={styles.featureIcon} />,
      features: [
        'Self-service booking portal',
        'Real-time project tracking',
        'Automated delivery systems',
        'Feedback collection tools',
      ],
    },
    {
      category: 'Technology',
      icon: <Code className={styles.featureIcon} />,
      features: [
        'API for third-party integrations',
        'Mobile companion app',
        'Cloud storage solutions',
        'AI-powered search',
      ],
    },
  ];

  const milestones = [
    {
      date: 'April 2026',
      title: 'Website Migration Complete',
      description: 'Successfully migrated from legacy platform to modern Vite + React architecture.',
      achieved: true,
    },
    {
      date: 'May 2026',
      title: 'New Service Pages Launch',
      description: 'Comprehensive service pages for video production and design systems.',
      achieved: true,
    },
    {
      date: 'June 2026',
      title: 'Client Portal Beta',
      description: 'Beta testing of new client portal for project management and delivery.',
      achieved: false,
    },
    {
      date: 'July 2026',
      title: 'Mobile App Release',
      description: 'First version of mobile companion app for on-the-go portfolio access.',
      achieved: false,
    },
    {
      date: 'September 2026',
      title: 'AI Tools Integration',
      description: 'Launch of AI-powered photo editing and culling tools.',
      achieved: false,
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className={styles.statusIcon} />;
      case 'in-progress':
        return <Clock className={styles.statusIcon} />;
      case 'planned':
        return <Circle className={styles.statusIcon} />;
      default:
        return <Circle className={styles.statusIcon} />;
    }
  };

  return (
    <Layout>
      <div className={styles.container}>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <p className={styles.eyebrow}>Studio roadmap</p>
            <h1 className={styles.title}>Roadmap</h1>
            <p className={styles.subtitle}>
              A working view of the services, tooling, and portfolio systems being built around the McCal Media practice.
            </p>
            <div className={styles.heroStats}>
              <div className={styles.stat}>
                <div className={styles.statNumber}>4</div>
                <div className={styles.statLabel}>Active Phases</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statNumber}>20+</div>
                <div className={styles.statLabel}>Planned Features</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statNumber}>2027</div>
                <div className={styles.statLabel}>Platform Launch</div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.phases}>
          <div className={styles.sectionHeader}>
            <Target className={styles.sectionIcon} />
            <h2>Development Phases</h2>
            <p>Our strategic plan for growth and innovation</p>
          </div>
          <div className={styles.phasesTimeline}>
            {roadmapPhases.map((phase, index) => (
              <div key={index} className={styles.phaseItem}>
                <div className={styles.phaseHeader}>
                  <div className={styles.phaseDate}>{phase.phase}</div>
                  <div className={styles.phaseStatus} data-status={phase.status}>
                    {getStatusIcon(phase.status)}
                    <span>{phase.status.replace('-', ' ')}</span>
                  </div>
                </div>
                <div className={styles.phaseContent}>
                  <h3>{phase.title}</h3>
                  <p>{phase.description}</p>
                  <ul className={styles.phaseItems}>
                    {phase.items.map((item, itemIndex) => (
                      <li key={itemIndex}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.features}>
          <div className={styles.sectionHeader}>
            <Zap className={styles.sectionIcon} />
            <h2>Upcoming Features</h2>
            <p>Exciting new capabilities across all our service areas</p>
          </div>
          <div className={styles.featuresGrid}>
            {upcomingFeatures.map((category, index) => (
              <div key={index} className={styles.featureCategory}>
                <div className={styles.categoryHeader}>
                  {category.icon}
                  <h3>{category.category}</h3>
                </div>
                <ul className={styles.featureList}>
                  {category.features.map((feature, featureIndex) => (
                    <li key={featureIndex}>
                      <ArrowRight className={styles.featureArrow} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.milestones}>
          <div className={styles.sectionHeader}>
            <MapPin className={styles.sectionIcon} />
            <h2>Key Milestones</h2>
            <p>Important dates and achievements in our journey</p>
          </div>
          <div className={styles.milestonesList}>
            {milestones.map((milestone, index) => (
              <div key={index} className={`${styles.milestoneItem} ${milestone.achieved ? styles.achieved : ''}`}>
                <div className={styles.milestoneDate}>
                  <Calendar className={styles.calendarIcon} />
                  <span>{milestone.date}</span>
                </div>
                <div className={styles.milestoneContent}>
                  <h3>{milestone.title}</h3>
                  <p>{milestone.description}</p>
                  {milestone.achieved && (
                    <div className={styles.achievedBadge}>
                      <CheckCircle className={styles.achievedIcon} />
                      Achieved
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.vision}>
          <div className={styles.sectionHeader}>
            <Rocket className={styles.sectionIcon} />
            <h2>Our Vision</h2>
          </div>
          <div className={styles.visionContent}>
            <div className={styles.visionText}>
              <h3>Beyond Photography</h3>
              <p>
                We're building more than a photography service - we're creating a comprehensive 
                creative platform that empowers visual storytellers, streamlines client collaboration, 
                and sets new standards for digital media production.
              </p>
              <p>
                By 2027, McCal Media will be a full-service creative technology company, 
                combining artistic vision with cutting-edge technology to deliver exceptional 
                experiences for creators and clients alike.
              </p>
            </div>
            <div className={styles.visionGoals}>
              <div className={styles.goal}>
                <h4>Innovation</h4>
                <p>Leverage AI and automation to enhance creative workflows</p>
              </div>
              <div className={styles.goal}>
                <h4>Community</h4>
                <p>Build a platform that connects creators with opportunities</p>
              </div>
              <div className={styles.goal}>
                <h4>Excellence</h4>
                <p>Maintain the highest quality standards across all services</p>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.cta}>
          <div className={styles.ctaContent}>
            <h2>Join Our Journey</h2>
            <p>Be part of our evolution and help shape the future of creative media.</p>
            <div className={styles.ctaButtons}>
              <Link to="/request-a-quote" className={styles.primaryButton}>Request a Quote</Link>
              <Link to="/contact-us" className={styles.secondaryButton}>Share Feedback</Link>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default RoadmapPage;
