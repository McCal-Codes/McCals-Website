export interface Client {
  id: string;
  name: string;
  src?: string;
  alt: string;
  logoMode?: 'image' | 'text';
  logoSurface?: 'light' | 'dark';
  logoTheme?: {
    accent?: string;
    accentSecondary?: string;
    maxHeight?: number;
    radius?: number;
  };
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
  {
    category: 'Accessories',
    icon: 'camera',
    items: [
      'Tripods & monopods',
      'Spare batteries & chargers',
      'Camera straps & protective cases',
      'Memory cards (SD / CFexpress) & readers',
    ],
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
    logoTheme: { accent: '222 45 45', accentSecondary: '25 25 25', maxHeight: 64 },
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
    logoSurface: 'dark',
    logoTheme: { accent: '255 255 255', accentSecondary: '80 80 80', maxHeight: 58 },
    category: 'media',
    website: 'https://pittsburghmagazine.com',
  },
  {
    id: 'point-park-university',
    name: 'Point Park University',
    src: '/about/clients/point-park-university-real-logo.jpg',
    alt: 'Point Park University',
    logoTheme: { accent: '82 158 32', accentSecondary: '45 45 45', maxHeight: 78 },
    category: 'academic',
    website: 'https://pointpark.edu',
  },
  {
    id: 'the-globe',
    name: 'The Globe',
    src: '/about/clients/the-globe-current-logo.png',
    alt: 'The Globe',
    logoTheme: { accent: '109 141 35', accentSecondary: '25 25 25', maxHeight: 88 },
    category: 'media',
    website: 'https://ppuglobe.com/',
  },
  {
    id: 'bc3',
    name: 'Butler County Community College',
    src: '/about/clients/bc3-logo-official.png',
    alt: 'Butler County Community College',
    logoTheme: { accent: '0 92 170', accentSecondary: '0 61 114', maxHeight: 82 },
    category: 'academic',
    website: 'https://bc3.edu',
  },
  {
    id: 'nppa',
    name: 'National Press Photographers Association',
    src: '/about/clients/nppa-real-logo.png',
    alt: 'National Press Photographers Association',
    logoTheme: { accent: '0 173 239', accentSecondary: '35 35 35' },
    category: 'media',
    website: 'https://nppa.org',
  },
  {
    id: 'osh360',
    name: 'OSH360',
    src: '/about/clients/osh360-logo.png',
    alt: 'OSH360',
    logoSurface: 'dark',
    logoTheme: { accent: '24 188 226', accentSecondary: '255 104 26', maxHeight: 88 },
    category: 'nonprofit',
    website: 'https://osh360.org',
  },
  {
    id: 'covalent',
    name: 'Covalent',
    src: '/about/clients/covalent-logo.png',
    alt: 'Covalent',
    logoSurface: 'dark',
    logoTheme: { accent: '238 28 67', accentSecondary: '238 229 229', maxHeight: 92 },
    category: 'brand',
    website: 'https://covalent.xyz',
  },
  {
    id: 'carnegie-mellon',
    name: 'Carnegie Mellon University',
    src: '/about/clients/carnegie-mellon-university-official-logo.png',
    alt: 'Carnegie Mellon University',
    logoTheme: { accent: '196 18 48', accentSecondary: '60 60 60' },
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
    logoTheme: { accent: '0 53 148', accentSecondary: '255 184 28' },
    category: 'academic',
    website: 'https://pitt.edu',
  },
  {
    id: 'penn-state-fayette',
    name: 'Penn State Fayette',
    src: '/about/clients/penn-state-logo-official.png',
    alt: 'Penn State Fayette',
    logoTheme: { accent: '30 64 124', accentSecondary: '150 150 150' },
    category: 'academic',
    website: 'https://fayette.psu.edu',
  },
  {
    id: 'iup',
    name: 'Indiana University of Pennsylvania',
    src: '/about/clients/iup-logo-official.png',
    alt: 'Indiana University of Pennsylvania',
    logoTheme: { accent: '153 27 30', accentSecondary: '95 95 95' },
    category: 'academic',
    website: 'https://iup.edu',
  },
  {
    id: 'wvu',
    name: 'West Virginia University',
    src: '/about/clients/wvu-flying-wv-logo.svg',
    alt: 'West Virginia University',
    logoSurface: 'dark',
    logoTheme: { accent: '234 170 0', accentSecondary: '0 40 85' },
    category: 'academic',
    website: 'https://wvu.edu',
  },
  {
    id: 'osu',
    name: 'Ohio State University',
    src: '/about/clients/ohio-state-university-logo.png',
    alt: 'Ohio State University',
    logoTheme: { accent: '187 0 0', accentSecondary: '102 102 102' },
    category: 'academic',
    website: 'https://osu.edu',
  },
  {
    id: 'geneva-college',
    name: 'Geneva College',
    src: '/about/clients/geneva-college-logo.svg',
    alt: 'Geneva College',
    logoSurface: 'dark',
    logoTheme: { accent: '203 151 0', accentSecondary: '44 44 44' },
    category: 'academic',
    website: 'https://www.geneva.edu/',
  },
  {
    id: 'duquesne-university',
    name: 'Duquesne University',
    src: '/about/clients/duquesne-university-logo.svg',
    alt: 'Duquesne University',
    logoTheme: { accent: '186 12 47', accentSecondary: '1 33 105' },
    category: 'academic',
    website: 'https://www.duq.edu/',
  },
  {
    id: 'pennsylvania-news-media',
    name: 'Pennsylvania News Media Association',
    src: '/about/clients/pennsylvania-newsmedia-association-official-logo.png',
    alt: 'Pennsylvania News Media Association',
    logoTheme: { accent: '31 97 141', accentSecondary: '108 117 125' },
    category: 'media',
    website: 'https://panewsmedia.org/',
  },
  {
    id: 'next-generation-news',
    name: 'Next Generation Newsroom',
    src: '/about/clients/next-generation-newsroom-official-logo.webp',
    alt: 'Next Generation Newsroom',
    logoTheme: { accent: '137 176 157', accentSecondary: '101 130 103', maxHeight: 72 },
    category: 'media',
    website: 'https://www.pghmediapartnership.org/',
  },
  {
    id: 'pittsburgh-union-progress',
    name: 'Pittsburgh Union Progress',
    src: '/about/clients/pittsburgh-union-progress-official-logo.png',
    alt: 'Pittsburgh Union Progress',
    logoTheme: { accent: '255 193 31', accentSecondary: '24 24 24' },
    category: 'editorial',
    website: 'https://www.unionprogress.com/',
  },
  {
    id: 'triblive',
    name: 'TribLIVE',
    src: '/about/clients/triblive-logo.png',
    alt: 'TribLIVE',
    logoTheme: { accent: '216 33 46', accentSecondary: '35 35 35' },
    category: 'editorial',
    website: 'https://triblive.com/',
  },
  {
    id: 'center-for-media-innovation',
    name: 'Center for Media Innovation',
    src: '/about/clients/center-for-media-innovation-official-logo.png',
    alt: 'Center for Media Innovation',
    logoTheme: { accent: '101 130 103', accentSecondary: '0 143 156', maxHeight: 80 },
    category: 'media',
    website: 'https://pointpark.edu/cmi',
  },
  {
    id: 'western-pa-press-club',
    name: 'Western PA Press Club',
    src: '/about/clients/western-pa-press-club-official-logo.png',
    alt: 'Western PA Press Club',
    logoTheme: { accent: '178 16 44', accentSecondary: '135 135 135', maxHeight: 76 },
    category: 'media',
    website: 'https://westernpapressclub.org',
  },
  {
    id: 'jagoff-media',
    name: 'YaJagoff Media',
    src: '/about/clients/yajagoff-official-logo.png',
    alt: 'YaJagoff Media',
    logoTheme: { accent: '255 214 0', accentSecondary: '22 22 22', maxHeight: 74 },
    category: 'media',
    website: 'https://www.yajagoff.com/our-jagoffs/',
  },
  {
    id: 'haven-pittsburgh',
    name: 'Haven',
    src: '/about/clients/haven-venue-logo.png',
    alt: 'Haven',
    logoSurface: 'dark',
    logoTheme: { accent: '255 255 255', accentSecondary: '120 120 120' },
    category: 'nonprofit',
    website: 'https://www.havenvenue.com/',
  },
  {
    id: 'ghostlight-theatre',
    name: 'Ghost Light Productions',
    src: '/about/clients/ghost-light-productions-official-logo.jpg',
    alt: 'Ghost Light Productions',
    logoTheme: { accent: '150 150 150', accentSecondary: '35 35 35', maxHeight: 84, radius: 6 },
    category: 'nonprofit',
    website: 'https://www.ghostlightpgh.com/',
    publications: [
      { url: 'https://www.ghostlightpgh.com/', title: 'Theatre productions', date: '2024' },
      { url: 'https://www.ghostlightpgh.com/', title: 'Production photos', date: '2023' },
    ],
  },
  {
    id: 'the-space-upstairs',
    name: 'The Space Upstairs',
    src: '/about/clients/the-space-upstairs-official-logo.png',
    alt: 'The Space Upstairs',
    logoTheme: { accent: '95 122 166', accentSecondary: '60 70 90', maxHeight: 78 },
    category: 'nonprofit',
    website: 'https://www.thespaceupstairs.org/',
  },
  {
    id: 'the-watchful-shepherd',
    name: 'The Watchful Shepherd',
    src: '/about/clients/watchful-shepherd-official-logo.png',
    alt: 'The Watchful Shepherd',
    logoTheme: { accent: '113 135 255', accentSecondary: '118 118 118', maxHeight: 74 },
    category: 'nonprofit',
    website: 'https://watchful.org/',
  },
  {
    id: 'terrible-tailgate',
    name: 'Terrible Tailgate',
    src: '/about/clients/terrible-tailgate-official-logo.jpg',
    alt: 'Terrible Tailgate',
    logoSurface: 'dark',
    logoTheme: { accent: '255 191 0', accentSecondary: '36 29 8', maxHeight: 84, radius: 8 },
    category: 'brand',
    website: 'https://www.steelernation.com/page/terrible-tailgate',
  },
  {
    id: 'upward-consulting',
    name: 'Upward Consulting',
    src: '/about/clients/upward-consulting-official-logo.png',
    alt: 'Upward Consulting',
    logoTheme: { accent: '255 53 31', accentSecondary: '90 90 90', maxHeight: 86 },
    category: 'brand',
    website: 'https://www.whatsupward.com/',
  },
  {
    id: 'voyage-visuals',
    name: 'Voyage Visuals',
    src: '/about/clients/voyage-visuals-official-logo.png',
    alt: 'Voyage Visuals',
    logoSurface: 'dark',
    logoTheme: { accent: '215 184 100', accentSecondary: '28 25 19' },
    category: 'brand',
    website: 'https://www.voyagevisuals.com/',
  },
  {
    id: 'yinzers-meet',
    name: 'Yinzers Meet',
    src: '/about/clients/yinzers-meet-official-logo.png',
    alt: 'Yinzers Meet',
    logoSurface: 'dark',
    logoTheme: { accent: '255 191 49', accentSecondary: '80 58 12', maxHeight: 90 },
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
