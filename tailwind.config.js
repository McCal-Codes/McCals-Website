/**
 * Tailwind config for Interactive Thesis page.
 * Minimal custom tokens; extend as thesis evolves.
 */
module.exports = {
  content: [
    './thesis/**/*.html',
    './src/pages/thesis/**/*.jsx'
  ],
  theme: {
    extend: {
      colors: {
        ink: '#1a1a1a',
        accent: '#0b5fff',
        accentMuted: '#6fa8ff',
        paper: '#f8f9fa',
        edge: '#e2e8f0'
      },
      fontFamily: {
        display: ['system-ui', 'Segoe UI', 'Helvetica Neue', 'Arial'],
        body: ['system-ui', 'Helvetica', 'Arial', 'sans-serif']
      },
      spacing: {
        '2xs': '0.125rem',
        'xs': '0.5rem',
        'sm': '0.75rem',
        'md': '1rem',
        'lg': '1.5rem',
        'xl': '2.5rem'
      },
      boxShadow: {
        focus: '0 0 0 3px rgba(11,95,255,0.35)'
      }
    }
  },
  darkMode: 'media'
};
