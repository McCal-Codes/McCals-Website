import { useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';

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
          // Sanitize HTML before injection to prevent XSS attacks
          const clean = DOMPurify.sanitize(html, {
            ALLOWED_TAGS: ['div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                          'ul', 'ol', 'li', 'a', 'img', 'button', 'form', 'input',
                          'textarea', 'label', 'select', 'option', 'br', 'hr',
                          'strong', 'em', 'table', 'thead', 'tbody', 'tr', 'td', 'th'],
            ALLOWED_ATTR: ['class', 'id', 'href', 'src', 'alt', 'title', 'type', 'name',
                          'value', 'placeholder', 'for', 'style', 'width', 'height',
                          'target', 'rel', 'checked', 'selected', 'disabled', 'rows', 'cols']
          });
          containerRef.current.innerHTML = clean;
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
