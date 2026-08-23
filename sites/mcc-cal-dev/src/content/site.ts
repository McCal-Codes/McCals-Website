export const SITE = {
  name: 'McCal Development',
  shortName: 'McCal Dev',
  url: 'https://dev.mcc-cal.com',
  person: 'Caleb McCartney',
  /** The headline. Written as a person, not as a positioning statement. */
  headline: 'Careful persistence.',
  intro:
    'I learn how to do it, then I apply those lessons learned. Or shall we call them happy little accidents: failures.',
  /** One line under the intro. Concrete, so the headline does not float. */
  focus:
    'I am versatile in many skills, but I do just about anything I put my mind to. No matter if it is coding, photographing, or a trade I need to pick up, I am always willing to learn.',
  github: 'https://github.com/McCal-Codes',
  /** The editorial photography portfolio. Same person, different medium. */
  portfolio: 'https://mcc-cal.com',
  /** Tips. Empty until the real URL is supplied; nothing renders without it. */
  kofi: '',
} as const;

export const NAV = [
  { label: 'Projects', to: '/#index' },
  { label: 'Websites', to: '/#websites' },
  { label: 'About', to: '/about' },
] as const;

export const EXTERNAL_NAV = [{ label: 'GitHub', href: SITE.github }] as const;

/**
 * The open-source footer block is generated from `github.json` rather than listed
 * here. See `SiteFooter`.
 */
