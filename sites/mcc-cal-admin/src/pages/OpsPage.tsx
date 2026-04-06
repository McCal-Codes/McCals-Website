import SectionCard from '@/components/SectionCard';
import StatusBadge from '@/components/StatusBadge';

const OPS_ACTIONS = [
  {
    title: 'Manifest refresh',
    detail: 'Wrap webhook refresh endpoints or build-time regeneration triggers in admin-only server routes.',
    tone: 'warning' as const,
  },
  {
    title: 'Cache verification',
    detail: 'Surface timestamps, cache hit indicators, and mismatch checks before adding destructive cache actions.',
    tone: 'pending' as const,
  },
  {
    title: 'Deployment triage',
    detail: 'Link to Vercel logs, inspections, and runbooks instead of duplicating platform tooling.',
    tone: 'healthy' as const,
  },
];

export default function OpsPage() {
  return (
    <div className="page-grid">
      <SectionCard title="Operations layer" eyebrow="Serverless-safe">
        <p className="lead-copy">
          This app should centralize operational actions, but only after each action has a narrow server-side boundary
          and an obvious rollback path.
        </p>
      </SectionCard>

      <SectionCard title="Current priorities" eyebrow="Action design">
        <div className="stack-list">
          {OPS_ACTIONS.map((action) => (
            <div key={action.title} className="stack-list__item">
              <div>
                <h3>{action.title}</h3>
                <p>{action.detail}</p>
              </div>
              <StatusBadge tone={action.tone} label={action.tone} />
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Implementation checklist" eyebrow="Guardrails">
        <ul className="plain-list">
          <li>Use admin-only API routes inside `sites/mcc-cal-admin/api/` for actions that must run server-side.</li>
          <li>Make every write action explicit, idempotent where possible, and logged.</li>
          <li>Prefer linking to Vercel-native logs and deployment history instead of rebuilding them in UI.</li>
          <li>Expose dry-run or preview output before any destructive admin operation.</li>
        </ul>
      </SectionCard>
    </div>
  );
}
