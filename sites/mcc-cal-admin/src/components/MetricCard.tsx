interface MetricCardProps {
  label: string;
  value: string | number;
  tone?: 'neutral' | 'success' | 'warning' | 'error';
  detail: string;
}

export default function MetricCard({
  label,
  value,
  tone = 'neutral',
  detail,
}: MetricCardProps) {
  return (
    <article className={`metric-card metric-card--${tone}`}>
      <p className="metric-card__label">{label}</p>
      <p className="metric-card__value">{value}</p>
      <p className="metric-card__detail">{detail}</p>
    </article>
  );
}
