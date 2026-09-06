import { Component, type ReactNode } from 'react';
import { captureError } from '@/lib/sentry-lazy';
import { logError } from '@/utils/logger';
import { trackWebsiteEvent } from '@/utils/analytics';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * React Error Boundary for graceful error handling
 * Wrap routes or components to catch errors and display fallback UI
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  override componentDidUpdate(prevProps: Props) {
    if (this.state.hasError && prevProps.children !== this.props.children) {
      this.setState({ hasError: false, error: undefined });
    }
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logError('ErrorBoundary caught an error:', error, errorInfo);
    captureError(error, { componentStack: errorInfo.componentStack });

    // Sentry already has the full error and component stack, with PII scrubbing
    // and masking configured. Sending the same text to GA4 would push
    // unscrubbed message content — which can contain URLs, ids or user input —
    // into an analytics product configured for none of that, and componentStack
    // would blow past GA4's 100-character parameter limit anyway. A stable name
    // is all that is needed to see how often this happens.
    trackWebsiteEvent('error_boundary_caught', {
      error_name: error.name || 'Error',
    });
  }

  override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Colours come from the site's own tokens rather than literals: the old
      // #666 on the dark background measured 3.37:1, so the one message a
      // visitor reads when the site has already broken was itself unreadable.
      return (
        <div
          role="alert"
          style={{
            padding: '2rem',
            textAlign: 'center',
            minHeight: '50vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--mcc-fg)',
          }}
        >
          <h2 style={{ marginBottom: '1rem' }}>Something went wrong</h2>
          <p style={{ color: 'var(--mcc-fg-muted)', marginBottom: '1.5rem', maxWidth: '46ch' }}>
            This part of the page failed to load. Refreshing usually fixes it — if it keeps
            happening, I&apos;d like to know.
          </p>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.75rem',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'var(--mcc-accent)',
                color: 'var(--mcc-bg)',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Refresh page
            </button>
            {/* Plain anchors: the router itself may be the thing that failed. */}
            <a href="/" style={{ color: 'var(--mcc-fg-muted)', padding: '0.75rem 1rem' }}>
              Go home
            </a>
            <a href="/contact-us" style={{ color: 'var(--mcc-fg-muted)', padding: '0.75rem 1rem' }}>
              Report this
            </a>
          </div>
          {import.meta.env.DEV && this.state.error && (
            <pre
              style={{
                marginTop: '2rem',
                padding: '1rem',
                background: 'var(--mcc-chip)',
                border: '1px solid var(--mcc-line)',
                borderRadius: '4px',
                textAlign: 'left',
                maxWidth: '100%',
                overflow: 'auto',
              }}
            >
              {this.state.error.toString()}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
