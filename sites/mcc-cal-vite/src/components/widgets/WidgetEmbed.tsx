import { useEffect, useRef } from 'react';

interface WidgetEmbedProps {
  widget: string;
  version?: string;
  category?: string;
  style?: React.CSSProperties;
  className?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

/**
 * WidgetEmbed Component
 *
 * Dynamically loads and embeds widget HTML based on environment:
 * - Development: Serves from /api/widgets/* (Vite dev proxy -> local filesystem via Vercel dev)
 * - Production (Vercel): Serves from /api/widgets/* (Vercel serverless functions)
 */
export function WidgetEmbed({
  widget,
  version,
  category,
  style,
  className,
  onLoad,
  onError,
}: WidgetEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const loadWidget = async () => {
      try {
        let apiPath = '/api/widgets';
        if (category) apiPath += `/${category}`;
        apiPath += `/${widget}`;
        if (version) apiPath += `/${version}`;

        const response = await fetch(apiPath, { cache: 'no-store' });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: response.statusText }));
          throw new Error(
            `Failed to load widget: ${response.status} ${response.statusText}. ${(errorData as { error?: string }).error || ''}`,
          );
        }

        const html = await response.text();
        if (!containerRef.current) return;

        // Note: widget HTML content is served from our own controlled repository
        // (local filesystem in dev, GitHub raw in production via serverless function)
        // This is equivalent to the original Next.js site's approach.
        if (containerRef.current) {
          containerRef.current.innerHTML = html; // nosec
        }

        const scripts = containerRef.current?.querySelectorAll('script');
        scripts?.forEach((script) => {
          const newScript = document.createElement('script');
          Array.from(script.attributes).forEach((attr) => {
            newScript.setAttribute(attr.name, attr.value);
          });
          if (script.textContent) newScript.textContent = script.textContent;
          script.parentNode?.replaceChild(newScript, script);
        });

        onLoad?.();
      } catch (error) {
        console.error('[WidgetEmbed] Error loading widget:', error);
        const err = error instanceof Error ? error : new Error(String(error));
        onError?.(err);

        if (containerRef.current) {
          const errDiv = document.createElement('div');
          errDiv.style.cssText = 'color:red;padding:20px;font-family:monospace;background:#fee;border:1px solid #fcc;border-radius:4px';
          errDiv.textContent = `Error loading widget: ${err.message}`;
          containerRef.current.replaceChildren(errDiv);
        }
      }
    };

    loadWidget();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [widget, version, category]);

  return <div ref={containerRef} style={style} className={className} />;
}
