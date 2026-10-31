const vercelEnv = import.meta.env.VITE_VERCEL_ENV;

export default function PreviewBanner() {
  if (vercelEnv !== 'preview') return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 99999,
        background: 'rgba(234, 197, 71, 0.95)',
        color: '#111',
        fontSize: '0.78rem',
        fontWeight: 700,
        letterSpacing: '0.06em',
        textAlign: 'center',
        padding: '6px 16px',
        backdropFilter: 'blur(8px)',
        fontFamily: 'ui-monospace, monospace',
        pointerEvents: 'none',
      }}
      role="status"
      aria-label="Preview deployment indicator"
    >
      ⚡ PREVIEW DEPLOYMENT, not indexed, not production
    </div>
  );
}
