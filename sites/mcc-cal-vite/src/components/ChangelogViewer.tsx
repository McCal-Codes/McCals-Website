import React, { useState } from 'react';
import { getChangelog, clearChangelog, exportChangelogAsText, exportChangelogAsJSON } from '../utils/changelogTracker';
import type { ChangelogEntry } from '../utils/changelogTracker';

const ChangelogViewer: React.FC = () => {
  const [entries, setEntries] = useState<ChangelogEntry[]>(() => getChangelog());
  const [confirmClear, setConfirmClear] = useState(false);

  const handleClear = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }

    clearChangelog();
    setEntries([]);
    setConfirmClear(false);
  };

  const handleExportText = () => {
    const text = exportChangelogAsText();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `changelog-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    const json = exportChangelogAsJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `changelog-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'update':
        return '#4CAF50'; // green
      case 'add':
        return '#2196F3'; // blue
      case 'view':
        return '#FF9800'; // orange
      default:
        return '#999';
    }
  };

  const getActionEmoji = (action: string) => {
    switch (action) {
      case 'update':
        return '📝';
      case 'add':
        return '➕';
      case 'view':
        return '👁️';
      default:
        return '📋';
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Dev Site Changelog Tracker</h2>
      <p style={{ color: '#666' }}>
        Tracks widget views and updates automatically. {entries.length} entries recorded.
      </p>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          onClick={handleExportText}
          style={{
            padding: '10px 20px',
            background: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Export as Text
        </button>
        <button
          onClick={handleExportJSON}
          style={{
            padding: '10px 20px',
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Export as JSON
        </button>
        <button
          onClick={handleClear}
          style={{
            padding: '10px 20px',
            background: confirmClear ? '#b71c1c' : '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          {confirmClear ? 'Confirm Clear' : 'Clear All'}
        </button>
      </div>

      {entries.length === 0 ? (
        <p style={{ color: '#999', fontStyle: 'italic' }}>
          No changelog entries yet. Visit some widget pages to get started!
        </p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '14px',
            }}
          >
            <thead>
              <tr style={{ borderBottom: '2px solid #ddd' }}>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: 'bold' }}>
                  Action
                </th>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: 'bold' }}>
                  Widget
                </th>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: 'bold' }}>
                  Version
                </th>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: 'bold' }}>
                  Date/Time
                </th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, idx) => (
                <tr
                  key={idx}
                  style={{
                    borderBottom: '1px solid #eee',
                    backgroundColor: idx % 2 === 0 ? '#f9f9f9' : 'white',
                  }}
                >
                  <td
                    style={{
                      padding: '12px',
                      color: getActionColor(entry.action),
                      fontWeight: '600',
                    }}
                  >
                    {getActionEmoji(entry.action)} {entry.action.toUpperCase()}
                  </td>
                  <td style={{ padding: '12px', fontFamily: 'monospace', fontSize: '12px' }}>
                    {entry.widget}
                  </td>
                  <td style={{ padding: '12px', fontFamily: 'monospace', fontSize: '12px' }}>
                    {entry.version}
                  </td>
                  <td style={{ padding: '12px', color: '#666', fontSize: '13px' }}>
                    {entry.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ChangelogViewer;
