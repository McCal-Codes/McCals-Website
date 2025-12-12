/**
 * Manifest Display Component
 *
 * Displays manifest data and portfolio statistics
 * Part of Phase 2: Next.js components implementation
 */

import { Manifest } from '../utils/api-client';

interface ManifestDisplayProps {
  manifest?: Manifest | null;
  type: string;
  loading?: boolean;
  error?: string;
}

export default function ManifestDisplay({ manifest, type, loading, error }: ManifestDisplayProps) {
  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Loading {type} manifest...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: '20px',
          backgroundColor: '#ffebee',
          borderRadius: '4px',
          color: '#c62828',
        }}
      >
        <p>Error loading {type} manifest:</p>
        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{error}</pre>
      </div>
    );
  }

  if (!manifest) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
        <p>No {type} manifest loaded yet.</p>
      </div>
    );
  }

  const stats = {
    totalImages: manifest.totalImages || 0,
    bands: manifest.bands?.length || 0,
    events: manifest.events?.length || 0,
    stories: manifest.stories?.length || 0,
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h2 style={{ marginTop: 0 }}>{type.charAt(0).toUpperCase() + type.slice(1)} Manifest</h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '15px',
          marginBottom: '20px',
        }}
      >
        {stats.totalImages > 0 && (
          <div style={{ padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '4px' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1976d2' }}>
              {stats.totalImages}
            </div>
            <div style={{ fontSize: '12px', color: '#555' }}>Total Images</div>
          </div>
        )}

        {stats.bands > 0 && (
          <div style={{ padding: '15px', backgroundColor: '#f3e5f5', borderRadius: '4px' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#7b1fa2' }}>
              {stats.bands}
            </div>
            <div style={{ fontSize: '12px', color: '#555' }}>Concert Bands</div>
          </div>
        )}

        {stats.events > 0 && (
          <div style={{ padding: '15px', backgroundColor: '#e8f5e9', borderRadius: '4px' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#388e3c' }}>
              {stats.events}
            </div>
            <div style={{ fontSize: '12px', color: '#555' }}>Events</div>
          </div>
        )}

        {stats.stories > 0 && (
          <div style={{ padding: '15px', backgroundColor: '#fff3e0', borderRadius: '4px' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f57c00' }}>
              {stats.stories}
            </div>
            <div style={{ fontSize: '12px', color: '#555' }}>Stories</div>
          </div>
        )}
      </div>

      <div style={{ fontSize: '12px', color: '#666' }}>
        <p>
          <strong>Generated:</strong>{' '}
          {manifest.generatedAt ? new Date(manifest.generatedAt).toLocaleString() : 'Unknown'}
        </p>
      </div>

      {manifest.bands && manifest.bands.length > 0 && (
        <div>
          <h3>Bands ({manifest.bands.length})</h3>
          <ul style={{ marginTop: '10px', listStyle: 'none', padding: 0 }}>
            {manifest.bands.slice(0, 10).map((band, idx) => (
              <li
                key={idx}
                style={{
                  padding: '8px',
                  borderBottom: '1px solid #eee',
                  fontSize: '14px',
                }}
              >
                <strong>{band.bandName}</strong> ({band.concerts?.length || 0} concerts)
              </li>
            ))}
          </ul>
          {manifest.bands.length > 10 && (
            <p style={{ color: '#999', fontSize: '12px' }}>
              +{manifest.bands.length - 10} more bands...
            </p>
          )}
        </div>
      )}

      {manifest.events && manifest.events.length > 0 && (
        <div>
          <h3>Events ({manifest.events.length})</h3>
          <ul style={{ marginTop: '10px', listStyle: 'none', padding: 0 }}>
            {manifest.events.slice(0, 10).map((event, idx) => (
              <li
                key={idx}
                style={{
                  padding: '8px',
                  borderBottom: '1px solid #eee',
                  fontSize: '14px',
                }}
              >
                <strong>{event.eventName}</strong>{' '}
                <span style={{ color: '#999' }}>({event.category})</span>
              </li>
            ))}
          </ul>
          {manifest.events.length > 10 && (
            <p style={{ color: '#999', fontSize: '12px' }}>
              +{manifest.events.length - 10} more events...
            </p>
          )}
        </div>
      )}
    </div>
  );
}
