import { getAuthErrorMessage, useAuthSession } from '@/lib/auth';
import { useLocation } from 'react-router-dom';

export default function LoginPage() {
  const auth = useAuthSession();
  const location = useLocation();
  const error = getAuthErrorMessage(new URLSearchParams(location.search).get('error'));

  return (
    <section className="auth-screen">
      <div className="auth-card">
        <p className="hero-panel__eyebrow">admin.mcc-cal.com</p>
        <h1 className="auth-card__title">Internal admin access only.</h1>
        <p className="auth-card__copy">
          This console is protected with allowlisted Sign in with Vercel. Only explicitly approved operator accounts
          can enter.
        </p>

        {error ? <p className="inline-error">{error}</p> : null}

        <div className="auth-actions">
          <a className="button-link" href={auth.loginPath}>
            Sign in with Vercel
          </a>
        </div>

        <div className="auth-meta">
          <p>
            Callback URL:
            <code>{auth.callbackUrl}</code>
          </p>
          <p>
            Probe targets:
            <code>{auth.publicSiteUrl || 'Not configured'}</code>
            <code>{auth.publicApiUrl || 'Not configured'}</code>
          </p>
        </div>
      </div>
    </section>
  );
}
