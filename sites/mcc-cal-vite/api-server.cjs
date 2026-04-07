/**
 * Local API Server for Development
 * Proxies /api requests from Vite dev server
 */

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', env: process.env.NODE_ENV || 'development' });
});

// API Routes
const availabilityHandler = require('./src/pages/api/schedule/availability.js');
const bookHandler = require('./src/pages/api/schedule/book.js');

app.get('/api/schedule/availability', async (req, res) => {
  await availabilityHandler.default(req, res);
});

app.post('/api/schedule/book', async (req, res) => {
  await bookHandler.default(req, res);
});

// Contact and Quote routes (existing APIs)
const contactHandler = require('./src/pages/api/contact.js');
const quoteHandler = require('./src/pages/api/quote.js');

app.post('/api/contact', async (req, res) => {
  await contactHandler.default(req, res);
});

app.post('/api/quote', async (req, res) => {
  await quoteHandler.default(req, res);
});

app.listen(PORT, () => {
  console.log(`[API Server] Running on http://localhost:${PORT}`);
  console.log(`[API Server] Proxied from Vite at http://localhost:5173/api`);
});
