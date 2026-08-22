export interface SiteNavItem {
  label: string;
  to: string;
  exact?: boolean;
  legacyPaths?: readonly string[];
}

export interface FooterNavSection {
  title: string;
  links: readonly SiteNavItem[];
}

export const WORK_NAV_ITEMS = [
  { label: 'Featured', to: '/featured-work', exact: true },
  { label: 'Photojournalism', to: '/journalism', exact: true },
  { label: 'Concerts', to: '/concerts', exact: true },
  { label: 'Events', to: '/events', exact: true },
  { label: 'Portraits', to: '/portraits', exact: true },
  { label: 'Nature', to: '/nature', exact: true },
] as const satisfies readonly SiteNavItem[];

export const PROJECT_NAV_ITEMS = [
  { label: 'Overview', to: '/projects', exact: true },
  {
    label: 'Letting Me Go',
    to: '/letting-me-go',
    exact: true,
    legacyPaths: ['/one-nation-divided'],
  },
] as const satisfies readonly SiteNavItem[];

export const FOOTER_NAV_SECTIONS = [
  {
    title: 'Work',
    links: [
      { label: 'Featured Work', to: '/featured-work' },
      { label: 'Photojournalism', to: '/journalism' },
      { label: 'Concerts', to: '/concerts' },
      { label: 'Events', to: '/events' },
      { label: 'Portraits', to: '/portraits' },
    ],
  },
  {
    title: 'Projects',
    links: PROJECT_NAV_ITEMS,
  },
  {
    title: 'Connect',
    links: [
      { label: 'Email', to: 'mailto:contact@mcc-cal.com' },
      { label: 'Request a Quote', to: '/request-a-quote' },
      { label: 'Grab a Coffee', to: '/grab-a-coffee' },
      { label: 'Book a Podcast', to: '/book-a-podcast' },
      { label: 'Contact Form', to: '/contact-us' },
    ],
  },
  {
    title: 'Site',
    links: [
      { label: 'About', to: '/about' },
      { label: 'Blog', to: '/blog' },
      { label: 'Podcast', to: '/podcast' },
      { label: 'Authors', to: '/authors' },
      { label: 'FAQs', to: '/faq' },
      { label: 'Licensing', to: '/licensing' },
      { label: 'Privacy', to: '/privacy' },
      { label: 'Terms', to: '/terms' },
    ],
  },
] as const satisfies readonly FooterNavSection[];

export function isActiveNavItem(pathname: string, item: SiteNavItem): boolean {
  const paths = [item.to, ...(item.legacyPaths ?? [])];
  return paths.some((path) => (item.exact ? pathname === path : pathname.startsWith(path)));
}

export function isProjectsNavPath(pathname: string): boolean {
  return (
    pathname.startsWith('/projects/') ||
    PROJECT_NAV_ITEMS.some((item) => isActiveNavItem(pathname, item))
  );
}
