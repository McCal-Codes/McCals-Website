import type { FC } from 'react';

interface PortfolioLoadMoreProps {
  remaining: number;
  onLoadMore: () => void;
}

const PortfolioLoadMore: FC<PortfolioLoadMoreProps> = ({ remaining, onLoadMore }) => {
  if (remaining <= 0) return null;

  return (
    <div className="pf-load-more">
      <button type="button" className="pf-load-more__btn" onClick={onLoadMore}>
        <span>Load More</span>
        <span className="pf-load-more__remaining">+{remaining}</span>
      </button>
    </div>
  );
};

export default PortfolioLoadMore;
