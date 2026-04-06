import { useAuthSession } from '@/lib/auth';

const REQUIRED_KEYS = [
  'VERCEL_CLIENT_ID',
  'VERCEL_CLIENT_SECRET',
  'ADMIN_SESSION_SECRET',
  'ADMIN_ALLOWED_EMAILS or ADMIN_ALLOWED_USERNAMES',
  'PUBLIC_SITE_URL or VITE_PUBLIC_SITE_URL',
  'PUBLIC_API_URL or VITE_PUBLIC_API_URL',
];

export default function SetupPage() {
  const auth = useAuthSession();

  return (
    <section className="auth-screen">
      <div className="auth-card auth-card--wide">
        <p className="hero-panel__eyebrow">Setup required</p>
        <h1 className="auth-card__title">Admin auth is not configured on this deployment.</h1>
        <p className="auth-card__copy">
          The custom-domain admin app now expects app-level authentication. Finish the Vercel OAuth setup before using
          this deployment as the internal console.
        </p>

        <div className="feature-grid">
          <article className="feature-card">
            <h3>Callback URL</h3>
            <p>
              <code>{auth.callbackUrl}</code>
            </p>
          </article>
          <article className="feature-card">
            <h3>Required keys</h3>
            <ul className="plain-list">
              {REQUIRED_KEYS.map((key) => (
                <li key={key}>{key}</li>
              ))}
            </ul>
          </article>
        </div>

        <div className="stack-list">
          {auth.setupChecklist.map((item) => (
            <div key={item} className="stack-list__item">
              <div>
                <h3>Next step</h3>
                <p>{item}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
