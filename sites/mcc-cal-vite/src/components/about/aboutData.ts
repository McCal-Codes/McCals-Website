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

export const stats: Stat[] = [
  { value: '30+', label: 'Happy clients' },
  { value: '65+', label: 'Projects' },
  { value: '6+', label: 'Years experience' },
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
    src: '/about/clients/the-globe-real-logo.jpg',
    alt: 'The Globe',
    category: 'media',
    website: 'https://pointpark.edu/theglobe',
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
    category: 'nonprofit',
    website: 'https://osh360.org',
  },
  {
    id: 'covalent',
    name: 'Covalent',
    src: '/about/clients/covalent-logo.png',
    alt: 'Covalent',
    category: 'brand',
    website: 'https://covalent.xyz',
  },
  {
    id: 'carnegie-mellon',
    name: 'Carnegie Mellon University',
    alt: 'Carnegie Mellon University',
    logoMode: 'text',
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
    alt: 'Penn State Fayette',
    logoMode: 'text',
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
    src: '/about/clients/pennsylvania-news-media-logo.svg',
    alt: 'Pennsylvania News Media Association',
    category: 'media',
    website: 'https://panewsmedia.org',
  },
  {
    id: 'next-generation-news',
    name: 'Next Generation News',
    src: '/about/clients/next-generation-news-logo.svg',
    alt: 'Next Generation News',
    category: 'media',
    website: 'https://nextgenerationnews.com',
  },
  {
    id: 'pittsburgh-union-progress',
    name: 'Pittsburgh Union Progress',
    src: '/about/clients/pittsburgh-union-progress-logo.svg',
    alt: 'Pittsburgh Union Progress',
    category: 'editorial',
    website: 'https://unionprogress.com',
  },
  {
    id: 'triblive',
    name: 'TribLIVE',
    alt: 'TribLIVE',
    logoMode: 'text',
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
    name: 'Haven Pittsburgh',
    src: '/about/clients/haven-pittsburgh-logo.svg',
    alt: 'Haven Pittsburgh',
    category: 'nonprofit',
    website: 'https://havenpittsburgh.org',
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
    src: '/about/clients/the-space-upstairs-logo.svg',
    alt: 'The Space Upstairs',
    category: 'nonprofit',
    website: 'https://thespaceupstairs.org',
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
    src: '/about/clients/terrible-tailgate-logo.svg',
    alt: 'Terrible Tailgate',
    category: 'brand',
    website: 'https://terribletailgate.com',
  },
  {
    id: 'upward-consulting',
    name: 'Upward Consulting',
    src: '/about/clients/upward-consulting-logo.svg',
    alt: 'Upward Consulting',
    category: 'brand',
    website: 'https://upwardconsulting.com',
  },
  {
    id: 'voyage-visuals',
    name: 'Voyage Visuals',
    src: '/about/clients/voyage-visuals-logo.svg',
    alt: 'Voyage Visuals',
    category: 'brand',
    website: 'https://voyagevisuals.com',
  },
  {
    id: 'yinzers-meet',
    name: 'Yinzers Meet',
    src: '/about/clients/yinzers-meet-logo.svg',
    alt: 'Yinzers Meet',
    category: 'brand',
    website: 'https://yinzersmeet.com',
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
