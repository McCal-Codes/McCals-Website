'use client';

import { useEffect, useRef } from 'react';
import { reloadWidget } from '@/utils/widgetHotReload';

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
 * - Development: Serves from /api/widgets/* (local filesystem, hot reload)
 * - Production: Serves from GitHub raw content (cached, versioned)
 *
 * Supports:
 * - Auto-version detection (if version not specified)
 * - Categorical widget organization (portfolios/, _navigation/, etc.)
 * - Debug mode with console logs
 * - Custom styling and error handling
 *
 * Usage:
 * ```tsx
 * <WidgetEmbed widget="concert-portfolio" category="portfolios" />
 * <WidgetEmbed widget="about" category="_content" version="v2.1.0.html" />
 * <WidgetEmbed widget="site-navigation" category="_navigation" />
 * ```
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
  const isDev =
    typeof window !== 'undefined' &&
    /localhost|127\.0\.0\.1|dev\.mcc-cal\.com/.test(window.location.hostname);

  useEffect(() => {
    if (!containerRef.current) return;

    const loadWidget = async () => {
      try {
        // Build API path
        let apiPath = '/api/widgets';
        if (category) {
          apiPath += `/${category}`;
        }
        apiPath += `/${widget}`;
        if (version) {
          apiPath += `/${version}`;
        }

        if (isDev) {
          // Development: Load from API endpoint
          if (process.env.NODE_ENV !== 'production') {
            console.log(`[WidgetEmbed] Loading from API: ${apiPath}`);
          }

          const response = await fetch(apiPath, {
            cache: 'no-store',
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: response.statusText }));
            throw new Error(
              `Failed to load widget: ${response.status} ${response.statusText}. ${errorData.error || ''}`,
            );
          }

          const html = await response.text();

          if (!containerRef.current) return;

          // Inject HTML
          containerRef.current.innerHTML = html;

          // Re-execute scripts (widget initialization)
          const scripts = containerRef.current.querySelectorAll('script');
          scripts.forEach((script) => {
            const newScript = document.createElement('script');

            // Copy attributes
            Array.from(script.attributes).forEach((attr) => {
              newScript.setAttribute(attr.name, attr.value);
            });

            // Copy content
            if (script.textContent) {
              newScript.textContent = script.textContent;
            }

            // Replace the old script
            script.parentNode?.replaceChild(newScript, script);
          });

          if (process.env.NODE_ENV !== 'production') {
            console.log(`[WidgetEmbed] Widget loaded successfully: ${widget}`);
          }

          onLoad?.();
        } else {
          // Production: Load from GitHub
          const owner = 'McCal-Codes';
          const repo = 'McCals-Website';
          const ref = 'main';

          // version is required for GitHub raw content — 'latest' is not a valid ref
          if (!version) {
            throw new Error(`[WidgetEmbed] Widget "${widget}" has no version specified. A version is required in production.`);
          }

          // Build GitHub path
          let githubPath = `src/widgets`;
          if (category) {
            githubPath += `/${category}`;
          }
          githubPath += `/${widget}/versions/${version}`;

          const githubUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${ref}/${githubPath}`;

          if (process.env.NODE_ENV !== 'production') {
            console.log(`[WidgetEmbed] Loading from GitHub: ${githubUrl}`);
          }

          const response = await fetch(githubUrl);

          if (!response.ok) {
            throw new Error(`Failed to load widget from GitHub: ${response.statusText}`);
          }

          const html = await response.text();

          if (!containerRef.current) return;

          // Inject HTML
          containerRef.current.innerHTML = html;

          // --- Manifest Proxy Logic for Dev ---
          // Determine manifest type from widget/category
          const manifestTypeMap: Record<string, string> = {
            'event-portfolio': 'events',
            'concert-portfolio': 'concert',
            'journalism-portfolio': 'journalism',
            'nature-portfolio': 'nature',
            'portrait-portfolio': 'portrait',
            'featured-portfolio': 'featured',
          };
          // Try to infer manifest type
          let manifestType = manifestTypeMap[widget] || widget.replace(/-portfolio$/, '');
          // Patch data-manifest attributes
          const manifestElements = containerRef.current.querySelectorAll('[data-manifest]');
          manifestElements.forEach((el) => {
            const oldUrl = el.getAttribute('data-manifest');
            const newUrl = `/api/manifests/${manifestType}`;
            el.setAttribute('data-manifest', newUrl);
            if (process.env.NODE_ENV !== 'production') {
              console.log(`[WidgetEmbed] Patched data-manifest: ${oldUrl} → ${newUrl}`);
            }
          });
          // Patch global JS variables if present
          // e.g., window.MANIFEST_BASE, MANIFEST_BASE, manifestUrl()
          const scriptNodes = containerRef.current.querySelectorAll('script');
          scriptNodes.forEach((script) => {
            if (script.textContent && /MANIFEST_BASE|manifestUrl/.test(script.textContent)) {
              // Replace manifest URL assignment in script text
              script.textContent = script.textContent.replace(
                /MANIFEST_BASE\s*=\s*['"][^'"]+['"]/g,
                `MANIFEST_BASE='/api/manifests/${manifestType}'`,
              );
              script.textContent = script.textContent.replace(
                /function manifestUrl\(\)\s*{[^}]+}/g,
                `function manifestUrl(){return '/api/manifests/${manifestType}';}`,
              );
              if (process.env.NODE_ENV !== 'production') {
                console.log(`[WidgetEmbed] Patched manifest JS variable(s) for dev mode.`);
              }
            }
          });
          // --- End Manifest Proxy Logic ---

          // Re-execute scripts
          const scriptsToExecute = containerRef.current.querySelectorAll('script');
          scriptsToExecute.forEach((script) => {
            const newScript = document.createElement('script');

            Array.from(script.attributes).forEach((attr) => {
              newScript.setAttribute(attr.name, attr.value);
            });

            if (script.textContent) {
              newScript.textContent = script.textContent;
            }

            script.parentNode?.replaceChild(newScript, script);
          });

          onLoad?.();
        }
      } catch (error) {
        console.error('[WidgetEmbed] Error loading widget:', error);
        const err = error instanceof Error ? error : new Error(String(error));
        onError?.(err);

        if (containerRef.current) {
          containerRef.current.innerHTML = `<div style="color: red; padding: 20px; font-family: monospace; background: #fee; border: 1px solid #fcc; border-radius: 4px;">
            <strong>Error loading widget:</strong><br />
            ${err.message}
          </div>`;
        }
      }
    };

    loadWidget();
  }, [widget, version, category, isDev, onLoad, onError]);

  return <div ref={containerRef} data-widget-container={widget} style={style} className={className} />;
}
