import React from 'react';

const THEME_KEY = 'mcc-theme';

function getInitialTheme(): 'dark' | 'light' {
  try {
    const stored = typeof window !== 'undefined' && window.localStorage.getItem(THEME_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  } catch (e) {}
  return 'dark';
}

export default function ThemeToggle() {
  const [theme, setTheme] = React.useState<'dark' | 'light'>(() =>
    typeof window !== 'undefined' ? getInitialTheme() : 'dark'
  );

  React.useEffect(() => {
    try {
      document.body.setAttribute('data-theme', theme);
      window.localStorage.setItem(THEME_KEY, theme);
    } catch (e) {}
  }, [theme]);

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return (
    <button
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
      title={`Theme: ${theme}`}
      onClick={toggle}
      style={{
        position: 'fixed',
        right: 16,
        bottom: 16,
        width: 44,
        height: 44,
        borderRadius: 9999,
        border: '1px solid rgba(255,255,255,0.06)',
        background: theme === 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.85)',
        color: theme === 'dark' ? '#fff' : '#111',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 6px 18px rgba(2,6,23,0.45)',
        zIndex: 9999,
        cursor: 'pointer',
      }}
    >
      {theme === 'dark' ? '☾' : '☀'}
    </button>
  );
}
