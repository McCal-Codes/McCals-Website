import SectionCard from '@/components/SectionCard';

const OPTIONS = [
  {
    title: 'Git-backed publishing',
    detail: 'Best fit if content remains repo-native. Admin actions create commits or pull requests instead of editing files directly on Vercel.',
  },
  {
    title: 'Headless CMS',
    detail: 'Best fit if multiple nontechnical editors need drafts, approvals, media libraries, and scheduled publishing.',
  },
];

export default function ContentPage() {
  return (
    <div className="page-grid">
      <SectionCard title="Content studio decision" eyebrow="Do not overbuild">
        <p className="lead-copy">
          The legacy standalone admin prototype mixed blog CRUD and file uploads with direct filesystem writes. That
          model is fine for a local Express tool, but it is the wrong foundation for a Vercel-hosted admin app.
        </p>
      </SectionCard>

      <SectionCard title="Why the old approach stops here" eyebrow="Platform fit">
        <ul className="plain-list">
          <li>Vercel Functions are not a durable place to edit repository files in production.</li>
          <li>Direct file writes do not create reviewable history, approvals, or rollback boundaries.</li>
          <li>Image and markdown uploads need either Git workflows or a real content platform.</li>
        </ul>
      </SectionCard>

      <SectionCard title="Future editorial paths" eyebrow="Choose later">
        <div className="feature-grid">
          {OPTIONS.map((option) => (
            <article key={option.title} className="feature-card">
              <h3>{option.title}</h3>
              <p>{option.detail}</p>
            </article>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Recommendation" eyebrow="Current call">
        <p className="lead-copy">
          Ship the admin console as an operations app first. Revisit a true studio only after scheduling, manifests,
          and deployment triage are stable and clearly worth productizing.
        </p>
      </SectionCard>
    </div>
  );
}
