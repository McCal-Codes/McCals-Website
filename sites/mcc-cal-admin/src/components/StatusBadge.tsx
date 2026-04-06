type StatusTone = 'healthy' | 'warning' | 'pending' | 'offline' | 'success' | 'error' | 'confirmed' | 'cancelled' | 'completed';

interface StatusBadgeProps {
  tone: StatusTone;
  label: string;
}

export default function StatusBadge({ tone, label }: StatusBadgeProps) {
  return <span className={`status-badge status-badge--${tone}`}>{label}</span>;
}
