#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { proxyToAPI } = require('./src/api/proxy-middleware');
const net = require('net');

// Base/default port preference
const BASE_PORT = parseInt(process.env.PORT, 10) || 3000;
let PORT = BASE_PORT;
const HOST = process.env.HOST || 'localhost';
// Determine which folder to serve. Default is the repo root which contains `src/site/`.
// You can set the SERVE_TARGET env var or pass `--serve=dist` or `--serve=src` on the CLI.
const argvServe = process.argv.find(a => a.startsWith('--serve='));
const SERVE_TARGET = process.env.SERVE_TARGET || (argvServe ? argvServe.split('=')[1] : null);

let SITE_DIR = __dirname; // default: repo root

if (SERVE_TARGET === 'dist') {
  SITE_DIR = path.join(__dirname, 'dist');
} else if (SERVE_TARGET === 'src' || SERVE_TARGET === 'site') {
  SITE_DIR = __dirname;
}
const IS_PRODUCTION = process.argv.includes('--production');
const ENABLE_API_PROXY = process.argv.includes('--with-api') || process.env.ENABLE_API_PROXY === 'true';

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

function createServer() {
  return http.createServer((req, res) => {
  // Enable CORS for development
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Proxy API requests if enabled
  if (ENABLE_API_PROXY && req.url.startsWith('/api/')) {
    return proxyToAPI(req, res);
  }

  // allow per-request override via query param `?root=dist` or `?root=src` or `?root=site`
  // Normalize the incoming pathname to a relative path (no leading slash) before joining with
  // any base folders. This avoids path.join treating the pathname as absolute and bypassing
  // our SITE_DIR checks.
  try {
    const parsed = new URL(req.url, `http://localhost`);
    const rootParam = parsed.searchParams.get('root');
    const relPath = parsed.pathname === '/' ? 'index.html' : parsed.pathname.replace(/^\//, '');

    if (rootParam === 'dist') {
      // serve from dist for this request only
      filePath = path.join(__dirname, 'dist', relPath);
    } else if (rootParam === 'src') {
      // serve from the local site source folder (src/site)
      filePath = path.join(__dirname, 'src', 'site', relPath);
    } else if (rootParam === 'site') {
      // The canonical "self-hosted site" is the running Next.js server.
      // Redirect to the configured Next server port so users land on the running app.
      // Configure port with NEXT_SERVER_PORT env var (default: 3005).
      const nextPort = process.env.NEXT_SERVER_PORT || 3005;
      const nextHost = process.env.NEXT_SERVER_HOST || 'localhost';
      const nextUrl = `http://${nextHost}:${nextPort}/`;
      res.writeHead(302, { Location: nextUrl });
      res.end(`Redirecting to ${nextUrl}`);
      return;
    } else {
      // Special-case: always allow the repository-level serve selector page to be requested
      // regardless of SITE_DIR. This makes the selection UI available even when the server
      // is configured to serve `dist` or other folders.
      if (parsed.pathname === '/serve-select.html') {
        filePath = path.join(__dirname, 'serve-select.html');
      } else {
        // Default: serve from SITE_DIR's src/site folder to keep behavior stable
        filePath = path.join(SITE_DIR, 'src', 'site', relPath);
      }
    }
  } catch (e) {
    // On parse errors, fall back to the default index in the site source
    filePath = path.join(SITE_DIR, 'src', 'site', 'index.html');
  }
  
  // Security check - prevent directory traversal
  try {
    const resolvedSite = path.resolve(SITE_DIR) + path.sep;
    const resolvedFile = path.resolve(filePath);
    if (!resolvedFile.startsWith(resolvedSite)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }
  } catch (e) {
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
}

function startServer(attempt = 0) {
  const server = createServer();
  // Handle protocol upgrades (WebSocket / HTTP Upgrade) and proxy them to the API server when
  // the request targets `/api/*`. The `proxyToAPI` helper uses a simple HTTP client for normal
  // requests but doesn't handle upgrades — browsers may initiate WebSocket upgrades and the
  // default client path returns a 426 or fails. We proxy upgrade handshakes through to the
  // API server and then pipe raw sockets.
  server.on('upgrade', (req, socket, head) => {
    try {
      // Only proxy upgrades for API routes
      if (!req.url || !req.url.startsWith('/api/')) {
        socket.end();
        return;
      }

      const apiOptions = {
        hostname: 'localhost',
        port: 3001,
        path: req.url,
        headers: req.headers,
        method: req.method
      };

      const proxyReq = http.request(apiOptions);

      proxyReq.on('upgrade', (proxyRes, proxySocket, proxyHead) => {
        // Write the status line and headers from the upstream to the client socket
        const statusLine = `HTTP/${proxyRes.httpVersion} ${proxyRes.statusCode} ${proxyRes.statusMessage}\r\n`;
        socket.write(statusLine);
        Object.keys(proxyRes.headers || {}).forEach((h) => {
          socket.write(`${h}: ${proxyRes.headers[h]}\r\n`);
        });
        socket.write('\r\n');

        if (proxyHead && proxyHead.length) proxySocket.write(proxyHead);

        // Pipe the sockets together
        proxySocket.pipe(socket);
        socket.pipe(proxySocket);
      });

      proxyReq.on('error', (err) => {
        console.error('Upgrade proxy error:', err && err.message);
        try { socket.end(); } catch (e) {}
      });

      // End the client proxy request (this triggers the upgrade handshake to the API)
      proxyReq.end();
    } catch (e) {
      try { socket.end(); } catch (err) {}
    }
  });
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE' && attempt < 15) {
      PORT += 1; // increment and retry
      if (attempt === 0) {
        console.log(`⚠️  Port ${PORT - 1} in use. Searching for a free port...`);
      }
      setTimeout(() => startServer(attempt + 1), 100);
    } else if (err.code === 'EADDRINUSE') {
      console.error('❌ Could not find a free port after multiple attempts. Aborting.');
      process.exit(1);
    } else {
      console.error('Server error:', err);
      process.exit(1);
    }
  });

  server.listen(PORT, HOST, () => {
    const picked = PORT !== BASE_PORT;
    console.log(`🚀 McCal Media Dev Server running at http://${HOST}:${PORT}/`);
    console.log(`📂 Serving from: ${SITE_DIR}`);
    if (picked) {
      console.log(`🔀 Auto-selected free port (base was ${BASE_PORT}).`);
    }
    console.log(`📁 Serving files from: ${SITE_DIR}`);
    console.log(`🔄 Mode: ${IS_PRODUCTION ? 'Production' : 'Development'}`);
        if (ENABLE_API_PROXY) {
          console.log(`🔗 API Proxy: Enabled (forwarding to localhost:3001)`);
        }
    console.log('');
    console.log('Available commands:');
    console.log('  npm run dev     - Start development server');
    console.log('  npm run serve   - Start production server');
    console.log('  npm run build   - Build for production');
    console.log('');
    
    if (!IS_PRODUCTION) {
      console.log('💡 Tip: Press Ctrl+C to stop the server');
      if (picked) {
        console.log('ℹ️  Set PORT env var to lock a specific port, e.g. PORT=3010 npm run dev');
      }
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

    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n👋 Shutting down dev server...');
      server.close(() => {
        process.exit(0);
      });
    });
  });
}

startServer();