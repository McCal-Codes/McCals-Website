export interface VideoService {
  icon: string;
  title: string;
  description: string;
}

export interface VideoProcessStep {
  step: string;
  title: string;
  description: string;
}

export interface VideoProject {
  title: string;
  description: string;
  duration: string;
  format: string;
}

export const videoServices: VideoService[] = [
  {
    icon: 'Camera',
    title: 'Event Coverage',
    description: 'Professional videography for concerts, conferences, weddings, and special events with multi-camera setup.',
  },
  {
    icon: 'Video',
    title: 'Interviews & Testimonials',
    description: 'High-quality interview production with professional lighting and audio equipment for compelling stories.',
  },
  {
    icon: 'Film',
    title: 'Documentary Production',
    description: 'Full-service documentary filmmaking from concept development through final editing and distribution.',
  },
  {
    icon: 'Settings',
    title: 'Post-Production',
    description: 'Professional video editing, color grading, sound mixing, and motion graphics to polish your content.',
  },
];

export const videoEquipment = [
  'Professional 4K cameras',
  'Drone cinematography',
  'Professional lighting kits',
  'Audio recording equipment',
  'Steadicam and gimbal systems',
  'Multi-camera switcher',
];

export const videoProcess: VideoProcessStep[] = [
  {
    step: '1',
    title: 'Consultation',
    description: 'We discuss your vision, goals, and requirements to create a customized video strategy.',
  },
  {
    step: '2',
    title: 'Pre-Production',
    description: 'Planning, storyboarding, location scouting, and scheduling to ensure smooth execution.',
  },
  {
    step: '3',
    title: 'Production',
    description: 'Professional filming with experienced crew and state-of-the-art equipment.',
  },
  {
    step: '4',
    title: 'Post-Production',
    description: 'Expert editing, color grading, sound design, and delivery in your preferred formats.',
  },
];

export const featuredVideoProjects: VideoProject[] = [
  {
    title: 'Corporate Conference 2024',
    description: 'Multi-day conference coverage with keynote presentations and breakout sessions.',
    duration: '3 days',
    format: 'Multi-camera + Drone',
  },
  {
    title: 'Music Festival Highlights',
    description: 'Dynamic coverage of multiple artists and crowd reactions for promotional content.',
    duration: '2 days',
    format: 'Handheld + Steadicam',
  },
  {
    title: 'Product Launch Campaign',
    description: 'Comprehensive video campaign including product demos and customer testimonials.',
    duration: '1 week',
    format: 'Studio + Location',
  },
];
