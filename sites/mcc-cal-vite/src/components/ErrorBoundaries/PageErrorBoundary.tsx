import React from 'react';
import { logError } from '@/utils/logger';
import ErrorBoundary from './ErrorBoundary';
import styles from './PageErrorBoundary.module.css';

interface PageErrorBoundaryProps {
  children: React.ReactNode;
  pageName?: string;
}

const PageErrorBoundary: React.FC<PageErrorBoundaryProps> = ({ 
  children, 
  pageName = 'Page' 
}) => {
  const fallback = (
    <div className={styles.pageErrorContainer}>
      <div className={styles.pageErrorContent}>
        <div className={styles.errorIcon}>⚠️</div>
        <h1 className={styles.errorTitle}>Page Error</h1>
        <p className={styles.errorMessage}>
          The {pageName} page encountered an error. This might be due to:
        </p>
        <ul className={styles.errorList}>
          <li>Network connectivity issues</li>
          <li>Temporary server problems</li>
          <li>Browser compatibility issues</li>
          <li>Corrupted page data</li>
        </ul>
        <div className={styles.errorActions}>
          <button 
            onClick={() => window.location.reload()} 
            className={styles.primaryButton}
          >
            Reload Page
          </button>
          <button 
            onClick={() => window.history.back()} 
            className={styles.secondaryButton}
          >
            Go Back
          </button>
        </div>
        <div className={styles.helpSection}>
          <p className={styles.helpText}>
            If the problem persists, please contact support or try accessing a different page.
          </p>
          <div className={styles.quickLinks}>
            <a href="/" className={styles.link}>Home</a>
            <a href="/about" className={styles.link}>About</a>
            <a href="/contact-us" className={styles.link}>Contact</a>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <ErrorBoundary 
      fallback={fallback}
      onError={(error, errorInfo) => {
        logError(`Error in ${pageName} page:`, {
          error: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          timestamp: new Date().toISOString(),
          page: pageName,
          url: window.location.href,
          userAgent: navigator.userAgent,
        });

        // In production, you might send this to an error tracking service
        if (import.meta.env.PROD) {
          // Example: Sentry.captureException(error, { extra: { pageName, errorInfo } });
        }
      }}
    >
      {children}
    </ErrorBoundary>
  );
};

export default PageErrorBoundary;
