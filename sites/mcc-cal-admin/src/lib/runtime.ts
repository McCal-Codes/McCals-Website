export interface NavItem {
  label: string;
  hint: string;
  to: string;
}

export const runtimeConfig = {
  environment: import.meta.env.VITE_VERCEL_ENV || import.meta.env.MODE || 'development',
};

export const ADMIN_NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', hint: 'Health, boundaries, rollout', to: '/' },
  { label: 'Bookings', hint: 'Scheduling ops scope', to: '/bookings' },
  { label: 'Operations', hint: 'Admin actions and safeguards', to: '/operations' },
  { label: 'Content', hint: 'Publishing model and studio strategy', to: '/content' },
  { label: 'Settings', hint: 'Environment and project setup', to: '/settings' },
];

export const DOC_PATHS = [
  'docs/runbooks/vercel-admin-console.md',
  'docs/runbooks/vercel-production-launch.md',
  'docs/runbooks/vercel-deployment-troubleshooting.md',
];
