/**
 * Local API Server for Development
 * Proxies /api requests from Vite dev server
 */

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 3001;
const handlers = {
  availability: import('./api/schedule/availability.js'),
  book: import('./api/schedule/book.js'),
  manage: import('./api/schedule/manage.js'),
  contact: import('./api/contact.js'),
  quote: import('./api/quote.js'),
};

async function runHandler(loader, req, res) {
  const mod = await loader;
  return mod.default(req, res);
}

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', env: process.env.NODE_ENV || 'development' });
});

app.get('/api/schedule/availability', async (req, res) => {
  await runHandler(handlers.availability, req, res);
});

app.post('/api/schedule/book', async (req, res) => {
  await runHandler(handlers.book, req, res);
});

// Vercel routes by file path in production; this shim needs each method wired
// explicitly, and self-service management reads on GET and acts on POST.
app.get('/api/schedule/manage', async (req, res) => {
  await runHandler(handlers.manage, req, res);
});

app.post('/api/schedule/manage', async (req, res) => {
  await runHandler(handlers.manage, req, res);
});

app.post('/api/contact', async (req, res) => {
  await runHandler(handlers.contact, req, res);
});

app.post('/api/quote', async (req, res) => {
  await runHandler(handlers.quote, req, res);
});

app.listen(PORT, () => {
  console.log(`[API Server] Running on http://localhost:${PORT}`);
  console.log(`[API Server] Proxied from Vite at http://localhost:5173/api`);
});
