#!/usr/bin/env node

/**
 * API Health Check Script
 * Monitors all api.mcc-cal.com endpoints and reports status
 * 
 * Usage:
 *   node scripts/utils/health-check.js
 *   node scripts/utils/health-check.js --json
 *   node scripts/utils/health-check.js --endpoint=/api/v1/manifests/concert
 */

const https = require('https');

const API_BASE = process.env.API_URL || 'https://api.mcc-cal.com';
const args = process.argv.slice(2);
const outputJson = args.includes('--json');
const specificEndpoint = args.find(arg => arg.startsWith('--endpoint='))?.split('=')[1];

const ENDPOINTS = [
  { name: 'Health Check', path: '/health', method: 'GET', expectStatus: 200 },
  { name: 'Concert Manifest', path: '/api/v1/manifests/concert', method: 'GET', expectStatus: 200 },
  { name: 'Events Manifest', path: '/api/v1/manifests/events', method: 'GET', expectStatus: 200 },
  { name: 'Journalism Manifest', path: '/api/v1/manifests/journalism', method: 'GET', expectStatus: 200 },
  { name: 'Blog Posts', path: '/api/v1/blog/posts', method: 'GET', expectStatus: 200 },
];

function makeRequest(url, method = 'GET') {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const req = https.request(url, { method }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const duration = Date.now() - startTime;
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data,
          duration,
        });
      });
    });
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    req.end();
  });
}

async function checkEndpoint(endpoint) {
  const url = `${API_BASE}${endpoint.path}`;
  try {
    const result = await makeRequest(url, endpoint.method);
    const success = result.statusCode === endpoint.expectStatus;
    
    return {
      name: endpoint.name,
      path: endpoint.path,
      success,
      statusCode: result.statusCode,
      duration: result.duration,
      cached: result.headers['x-cache'] === 'HIT',
      cacheControl: result.headers['cache-control'],
      error: null,
    };
  } catch (error) {
    return {
      name: endpoint.name,
      path: endpoint.path,
      success: false,
      statusCode: null,
      duration: null,
      cached: false,
      error: error.message,
    };
  }
}

async function runHealthCheck() {
  const results = {
    timestamp: new Date().toISOString(),
    apiBase: API_BASE,
    endpoints: [],
    summary: {
      total: 0,
      passed: 0,
      failed: 0,
      avgDuration: 0,
      cacheHitRate: 0,
    },
  };

  const endpointsToCheck = specificEndpoint
    ? ENDPOINTS.filter(e => e.path === specificEndpoint)
    : ENDPOINTS;

  if (!outputJson) {
    console.log('\n🏥 API Health Check\n');
    console.log(`API Base: ${API_BASE}`);
    console.log(`Time: ${results.timestamp}\n`);
  }

  for (const endpoint of endpointsToCheck) {
    if (!outputJson) {
      process.stdout.write(`Checking ${endpoint.name}... `);
    }
    
    const result = await checkEndpoint(endpoint);
    results.endpoints.push(result);
    
    if (!outputJson) {
      if (result.success) {
        console.log(`✅ ${result.statusCode} (${result.duration}ms)${result.cached ? ' [CACHED]' : ''}`);
      } else {
        console.log(`❌ ${result.statusCode || 'FAILED'} - ${result.error || 'Unexpected status'}`);
      }
    }
  }

  // Calculate summary
  results.summary.total = results.endpoints.length;
  results.summary.passed = results.endpoints.filter(e => e.success).length;
  results.summary.failed = results.summary.total - results.summary.passed;
  
  const durations = results.endpoints.filter(e => e.duration).map(e => e.duration);
  results.summary.avgDuration = durations.length
    ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
    : 0;
  
  const cacheableEndpoints = results.endpoints.filter(e => e.path !== '/health');
  const cachedHits = cacheableEndpoints.filter(e => e.cached).length;
  results.summary.cacheHitRate = cacheableEndpoints.length
    ? Math.round((cachedHits / cacheableEndpoints.length) * 100)
    : 0;

  if (outputJson) {
    console.log(JSON.stringify(results, null, 2));
  } else {
    console.log('\n📊 Summary:');
    console.log(`  Total: ${results.summary.total}`);
    console.log(`  Passed: ${results.summary.passed}`);
    console.log(`  Failed: ${results.summary.failed}`);
    console.log(`  Avg Duration: ${results.summary.avgDuration}ms`);
    console.log(`  Cache Hit Rate: ${results.summary.cacheHitRate}%\n`);
  }

  // Exit with error code if any failed
  process.exit(results.summary.failed > 0 ? 1 : 0);
}

runHealthCheck().catch(error => {
  console.error('Health check failed:', error);
  process.exit(1);
});
