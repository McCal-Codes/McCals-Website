import React, { useEffect, useRef, useState } from 'react';
import { addChangelogEntry } from '../../utils/changelogTracker';

interface WidgetEmbedProps {
  /** Widget folder name (e.g., 'photojournalism-portfolio') */
  widget: string;
  /** Widget version file (e.g., 'v5.2.0-performance-optimized.html') */
  version: string;
  /** Additional className for wrapper div */
  className?: string;
}

/**
 * WidgetEmbed: Loads and renders actual production widget HTML directly
 * - During development: Loads from local API endpoint (watches for file changes)
 * - In production: Loads from GitHub raw content (ensures consistent deployment)
 * Automatically tracks widget views in the changelog
 * Enables changelog modal functionality from the widget's version indicator
 * 
 * Usage: <WidgetEmbed widget="photojournalism-portfolio" version="v5.2.0-performance-optimized.html" />
 */
const WidgetEmbed: React.FC<WidgetEmbedProps> = ({ widget, version, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef<boolean>(false);
  const [isDev] = useState(() => typeof window !== 'undefined' && window.location.hostname === 'localhost');

  useEffect(() => {
    if (!containerRef.current) return;

    // Avoid loading the same widget twice
    if (loadedRef.current) return;
    loadedRef.current = true;

    // Track widget view in changelog
    addChangelogEntry(widget, version, 'view');

    // Determine widget URL based on environment
    // Dev: Load from local API proxy (picks up file changes automatically)
    // Prod: Load from GitHub (frozen version for consistency)
    const widgetUrl = isDev
      ? `/api/widgets/${widget}/${version}`
      : `https://raw.githubusercontent.com/McCal-Codes/McCals-Website/main/src/widgets/${widget}/versions/${version}`;

    // Fetch and inject the widget HTML
    const loadWidget = async () => {
      try {
        const response = await fetch(widgetUrl, {
          // Disable caching in dev mode so file updates are picked up immediately
          ...(isDev && { cache: 'no-store' }),
        });
        if (!response.ok) throw new Error(`Failed to load widget: ${response.statusText}`);
        const html = await response.text();

        // Clear container and set HTML
        containerRef.current!.innerHTML = html;

        // Re-execute any scripts in the injected HTML (critical for widget functionality)
        const scripts = containerRef.current!.querySelectorAll('script');
        scripts.forEach((oldScript) => {
          const newScript = document.createElement('script');
          if (oldScript.textContent) {
            newScript.textContent = oldScript.textContent;
          } else if (oldScript.src) {
            newScript.src = oldScript.src;
            newScript.async = true;
          }
          newScript.type = oldScript.type || 'text/javascript';
          document.body.appendChild(newScript);
        });

        // Ensure the widget's changelog functions are available globally
        // This allows the version indicator click handler to work
        if (typeof window !== 'undefined') {
          // If the widget defines showChangelog/hideChangelog, they'll be in the script
          // If not, define fallback functions
          if (!window.showChangelog) {
            (window as any).showChangelog = () => {
              const modal = containerRef.current?.querySelector('.changelog-modal');
              if (modal) {
                modal.classList.add('active');
                modal.setAttribute('aria-hidden', 'false');
              }
            };
          }
          if (!window.hideChangelog) {
            (window as any).hideChangelog = () => {
              const modal = containerRef.current?.querySelector('.changelog-modal');
              if (modal) {
                modal.classList.remove('active');
                modal.setAttribute('aria-hidden', 'true');
              }
            };
          }
        }
      } catch (error) {
        console.error('Error loading widget:', error);
        if (containerRef.current) {
          containerRef.current.innerHTML = `<div style="padding: 20px; color: #999; text-align: center;">Failed to load widget: ${widget}</div>`;
        }
      }
    };

    loadWidget();

    // Cleanup
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [widget, version, isDev]);

  return <div ref={containerRef} className={className} />;
};

export default WidgetEmbed;
