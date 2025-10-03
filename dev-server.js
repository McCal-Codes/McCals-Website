#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';
const SITE_DIR = __dirname; // Serve from repo root to access all files
const IS_PRODUCTION = process.argv.includes('--production');

// MIME types for different file extensions
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || 'application/octet-stream';
}

function serveFile(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('File not found');
      return;
    }

    const mimeType = getMimeType(filePath);
    res.writeHead(200, { 'Content-Type': mimeType });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  // Enable CORS for development
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  let filePath = path.join(SITE_DIR, req.url === '/' ? 'src/site/index.html' : req.url);
  
  // Security check - prevent directory traversal
  if (!filePath.startsWith(SITE_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // If file doesn't exist, try to serve index.html for SPA routing
      filePath = path.join(SITE_DIR, 'src/site/index.html');
    }
    
    serveFile(res, filePath);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`🚀 McCal Media Dev Server running at http://${HOST}:${PORT}/`);
  console.log(`📁 Serving files from: ${SITE_DIR}`);
  console.log(`🔄 Mode: ${IS_PRODUCTION ? 'Production' : 'Development'}`);
  console.log('');
  console.log('Available commands:');
  console.log('  npm run dev     - Start development server');
  console.log('  npm run serve   - Start production server');
  console.log('  npm run build   - Build for production');
  console.log('');
  
  if (!IS_PRODUCTION) {
    console.log('💡 Tip: Press Ctrl+C to stop the server');
    
    // Try to open browser automatically
    const open = () => {
      try {
        require('open')(`http://${HOST}:${PORT}`);
      } catch (e) {
        console.log('📱 Open your browser and navigate to the URL above');
      }
    };
    
    setTimeout(open, 1000);
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down dev server...');
  server.close(() => {
    process.exit(0);
  });
});