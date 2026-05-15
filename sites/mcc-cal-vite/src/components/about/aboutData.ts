export interface Client {
  id: string;
  name: string;
  src?: string;
  alt: string;
  logoMode?: 'image' | 'text';
  logoSurface?: 'light' | 'dark';
  // URLs to published work - supports multiple for randomization
  publications?: {
    url: string;
    title?: string;
    date?: string;
  }[];
  // Fallback to main website if no publications
  website?: string;
  // Category for filtering/organization
  category: 'editorial' | 'academic' | 'nonprofit' | 'brand' | 'media';
}

export interface Testimonial {
  source: 'LinkedIn' | 'Google' | 'Website' | 'Referral';
  quote: string;
  name: string;
  role: string;
  rating?: string;
  avatar?: string;
}

export interface Stat {
  value: string;
  label: string;
}

export interface FieldKitCategory {
  category: string;
  icon: 'camera' | 'aperture' | 'flash' | 'audio' | 'editing';
  items: string[];
}

export const stats: Stat[] = [
  { value: '30+', label: 'Happy clients' },
  { value: '65+', label: 'Projects' },
  { value: '6+', label: 'Years experience' },
];

export const fieldKit: FieldKitCategory[] = [
  {
    category: 'Cameras',
    icon: 'camera',
    items: ['Nikon Z 6II'],
  },
  {
    category: 'Lenses',
    icon: 'aperture',
    items: [
      'NIKKOR Z 24-70mm f/2.8 S',
      'NIKKOR Z 70-200mm f/2.8 VR S',
      'NIKKOR Z 180-600mm f/5.6-6.3 VR',
    ],
  },
  {
    category: 'Lighting',
    icon: 'flash',
    items: ['Godox V1Pro N Flash for Nikon'],
  },
  {
    category: 'Audio',
    icon: 'audio',
    items: ['Audio kit available by project'],
  },
  {
    category: 'Editing Tools',
    icon: 'editing',
    items: ['Capture One', 'Photo Mechanic', 'Photoshop as needed'],
  },
];

export const testimonials: Testimonial[] = [
  {
    source: 'LinkedIn',
    quote:
      'Caleb is great to work with, always prompt and professional. His work speaks for itself.',
    name: 'Logan Spiker',
    role: 'Former Argo AI, business owner',
  },
  {
    source: 'Google',
    quote:
      "Caleb is an incredibly talented photographer. I'm always blown away by the quality of his work.",
    name: 'Ben Orr',
    role: 'Concert photography client',
    rating: '5-star feedback',
  },
];

