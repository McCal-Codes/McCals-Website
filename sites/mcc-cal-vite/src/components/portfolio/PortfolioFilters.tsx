import type { FC } from 'react';
import { portfolioStyles } from './index';

interface PortfolioFiltersProps {
  filters: string[];
  active: string;
  onChange: (filter: string) => void;
}

const PortfolioFilters: FC<PortfolioFiltersProps> = ({ filters, active, onChange }) => {
  if (filters.length === 0) return null;

  return (
    <div className={portfolioStyles.pfFilters} role="tablist" aria-label="Portfolio filters">
      {filters.map((f) => (
        <button
          key={f}
          role="tab"
          type="button"
          className={portfolioStyles.pfFilterBtn}
          aria-pressed={active === f}
          onClick={() => onChange(f)}
        >
          {f}
        </button>
      ))}
    </div>
  );
};

export default PortfolioFilters;
