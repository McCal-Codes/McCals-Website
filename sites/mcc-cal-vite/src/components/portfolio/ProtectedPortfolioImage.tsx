import type { FC, MouseEvent, ReactNode } from 'react';
import portfolioStyles from './portfolio.module.css';

interface ProtectedPortfolioImageProps {
  children: ReactNode;
  className?: string;
  overlayClassName?: string;
  onDoubleClick?: (event: MouseEvent<HTMLSpanElement>) => void;
}

const ProtectedPortfolioImage: FC<ProtectedPortfolioImageProps> = ({
  children,
  className,
  overlayClassName,
  onDoubleClick,
}) => {
  const rootClassName = `${portfolioStyles.pfProtectedImage}${className ? ` ${className}` : ''}`;
  const shieldClassName = `${portfolioStyles.pfProtectedImageShield}${overlayClassName ? ` ${overlayClassName}` : ''}`;

  return (
    <span
      className={rootClassName}
      onContextMenu={(event) => event.preventDefault()}
      onDragStart={(event) => event.preventDefault()}
      onDoubleClick={onDoubleClick}
    >
      {children}
      <span className={shieldClassName} aria-hidden="true" data-testid="portfolio-image-protection" />
    </span>
  );
};

export default ProtectedPortfolioImage;
