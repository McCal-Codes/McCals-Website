import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import styles from '@/pages/one-nation-divided.module.css';

type ThemedLinkProps = {
  href?: string;
  to?: string;
  children: ReactNode;
  external?: boolean;
};

export function ThemedLink({ href, to, children, external = false }: ThemedLinkProps) {
  const className = styles.link;
  
  if (to) {
    return (
      <Link to={to} className={className}>
        {children}
      </Link>
    );
  }
  
  return (
    <a 
      href={href} 
      className={className}
      {...(external && { target: '_blank', rel: 'noopener noreferrer' })}
    >
      {children}
    </a>
  );
}
