import { startTransition, Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AppShell from '@/components/AppShell';
import { AuthSessionContext, loadAuthSession, type AuthSessionState } from '@/lib/auth';

const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const BookingsPage = lazy(() => import('@/pages/BookingsPage'));
const OpsPage = lazy(() => import('@/pages/OpsPage'));
const ContentPage = lazy(() => import('@/pages/ContentPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const SetupPage = lazy(() => import('@/pages/SetupPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

function PageLoader() {
  return (
    <section className="auth-screen">
      <div className="page-loader" role="status" aria-live="polite">
        <span className="page-loader__dot" />
        Loading admin console...
      </div>
    </section>
  );
}

function AppBootError({ detail }: { detail: string }) {
  return (
    <section className="auth-screen">
      <div className="auth-card">
        <p className="hero-panel__eyebrow">Startup failure</p>
        <h1 className="auth-card__title">The admin session bootstrap failed.</h1>
        <p className="auth-card__copy">{detail}</p>
      </div>
    </section>
  );
}

function ProtectedRoutes() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/bookings" element={<BookingsPage />} />
        <Route path="/operations" element={<OpsPage />} />
        <Route path="/content" element={<ContentPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AppShell>
  );
}

function UnauthenticatedRoutes({ configured }: { configured: boolean }) {
  if (!configured) {
    return (
      <Routes>
        <Route path="*" element={<SetupPage />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  const [session, setSession] = useState<AuthSessionState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function hydrate() {
      setLoading(true);
      setError(null);

      try {
        const nextSession = await loadAuthSession();
        if (!active) return;

        startTransition(() => {
          setSession(nextSession);
          setLoading(false);
        });
      } catch (cause) {
        if (!active) return;

        setError(cause instanceof Error ? cause.message : 'Failed to load admin session');
        setLoading(false);
      }
    }

    hydrate();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <PageLoader />;
  }

  if (error || !session) {
    return <AppBootError detail={error ?? 'Admin session unavailable.'} />;
  }

  return (
    <BrowserRouter>
      <AuthSessionContext.Provider value={session}>
        <Suspense fallback={<PageLoader />}>
          {session.authenticated ? <ProtectedRoutes /> : <UnauthenticatedRoutes configured={session.configured} />}
        </Suspense>
      </AuthSessionContext.Provider>
    </BrowserRouter>
  );
}
