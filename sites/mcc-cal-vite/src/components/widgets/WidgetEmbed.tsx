import { useEffect, useRef } from 'react';

interface WidgetEmbedProps {
  widget: string;
  category?: string;
  version?: string;
}

/**
 * WidgetEmbed - Embeds external widget HTML content
 * 
 * This component loads widget HTML files from the src/widgets/ directory
 * and injects them into the page. Used for dev bridge pages that preview
 * production widget versions.
 */
export function WidgetEmbed({ widget, category, version }: WidgetEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Build widget path based on category and version
    const widgetFile = version || `${widget}.html`;
    const widgetPath = category
      ? `../../../src/widgets/${category}/${widget}/versions/${widgetFile}`
      : `../../../src/widgets/${widget}/versions/${widgetFile}`;

    // Fetch and inject widget HTML
    fetch(widgetPath)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load widget: ${res.status}`);
        return res.text();
      })
      .then((html) => {
        if (containerRef.current) {
          containerRef.current.innerHTML = html;
          
          // Execute any scripts in the injected HTML
          const scripts = containerRef.current.querySelectorAll('script');
          scripts.forEach((script) => {
            const newScript = document.createElement('script');
            if (script.src) {
              newScript.src = script.src;
            } else {
              newScript.textContent = script.textContent;
            }
            script.parentNode?.replaceChild(newScript, script);
          });
        }
      })
      .catch((err) => {
        console.error('Widget load error:', err);
        if (containerRef.current) {
          containerRef.current.innerHTML = `<div class="widget-error">Failed to load widget: ${widget}</div>`;
        }
      });
  }, [widget, category, version]);

  return <div ref={containerRef} className="widget-embed" data-widget={widget} />;
}
