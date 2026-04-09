/**
 * API Proxy Middleware for Dev Server
 * Forwards API requests to the backend API server
 */

const http = require('http');
const https = require('https');
const { URL } = require('url');

const API_HOST = process.env.API_HOST || 'localhost';
const API_PORT = parseInt(process.env.API_PORT, 10) || 3001;

/**
 * Proxy a request to the API server
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
function proxyToAPI(req, res) {
  const options = {
    hostname: API_HOST,
    port: API_PORT,
    path: req.url,
    method: req.method,
    headers: {
      ...req.headers,
      host: `${API_HOST}:${API_PORT}`,
    },
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error('Proxy error:', err.message);
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: 'Bad Gateway',
      message: 'Failed to connect to API server',
      details: err.message,
    }));
  });

  req.pipe(proxyReq);
}

module.exports = {
  proxyToAPI,
};
