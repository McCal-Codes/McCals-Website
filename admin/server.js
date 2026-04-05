/**
 * Standalone Admin Server for Blog CMS
 * Run with: node admin/server.js
 * Or integrate into your existing dev server
 */

const express = require('express');
const path = require('path');
const adminApi = require('./api.js');

const app = express();
const PORT = process.env.ADMIN_PORT || 3333;

app.use(express.json());

// CORS for local dev
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Admin API routes
app.use('/admin/api', adminApi);

// Serve portfolio images for the gallery
app.use('/images', express.static(path.join(__dirname, '..', 'src', 'images')));

// Serve admin UI
app.use('/admin', express.static(path.join(__dirname)));

// Health check
app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'admin' });
});

app.listen(PORT, () => {
  console.log(`✅ Admin server running at http://localhost:${PORT}/admin/`);
  console.log(`   API endpoints at http://localhost:${PORT}/admin/api/`);
});
