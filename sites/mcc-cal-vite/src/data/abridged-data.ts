export interface Category {
  id: string;
  label: string;
  icon: string;
}

export interface FeaturedWork {
  id: number;
  title: string;
  category: string;
  description: string;
  image: string;
  tags: string[];
}

export interface Service {
  icon: string;
  title: string;
  description: string;
}

export const categories: Category[] = [
  { id: 'all', label: 'All Work', icon: 'Image' },
  { id: 'concerts', label: 'Concerts', icon: 'Camera' },
  { id: 'portraits', label: 'Portraits', icon: 'Heart' },
  { id: 'events', label: 'Events', icon: 'Clock' },
];

export const featuredWork: FeaturedWork[] = [
  {
    id: 1,
    title: 'ACL Weekend 1',
    category: 'concerts',
    description: 'Austin City Limits Music Festival - Weekend 1 highlights',
    image: '/images/Portfolios/Concerts/ACL-2025/Weekend-1/featured.jpg',
    tags: ['music festival', 'live performance', 'Austin'],
  },
  {
    id: 2,
    title: 'Corporate Headshots',
    category: 'portraits',
    description: 'Professional headshot session for tech company executives',
    image: '/images/Portfolios/Portraits/Corporate/featured.jpg',
    tags: ['professional', 'corporate', 'headshots'],
  },
  {
    id: 3,
    title: 'Tech Conference',
    category: 'events',
    description: 'Annual technology conference coverage and documentation',
    image: '/images/Portfolios/Events/Tech-Conference/featured.jpg',
    tags: ['corporate event', 'conference', 'technology'],
  },
  {
    id: 4,
    title: 'Indie Concert Series',
    category: 'concerts',
    description: 'Local indie music venue photo documentation',
    image: '/images/Portfolios/Concerts/Indie-Series/featured.jpg',
    tags: ['live music', 'indie', 'local venue'],
  },
  {
    id: 5,
    title: 'Creative Portraits',
    category: 'portraits',
    description: 'Artistic portrait session with creative professionals',
    image: '/images/Portfolios/Portraits/Creative/featured.jpg',
    tags: ['artistic', 'creative', 'professional'],
  },
  {
    id: 6,
    title: 'Wedding Coverage',
    category: 'events',
    description: 'Intimate wedding ceremony and reception documentation',
    image: '/images/Portfolios/Events/Weddings/featured.jpg',
    tags: ['wedding', 'ceremony', 'celebration'],
  },
];

export const services: Service[] = [
  {
    icon: 'Camera',
    title: 'Concert Photography',
    description: 'Live music coverage with access to capture the energy and emotion of performances.',
  },
  {
    icon: 'Heart',
    title: 'Portrait Sessions',
    description: 'Professional headshots and creative portraits for individuals and teams.',
  },
  {
    icon: 'Clock',
    title: 'Event Documentation',
    description: 'Corporate events, weddings, and special occasions with comprehensive coverage.',
  },
];
