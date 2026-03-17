/**
 * Widget Hot Reload Utility
 * 
 * Provides utilities for hot-reloading widgets during development
 * without requiring a full page refresh.
 */

export interface ReloadOptions {
  /** Force reload by busting cache with query parameter */
  bustCache?: boolean;
  /** Show notification when reload completes */
  showNotification?: boolean;
}

/**
 * Reload a specific widget on the current page
 * 
 * Example:
 * ```tsx
 * import { reloadWidget } from '@/utils/widgetHotReload';
 * 
 * // In a dev-only button
 * <button onClick={() => reloadWidget('photojournalism-portfolio', 'v5.2.0-performance-optimized.html')}>
 *   Reload Widget
 * </button>
 * ```
 */
export async function reloadWidget(
  widget: string,
  version: string,
  options: ReloadOptions = {}
): Promise<void> {
  const { bustCache = true, showNotification = true } = options;

  try {
    // Construct the URL with cache busting if needed
    let url = `/api/widgets/${widget}/${version}`;
    if (bustCache) {
      url += `?t=${Date.now()}`;
    }

    // Fetch the latest widget HTML
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Failed to fetch widget: ${response.statusText}`);
    }
    const html = await response.text();

    // Find and update the widget container
    // Assumes the container has id="widget-container" or similar
    const container = document.querySelector('[data-widget-container]') || 
                     document.querySelector('.widget-embed') ||
                     document.querySelector('[class*="widget"]');

    if (!container) {
      console.warn('Widget container not found for hot reload');
      return;
    }

    // Clear the container
    container.innerHTML = html;

    // Re-execute scripts (same pattern as WidgetEmbed component)
    const scripts = container.querySelectorAll('script');
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

    if (showNotification) {
      showReloadNotification(`✅ Widget "${widget}" reloaded`);
    }
  } catch (error) {
    console.error('Error reloading widget:', error);
    if (showNotification) {
      showReloadNotification(`❌ Failed to reload widget: ${error}`, 'error');
    }
  }
}

/**
 * Reload all widgets on the current page
 * Useful after a global widget framework change
 */
export async function reloadAllWidgets(_options: ReloadOptions = {}): Promise<void> {
  if (typeof window === 'undefined') return;

  // This would typically be called on pages that have multiple widgets
  // For now, just reload the page (can be made more sophisticated)
  window.location.reload();
}

/**
 * Setup a keyboard shortcut for quick widget reloading
 * Default: Ctrl/Cmd + Shift + W
 * 
 * Example:
 * ```tsx
 * useEffect(() => {
 *   setupWidgetReloadShortcut('photojournalism-portfolio', 'v5.2.0-performance-optimized.html');
 * }, []);
 * ```
 */
export function setupWidgetReloadShortcut(
  widget: string,
  version: string,
  key: string = 'w'
): () => void {
  const handleKeyPress = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === key.toLowerCase()) {
      e.preventDefault();
      reloadWidget(widget, version, { showNotification: true });
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleKeyPress);
  }

  // Return cleanup function
  return () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', handleKeyPress);
    }
  };
}

/**
 * Show a temporary notification (dev-only UI)
 */
function showReloadNotification(message: string, type: 'success' | 'error' = 'success'): void {
  if (typeof window === 'undefined') return;

  // Create notification element
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 12px 16px;
    background-color: ${type === 'success' ? '#10b981' : '#ef4444'};
    color: white;
    border-radius: 6px;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 14px;
    z-index: 10000;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    animation: slideIn 0.3s ease-out;
  `;
  notification.textContent = message;

  // Add animation styles
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(400px);
        opacity: 0;
      }
    }
  `;
  if (!document.querySelector('style[data-widget-reload]')) {
    style.setAttribute('data-widget-reload', 'true');
    document.head.appendChild(style);
  }

  document.body.appendChild(notification);

  // Auto-remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}
