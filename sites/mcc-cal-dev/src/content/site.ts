export const SITE = {
  name: 'McCal Development',
  shortName: 'McCal Dev',
  url: 'https://dev.mcc-cal.com',
  person: 'Caleb McCartney',
  /** The headline. Written as a person, not as a positioning statement. */
  headline: 'I build the tools I wanted to exist.',
  intro:
    'I am a photographer who writes software. Most of what I build starts as a workflow that was worse than it needed to be, usually my own, and turns into an application other people end up using.',
  /** One line under the intro. Concrete, so the headline does not float. */
  focus:
    'Desktop tooling, mobile applications, and the systems underneath them. For photographers, media workflows, and game-development communities.',
  github: 'https://github.com/McCal-Codes',
  /** The editorial photography portfolio. Same person, different medium. */
  portfolio: 'https://mcc-cal.com',
} as const;

export const NAV = [
  { label: 'Projects', to: '/#index' },
  { label: 'Notes', to: '/notes' },
  { label: 'About', to: '/about' },
] as const;

export const EXTERNAL_NAV = [{ label: 'GitHub', href: SITE.github }] as const;

/**
 * The open-source footer block is generated from `github.json` rather than listed
 * here. See `SiteFooter`.
 */
