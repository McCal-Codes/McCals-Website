import { startTransition, useEffect, useState } from 'react';
import MetricCard from '@/components/MetricCard';
import SectionCard from '@/components/SectionCard';
import StatusBadge from '@/components/StatusBadge';
import { CONTENT_DECISIONS, PHASE_ONE_MODULES, loadDashboardSnapshot } from '@/lib/dashboard';

export default function DashboardPage() {
  const [snapshot, setSnapshot] = useState<Awaited<ReturnType<typeof loadDashboardSnapshot>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function hydrate() {
      setLoading(true);
      setError(null);

      try {
        const nextSnapshot = await loadDashboardSnapshot();
        if (!active) return;
        startTransition(() => {
          setSnapshot(nextSnapshot);
          setLoading(false);
        });
      } catch (cause) {
        if (!active) return;
        setError(cause instanceof Error ? cause.message : 'Failed to load dashboard');
        setLoading(false);
      }
    }

    hydrate();

    return () => {
      active = false;
    };
  }, []);

  const adminHealth = snapshot?.adminHealth;

  return (
    <div className="page-grid">
      <section className="hero-panel">
        <div>
          <p className="hero-panel__eyebrow">Phase 1</p>
          <h2 className="hero-panel__title">Separate internal Vercel app, read-only-first.</h2>
          <p className="hero-panel__copy">
            This console replaces the old standalone admin prototype with a safer boundary: separate project,
            allowlisted Vercel sign-in, and deliberate rollout of admin-only APIs.
          </p>
        </div>
        <div className="hero-panel__status">
          <StatusBadge tone="healthy" label="Public site isolated" />
          <StatusBadge tone="warning" label="Writes deferred" />
          <StatusBadge tone="pending" label="Bookings console next" />
        </div>
      </section>

      <div className="metric-grid">
        <MetricCard
          label="Admin runtime"
          value={loading ? 'Checking' : adminHealth?.service ?? 'Unavailable'}
          tone={adminHealth?.ok ? 'success' : 'warning'}
          detail={adminHealth ? `${adminHealth.version} on ${adminHealth.environment}` : 'Health endpoint pending'}
        />
        <MetricCard
          label="Auth model"
          value={adminHealth?.authModel ?? 'App session gate'}
          detail="Allowlisted Sign in with Vercel keeps admin.mcc-cal.com private without a plan upgrade."
        />
        <MetricCard
          label="Write policy"
          value={adminHealth?.mode ?? 'Read-only'}
          tone="warning"
          detail="No direct repository writes from Vercel Functions."
        />
      </div>

      <SectionCard title="System probes" eyebrow="Live checks">
        {error ? <p className="inline-error">{error}</p> : null}
        <div className="stack-list">
          {(snapshot?.probes ?? []).map((probe) => (
            <div key={probe.label} className="stack-list__item">
              <div>
                <h3>{probe.label}</h3>
                <p>{probe.detail}</p>
              </div>
              <StatusBadge tone={probe.tone} label={probe.tone} />
            </div>
          ))}
          {loading && !snapshot ? <p className="muted-copy">Loading endpoint status...</p> : null}
        </div>
      </SectionCard>

      <SectionCard title="Phase 1 modules" eyebrow="Scope">
        <div className="feature-grid">
          {PHASE_ONE_MODULES.map((module) => (
            <article key={module.title} className="feature-card">
              <h3>{module.title}</h3>
              <p>{module.detail}</p>
            </article>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Hard boundaries" eyebrow="Governance">
        <ul className="plain-list">
          {CONTENT_DECISIONS.map((decision) => (
            <li key={decision}>{decision}</li>
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}
