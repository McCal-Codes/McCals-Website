import SectionCard from '@/components/SectionCard';
import { useAuthSession } from '@/lib/auth';
import { runtimeConfig } from '@/lib/runtime';

const ENV_KEYS = [
  'VERCEL_CLIENT_ID',
  'VERCEL_CLIENT_SECRET',
  'ADMIN_SESSION_SECRET',
  'ADMIN_ALLOWED_EMAILS or ADMIN_ALLOWED_USERNAMES',
  'PUBLIC_SITE_URL or VITE_PUBLIC_SITE_URL',
  'PUBLIC_API_URL or VITE_PUBLIC_API_URL',
];

const PROJECT_CHECKS = [
  'Create a Sign in with Vercel app in the Integrations Console.',
  'Add the current callback URL to that app before deploying auth changes.',
  'Keep admin-only environment variables in the admin project only.',
  'Use a dedicated internal domain such as admin.mcc-cal.com.',
  'Treat any write-capable admin route as a reviewed backend change, not a quick UI tweak.',
];

export default function SettingsPage() {
  const auth = useAuthSession();

  return (
    <div className="page-grid">
      <SectionCard title="Runtime configuration" eyebrow="Environment">
        <div className="code-table">
          <div className="code-table__row">
            <code>VITE_VERCEL_ENV</code>
            <span>{runtimeConfig.environment}</span>
          </div>
          <div className="code-table__row">
            <code>Auth model</code>
            <span>{auth.authModel}</span>
          </div>
          <div className="code-table__row">
            <code>Callback URL</code>
            <span>{auth.callbackUrl}</span>
          </div>
          <div className="code-table__row">
            <code>PUBLIC_SITE_URL</code>
            <span>{auth.publicSiteUrl || 'Not configured'}</span>
          </div>
          <div className="code-table__row">
            <code>PUBLIC_API_URL</code>
            <span>{auth.publicApiUrl || 'Not configured'}</span>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Expected environment keys" eyebrow="Minimum">
        <ul className="plain-list">
          {ENV_KEYS.map((key) => (
            <li key={key}>{key}</li>
          ))}
        </ul>
      </SectionCard>

      <SectionCard title="Project checklist" eyebrow="Vercel setup">
        <ul className="plain-list">
          {PROJECT_CHECKS.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </SectionCard>

      <SectionCard title="Local commands" eyebrow="Workflow">
        <div className="code-table">
          <div className="code-table__row">
            <code>cd sites/mcc-cal-admin && npm run dev</code>
            <span>Use only for visual work that does not depend on API auth routes.</span>
          </div>
          <div className="code-table__row">
            <code>cd sites/mcc-cal-admin && npm run dev:vercel</code>
            <span>Use for auth flows and any server-side admin route.</span>
          </div>
          <div className="code-table__row">
            <code>cd sites/mcc-cal-admin && npm run build</code>
            <span>Production verification for the admin project.</span>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
