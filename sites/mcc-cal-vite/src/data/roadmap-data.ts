export interface RoadmapPhase {
  phase: string;
  status: 'completed' | 'in-progress' | 'planned';
  title: string;
  description: string;
  items: string[];
}

export interface UpcomingFeature {
  category: string;
  icon: string;
  features: string[];
}

export interface Milestone {
  date: string;
  title: string;
  description: string;
  achieved: boolean;
}

export interface VisionGoal {
  title: string;
  description: string;
}

export const roadmapPhases: RoadmapPhase[] = [
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

export const upcomingFeatures: UpcomingFeature[] = [
  {
    category: 'Photography',
    icon: 'Camera',
    features: [
      'Advanced photo editing suite',
      'AI-assisted culling tools',
      'Automated backup systems',
      'Client proofing galleries',
    ],
  },
  {
    category: 'Videography',
    icon: 'Video',
    features: [
      'Video editing services',
      'Drone photography integration',
      'Live streaming capabilities',
      'Motion graphics templates',
    ],
  },
  {
    category: 'Client Experience',
    icon: 'Users',
    features: [
      'Self-service booking portal',
      'Real-time project tracking',
      'Automated delivery systems',
      'Feedback collection tools',
    ],
  },
  {
    category: 'Technology',
    icon: 'Code',
    features: [
      'API for third-party integrations',
      'Mobile companion app',
      'Cloud storage solutions',
      'AI-powered search',
    ],
  },
];

export const milestones: Milestone[] = [
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

export const visionGoals: VisionGoal[] = [
  {
    title: 'Innovation',
    description: 'Leverage AI and automation to enhance creative workflows',
  },
  {
    title: 'Community',
    description: 'Build a platform that connects creators with opportunities',
  },
  {
    title: 'Excellence',
    description: 'Maintain the highest quality standards across all services',
  },
];
