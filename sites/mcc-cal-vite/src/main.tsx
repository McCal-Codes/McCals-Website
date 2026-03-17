import './styles/globals.css';
import './styles/nav.css';
import './styles/footer.css';
import './styles/abridged.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Apply persisted theme from localStorage before paint
try {
  const t = localStorage.getItem('mcc-theme');
  if (t === 'light' || t === 'dark') {
    document.body.setAttribute('data-theme', t);
  }
} catch (_) {}

// Register service worker in production
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(() => {});
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
