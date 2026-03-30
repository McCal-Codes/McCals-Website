import './styles/globals.css';
import './styles/nav.css';
import './styles/footer.css';
import './styles/abridged.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { SpeedInsights } from '@vercel/speed-insights/react';
import App from './App';

// Apply persisted theme from localStorage before paint
try {
  const t = localStorage.getItem('mcc-theme');
  if (t === 'light' || t === 'dark') {
    document.body.setAttribute('data-theme', t);
  }
} catch (_) {}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <SpeedInsights />
  </React.StrictMode>,
);
