import type { FC } from 'react';
import { portfolioStyles } from './index';

interface PortfolioLoadMoreProps {
  remaining: number;
  onLoadMore: () => void;
}

const PortfolioLoadMore: FC<PortfolioLoadMoreProps> = ({ remaining, onLoadMore }) => {
  if (remaining <= 0) return null;

  return (
    <div className={portfolioStyles.pfLoadMore}>
      <button type="button" className={portfolioStyles.pfLoadMoreBtn} onClick={onLoadMore}>
        <span>Load More</span>
        <span className={portfolioStyles.pfLoadMoreRemaining}>+{remaining}</span>
      </button>
    </div>
  );
};

export default PortfolioLoadMore;
