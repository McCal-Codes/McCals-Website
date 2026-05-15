/**
 * Admin Dashboard Component
 * 
 * Displays admin controls and system status
 * Part of Phase 2: Next.js components implementation
 */

import { useState } from 'react';

interface AdminDashboardProps {
  apiUrl: string;
  onRefreshManifests?: () => Promise<void>;
  onClearCache?: () => Promise<void>;
}

interface SystemStatus {
  apiHealth: 'ok' | 'degraded' | 'down';
  cacheStatus: 'active' | 'inactive';
  manifestCount: number;
  lastUpdate: string;
  uptime: number;
}

export default function AdminDashboard({
  apiUrl,
  onRefreshManifests,
  onClearCache,
}: AdminDashboardProps) {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  async function checkStatus() {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/v1/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        setStatus({
          apiHealth: 'ok',
          cacheStatus: data.cache?.active ? 'active' : 'inactive',
          manifestCount: data.manifests?.count || 0,
          lastUpdate: data.lastUpdate || new Date().toISOString(),
          uptime: data.uptime || 0,
        });
      } else {
        setStatus({
          apiHealth: 'degraded',
          cacheStatus: 'inactive',
          manifestCount: 0,
          lastUpdate: new Date().toISOString(),
          uptime: 0,
        });
      }
    } catch {
      setStatus({
        apiHealth: 'down',
        cacheStatus: 'inactive',
        manifestCount: 0,
        lastUpdate: new Date().toISOString(),
        uptime: 0,
      });
    }
    setLoading(false);
  }

  async function handleRefreshManifests() {
    if (!onRefreshManifests) return;

    setLoading(true);
    try {
      await onRefreshManifests();
      setMessage({ type: 'success', text: 'Manifests refreshed successfully' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: `Failed to refresh manifests: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
    setLoading(false);
  }

  async function handleClearCache() {
    if (!onClearCache) return;

    setLoading(true);
    try {
      await onClearCache();
      setMessage({ type: 'success', text: 'Cache cleared successfully' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: `Failed to clear cache: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
    setLoading(false);
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Admin Dashboard</h1>

      {message && (
        <div
          style={{
            marginBottom: '20px',
            padding: '12px 16px',
            backgroundColor: message.type === 'success' ? '#e8f5e9' : '#ffebee',
            color: message.type === 'success' ? '#2e7d32' : '#c62828',
            borderRadius: '4px',
            border: `1px solid ${message.type === 'success' ? '#4caf50' : '#f44336'}`,
          }}
        >
          {message.text}
        </div>
      )}

      <div style={{ marginBottom: '30px' }}>
        <h2>System Status</h2>

        {status ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '15px',
            }}
          >
            <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '4px' }}>
              <div style={{ fontSize: '12px', color: '#999', marginBottom: '5px' }}>
                API Health
              </div>
              <div
                style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color:
                    status.apiHealth === 'ok'
                      ? '#4caf50'
                      : status.apiHealth === 'degraded'
                      ? '#ff9800'
                      : '#f44336',
                }}
              >
                {status.apiHealth.toUpperCase()}
              </div>
            </div>

            <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '4px' }}>
              <div style={{ fontSize: '12px', color: '#999', marginBottom: '5px' }}>
                Cache Status
              </div>
              <div
                style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: status.cacheStatus === 'active' ? '#4caf50' : '#ff9800',
                }}
              >
                {status.cacheStatus.toUpperCase()}
              </div>
            </div>

            <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '4px' }}>
              <div style={{ fontSize: '12px', color: '#999', marginBottom: '5px' }}>
                Manifests
              </div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1976d2' }}>
                {status.manifestCount}
              </div>
            </div>

            <div style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '4px' }}>
              <div style={{ fontSize: '12px', color: '#999', marginBottom: '5px' }}>
                Uptime
              </div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#7b1fa2' }}>
                {Math.round(status.uptime / 3600)}h
              </div>
            </div>
          </div>
        ) : (
          <p>Click "Check Status" to load system information</p>
        )}
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2>Actions</h2>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={checkStatus}
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#2196f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1,
            }}
          >
            {loading ? 'Loading...' : 'Check Status'}
          </button>

          {onRefreshManifests && (
            <button
              onClick={handleRefreshManifests}
              disabled={loading}
              style={{
                padding: '10px 20px',
                backgroundColor: '#4caf50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1,
              }}
            >
              {loading ? 'Refreshing...' : 'Refresh Manifests'}
            </button>
          )}

          {onClearCache && (
            <button
              onClick={handleClearCache}
              disabled={loading}
              style={{
                padding: '10px 20px',
                backgroundColor: '#ff9800',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1,
              }}
            >
              {loading ? 'Clearing...' : 'Clear Cache'}
            </button>
          )}
        </div>
      </div>

      <div style={{ padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
        <h3 style={{ marginTop: 0 }}>Notes</h3>
        <ul style={{ margin: '0', paddingLeft: '20px' }}>
          <li>
            API Health: Status of the Cloudflare Worker API endpoint
          </li>
          <li>
            Cache Status: Whether manifest caching is active
          </li>
          <li>
            Manifests: Number of available portfolio manifests
          </li>
          <li>
            Uptime: How long the API has been running
          </li>
        </ul>
      </div>
    </div>
  );
}
