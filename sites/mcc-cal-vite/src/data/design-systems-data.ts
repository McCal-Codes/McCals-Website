export interface DesignSystemService {
  icon: string;
  title: string;
  description: string;
}

export interface Technology {
  name: string;
  description: string;
  category: string;
}

export interface CaseStudy {
  title: string;
  client: string;
  challenge: string;
  solution: string;
  results: string;
}

export interface ProcessStep {
  step: string;
  title: string;
  description: string;
}

export interface Benefit {
  title: string;
  description: string;
  icon: string;
}

export const designSystemServices: DesignSystemService[] = [
  {
    icon: 'Palette',
    title: 'Design System Architecture',
    description: 'Comprehensive design system development from component library to documentation and governance.',
  },
  {
    icon: 'Layers',
    title: 'Component Library Development',
    description: 'Reusable, accessible React components with consistent styling and behavior across your applications.',
  },
  {
    icon: 'Zap',
    title: 'Style Guide Creation',
    description: 'Visual identity systems including color palettes, typography, spacing, and usage guidelines.',
  },
  {
    icon: 'Code',
    title: 'Design-to-Code Integration',
    description: 'Seamless workflow from Figma designs to production code with automated testing and documentation.',
  },
];

export const technologies: Technology[] = [
  {
    name: 'React & TypeScript',
    description: 'Modern component development with strong typing and developer experience.',
    category: 'Frontend',
  },
  {
    name: 'Tailwind CSS',
    description: 'Utility-first CSS framework for rapid UI development with consistent design.',
    category: 'Styling',
  },
  {
    name: 'Figma Design Systems',
    description: 'Professional design tools with component libraries and design tokens.',
    category: 'Design Tools',
  },
  {
    name: 'Storybook',
    description: 'Component development and documentation environment for design systems.',
    category: 'Documentation',
  },
  {
    name: 'CSS Modules',
    description: 'Scoped CSS for component-level styling without global conflicts.',
    category: 'Styling',
  },
  {
    name: 'Design Tokens',
    description: 'Centralized design variables for consistent theming across platforms.',
    category: 'Architecture',
  },
];

export const caseStudies: CaseStudy[] = [
  {
    title: 'E-commerce Platform Redesign',
    client: 'Tech Startup',
    challenge: 'Inconsistent UI across multiple products and slow development cycles.',
    solution: 'Created comprehensive design system with 50+ reusable components and automated documentation.',
    results: '40% faster development, 60% reduction in UI bugs, improved user satisfaction.',
  },
  {
    title: 'Enterprise Dashboard System',
    client: 'Financial Services Company',
    challenge: 'Complex data visualization needs and accessibility requirements.',
    solution: 'Developed accessible component library with chart components and responsive layouts.',
    results: 'WCAG 2.1 AA compliance, 30% improvement in user task completion, consistent branding.',
  },
];

export const processSteps: ProcessStep[] = [
  {
    step: '1',
    title: 'Discovery & Audit',
    description: 'Analyze existing design patterns, user needs, and technical requirements.',
  },
  {
    step: '2',
    title: 'System Design',
    description: 'Create design principles, component architecture, and documentation structure.',
  },
  {
    step: '3',
    title: 'Component Development',
    description: 'Build reusable components with proper testing, documentation, and accessibility.',
  },
  {
    step: '4',
    title: 'Integration & Training',
    description: 'Integrate design system into projects and train development teams.',
  },
];

export const benefits: Benefit[] = [
  {
    title: 'Consistency',
    description: 'Unified user experience across all products and platforms.',
    icon: 'CheckCircle',
  },
  {
    title: 'Efficiency',
    description: 'Faster development with pre-built, tested components.',
    icon: 'Zap',
  },
  {
    title: 'Scalability',
    description: 'Easy to maintain and extend as your product grows.',
    icon: 'Layers',
  },
  {
    title: 'Accessibility',
    description: 'Built-in accessibility compliance and inclusive design.',
    icon: 'Users',
  },
];
