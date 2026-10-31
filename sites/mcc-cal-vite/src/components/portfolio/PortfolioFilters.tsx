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
    // Not a tablist. These filter a grid in place; they do not switch between
    // panels, and the markup carried none of what a tablist needs: no
    // aria-controls, no tabpanel, no roving tabindex or arrow-key handling. It
    // also set aria-pressed, which is not an allowed attribute on role="tab",
    // so axe reported it as critical. A group of toggle buttons is what these
    // actually are, and aria-pressed is correct on a button.
    <div className={portfolioStyles.pfFilters} role="group" aria-label="Portfolio filters">
      {filters.map((f) => (
        <button
          key={f}
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
