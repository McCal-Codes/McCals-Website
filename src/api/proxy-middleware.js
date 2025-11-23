/**
 * Simple API Proxy Middleware
 * 
 * Forwards API requests from the dev server to the API server
 * This allows widgets to call /api/* on the same origin during development
 */

const http = require('http');

const API_HOST = 'localhost';
const API_PORT = 3001;

function proxyToAPI(req, res) {
  const options = {
    hostname: API_HOST,
    port: API_PORT,
    path: req.url,
    method: req.method,
    headers: req.headers,
  };

  const proxyReq = http.request(options, (proxyRes) => {
    // Copy status code
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    
    // Pipe response
    proxyRes.pipe(res);
  });

  // Handle errors
  proxyReq.on('error', (err) => {
    console.error(`❌ API Proxy Error: ${err.message}`);
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: 'Bad Gateway',
      message: `API server not reachable at ${API_HOST}:${API_PORT}`,
      suggestion: 'Make sure API server is running: npm run api:dev',
    }));
  });

  // Pipe request body
  req.pipe(proxyReq);
}

module.exports = { proxyToAPI };
