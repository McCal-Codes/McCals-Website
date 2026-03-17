import React, { useState } from 'react';
import { reloadWidget } from '@/utils/widgetHotReload';

interface WidgetReloaderProps {
  widget: string;
  version: string;
}

/**
 * WidgetReloader: Dev-only component for hot-reloading widgets
 * 
 * Shows in development mode only with a button to refresh the widget
 * without requiring a full page reload.
 * 
 * Usage: <WidgetReloader widget="photojournalism-portfolio" version="v5.2.0-performance-optimized.html" />
 */
const WidgetReloader: React.FC<WidgetReloaderProps> = ({ widget, version }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastReload, setLastReload] = useState<string | null>(null);

  // Only show in development mode
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return null;
  }

  const handleReload = async () => {
    setIsLoading(true);
    try {
      await reloadWidget(widget, version, { showNotification: false });
      setLastReload(new Date().toLocaleTimeString());
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        backgroundColor: '#f3f4f6',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        padding: '12px 16px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '12px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      }}
    >
      <div style={{ marginBottom: '8px', fontWeight: '600', color: '#111' }}>
        🔄 Widget Reloader
      </div>
      <div style={{ marginBottom: '10px', color: '#666', fontSize: '11px' }}>
        <div>Widget: <code style={{ backgroundColor: '#fff', padding: '2px 4px', borderRadius: '3px' }}>{widget}</code></div>
        <div>Version: <code style={{ backgroundColor: '#fff', padding: '2px 4px', borderRadius: '3px' }}>{version}</code></div>
      </div>
      <button
        onClick={handleReload}
        disabled={isLoading}
        style={{
          width: '100%',
          padding: '6px 12px',
          backgroundColor: isLoading ? '#9ca3af' : '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          fontSize: '11px',
          fontWeight: '600',
          transition: 'background-color 0.2s',
        }}
        onMouseEnter={(e) => {
          if (!isLoading) (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb';
        }}
        onMouseLeave={(e) => {
          if (!isLoading) (e.target as HTMLButtonElement).style.backgroundColor = '#3b82f6';
        }}
      >
        {isLoading ? 'Reloading...' : 'Reload Widget'}
      </button>
      {lastReload && (
        <div style={{ marginTop: '8px', color: '#059669', fontSize: '10px' }}>
          ✓ Last reload: {lastReload}
        </div>
      )}
      <div style={{ marginTop: '8px', color: '#666', fontSize: '10px', fontStyle: 'italic' }}>
        💡 Tip: Press <kbd style={{ backgroundColor: '#fff', padding: '2px 4px', borderRadius: '3px' }}>Ctrl+Shift+W</kbd> to reload
      </div>
    </div>
  );
};

export { WidgetReloader };
export default WidgetReloader;
