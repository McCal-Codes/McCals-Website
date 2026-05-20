/**
 * StoryCitations component - Displays and copies post citations
 */

import { useEffect, useState } from 'react';
import type { BlogSource } from '@/types/blog';
import { formatCitation, copyTextWithFallback } from './utils';

interface StoryCitationsProps {
  sources?: BlogSource[];
}

export default function StoryCitations({ sources }: StoryCitationsProps) {
  const citations = (sources || []).map(formatCitation).filter(Boolean);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');

  useEffect(() => {
    if (copyState === 'idle') return;

    const timer = window.setTimeout(() => setCopyState('idle'), 2200);
    return () => window.clearTimeout(timer);
  }, [copyState]);

  if (citations.length === 0) return null;

  async function copyCitations() {
    const citationText = citations
      .map((citation, index) => `${index + 1}. ${citation}`)
      .join('\n\n');

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(citationText);
      } else if (!copyTextWithFallback(citationText)) {
        throw new Error('Clipboard API unavailable');
      }

      setCopyState('copied');
    } catch {
      try {
        if (!copyTextWithFallback(citationText)) {
          throw new Error('Copy fallback failed');
        }

        setCopyState('copied');
      } catch {
        setCopyState('error');
      }
    }
  }

  return (
    <details className="story__citations">
      <summary className="story__citations-summary">
        <span>Sources</span>
        <span>{citations.length}</span>
      </summary>
      <div className="story__citations-panel">
        <div className="story__citations-actions">
          <p className="story__citations-intro">
            Review the supporting sources and copy the formatted list when needed.
          </p>
          <button type="button" className="story__citations-copy" onClick={copyCitations}>
            Copy sources
          </button>
          {copyState === 'copied' && (
            <span className="story__citations-status" role="status" aria-live="polite">
              Copied
            </span>
          )}
          {copyState === 'error' && (
            <span
              className="story__citations-status story__citations-status--error"
              role="status"
              aria-live="polite"
            >
              Copy failed
            </span>
          )}
        </div>

        <ol className="story__citations-list">
          {citations.map((citation, index) => (
            <li key={`${citation}-${index}`} className="story__citations-item">
              <p>{citation}</p>
            </li>
          ))}
        </ol>
      </div>
    </details>
  );
}