export const clients: Client[] = [
  {
    id: 'new-york-post',
    name: 'New York Post',
    src: '/about/clients/new-york-post-logo.svg',
    alt: 'New York Post',
    category: 'editorial',
    website: 'https://nypost.com',
    publications: [
      { url: 'https://nypost.com', title: 'Photojournalism work', date: '2024' },
    ],
  },
  {
    id: 'pittsburgh-magazine',
    name: 'Pittsburgh Magazine',
    src: '/about/clients/pittsburgh-magazine-real-logo.png',
    alt: 'Pittsburgh Magazine',
    category: 'media',
    website: 'https://pittsburghmagazine.com',
  },
  {
    id: 'point-park-university',
    name: 'Point Park University',
    src: '/about/clients/point-park-university-real-logo.jpg',
    alt: 'Point Park University',
    category: 'academic',
    website: 'https://pointpark.edu',
  },
  {
    id: 'the-globe',
    name: 'The Globe',
    src: '/about/clients/the-globe-current-logo.png',
    alt: 'The Globe',
    category: 'media',
    website: 'https://ppuglobe.com/',
  },
  {
    id: 'bc3',
    name: 'Butler County Community College',
    src: '/about/clients/bc3-logo-new.png',
    alt: 'Butler County Community College',
    category: 'academic',
    website: 'https://bc3.edu',
  },
  {
    id: 'nppa',
    name: 'National Press Photographers Association',
    src: '/about/clients/nppa-real-logo.png',
    alt: 'National Press Photographers Association',
    category: 'media',
    website: 'https://nppa.org',
  },
  {
    id: 'osh360',
    name: 'OSH360',
    src: '/about/clients/osh360-logo.png',
    alt: 'OSH360',
    logoSurface: 'dark',
    category: 'nonprofit',
    website: 'https://osh360.org',
  },
  {
    id: 'covalent',
    name: 'Covalent',
    src: '/about/clients/covalent-logo.png',
    alt: 'Covalent',
    logoSurface: 'dark',
    category: 'brand',
    website: 'https://covalent.xyz',
  },
  {
    id: 'carnegie-mellon',
    name: 'Carnegie Mellon University',
    src: '/about/clients/carnegie-mellon-university-official-logo.png',
    alt: 'Carnegie Mellon University',
    category: 'academic',
    website: 'https://cmu.edu',
    publications: [
      { url: 'https://cmu.edu/news', title: 'Campus events', date: '2024' },
      { url: 'https://thetartan.org', title: 'The Tartan coverage', date: '2023' },
    ],
  },
  {
    id: 'university-of-pittsburgh',
    name: 'University of Pittsburgh',
    src: '/about/clients/university-of-pittsburgh-official-logo.png',
    alt: 'University of Pittsburgh',
    category: 'academic',
    website: 'https://pitt.edu',
  },
  {
    id: 'penn-state-fayette',
    name: 'Penn State Fayette',
    src: '/about/clients/penn-state-logo-official.png',
    alt: 'Penn State Fayette',
    category: 'academic',
    website: 'https://fayette.psu.edu',
  },
  {
    id: 'iup',
    name: 'Indiana University of Pennsylvania',
    src: '/about/clients/iup-logo-official.png',
    alt: 'Indiana University of Pennsylvania',
    category: 'academic',
    website: 'https://iup.edu',
  },
  {
    id: 'wvu',
    name: 'West Virginia University',
    src: '/about/clients/wvu-flying-wv-logo.svg',
    alt: 'West Virginia University',
    category: 'academic',
    website: 'https://wvu.edu',
  },
  {
    id: 'osu',
    name: 'Ohio State University',
    src: '/about/clients/ohio-state-university-logo.png',
    alt: 'Ohio State University',
    category: 'academic',
    website: 'https://osu.edu',
  },
  {
    id: 'geneva-college',
    name: 'Geneva College',
    src: '/about/clients/geneva-college-logo.svg',
    alt: 'Geneva College',
    logoSurface: 'dark',
    category: 'academic',
    website: 'https://www.geneva.edu/',
  },
  {
    id: 'duquesne-university',
    name: 'Duquesne University',
    src: '/about/clients/duquesne-university-logo.svg',
    alt: 'Duquesne University',
    category: 'academic',
    website: 'https://www.duq.edu/',
  },
  {
    id: 'pennsylvania-news-media',
    name: 'Pennsylvania News Media Association',
    src: '/about/clients/pennsylvania-newsmedia-association-official-logo.png',
    alt: 'Pennsylvania News Media Association',
    category: 'media',
    website: 'https://panewsmedia.org/',
  },
  {
    id: 'next-generation-news',
    name: 'Next Generation Newsroom',
    alt: 'Next Generation Newsroom',
    logoMode: 'text',
    category: 'media',
    website: 'https://www.pghmediapartnership.org/old-pages-no-longer-in-use/old-about-us',
  },
  {
    id: 'pittsburgh-union-progress',
    name: 'Pittsburgh Union Progress',
    src: '/about/clients/pittsburgh-union-progress-official-logo.png',
    alt: 'Pittsburgh Union Progress',
    category: 'editorial',
    website: 'https://www.unionprogress.com/',
  },
  {
    id: 'triblive',
    name: 'TribLIVE',
    src: '/about/clients/triblive-logo.png',
    alt: 'TribLIVE',
    category: 'editorial',
    website: 'https://triblive.com/',
  },
  {
    id: 'center-for-media-innovation',
    name: 'Center for Media Innovation',
    src: '/about/clients/center-for-media-innovation-logo.svg',
    alt: 'Center for Media Innovation',
    category: 'media',
    website: 'https://pointpark.edu/cmi',
  },
  {
    id: 'western-pa-press-club',
    name: 'Western PA Press Club',
    src: '/about/clients/western-pa-press-club-logo.svg',
    alt: 'Western PA Press Club',
    category: 'media',
    website: 'https://westernpapressclub.org',
  },
  {
    id: 'jagoff-media',
    name: 'Jagoff Media',
    src: '/about/clients/jagoff-media-logo.svg',
    alt: 'Jagoff Media',
    category: 'media',
    website: 'https://jagoffmedia.com',
  },
  {
    id: 'haven-pittsburgh',
    name: 'Haven',
    src: '/about/clients/haven-venue-logo.png',
    alt: 'Haven',
    logoSurface: 'dark',
    category: 'nonprofit',
    website: 'https://www.havenvenue.com/',
  },
  {
    id: 'ghostlight-theatre',
    name: 'Ghostlight Theatre Company',
    src: '/about/clients/ghostlight-theatre-company-logo.svg',
    alt: 'Ghostlight Theatre Company',
    category: 'nonprofit',
    website: 'https://ghostlighttheatre.org',
    publications: [
      { url: 'https://ghostlighttheatre.org/events', title: 'Theatre productions', date: '2024' },
      { url: 'https://ghostlighttheatre.org/gallery', title: 'Production photos', date: '2023' },
    ],
  },
  {
    id: 'the-space-upstairs',
    name: 'The Space Upstairs',
    src: '/about/clients/the-space-upstairs-official-logo.png',
    alt: 'The Space Upstairs',
    category: 'nonprofit',
    website: 'https://www.thespaceupstairs.org/',
  },
  {
    id: 'the-watchful-shepherd',
    name: 'The Watchful Shepherd',
    src: '/about/clients/the-watchful-shepherd-logo.svg',
    alt: 'The Watchful Shepherd',
    category: 'nonprofit',
    website: 'https://watchfulshepherd.org',
  },
  {
    id: 'terrible-tailgate',
    name: 'Terrible Tailgate',
    src: '/about/clients/terrible-tailgate-official-logo.jpg',
    alt: 'Terrible Tailgate',
    category: 'brand',
    website: 'https://www.steelernation.com/page/terrible-tailgate',
  },
  {
    id: 'upward-consulting',
    name: 'Upward Consulting',
    src: '/about/clients/upward-consulting-official-logo.png',
    alt: 'Upward Consulting',
    category: 'brand',
    website: 'https://www.whatsupward.com/',
  },
  {
    id: 'voyage-visuals',
    name: 'Voyage Visuals',
    src: '/about/clients/voyage-visuals-official-logo.png',
    alt: 'Voyage Visuals',
    logoSurface: 'dark',
    category: 'brand',
    website: 'https://www.voyagevisuals.com/',
  },
  {
    id: 'yinzers-meet',
    name: 'Yinzers Meet',
    src: '/about/clients/yinzers-meet-official-logo.png',
    alt: 'Yinzers Meet',
    logoSurface: 'dark',
    category: 'brand',
    website: 'https://www.yinzersmeet.com/',
  },
];

// Utility function to get random publication URL for a client
export function getClientLink(client: Client): string {
  if (client.publications && client.publications.length > 0) {
    // Randomly select one publication if multiple exist
    const randomIndex = Math.floor(Math.random() * client.publications.length);
    return client.publications[randomIndex].url;
  }
  // Fallback to main website
  return client.website || '#';
}

// Utility to shuffle clients for display
export function shuffleClients(clientList: Client[]): Client[] {
  return [...clientList].sort(() => Math.random() - 0.5);
}

// Get clients by category
export function getClientsByCategory(category: Client['category']): Client[] {
  return clients.filter((c) => c.category === category);
}
