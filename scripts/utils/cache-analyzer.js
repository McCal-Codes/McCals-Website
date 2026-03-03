#!/usr/bin/env node

/**
 * Cache Performance Analyzer
 * Analyzes cache hit/miss rates and performance for API endpoints
 * 
 * Usage:
 *   node scripts/utils/cache-analyzer.js
 *   node scripts/utils/cache-analyzer.js --iterations=10
 *   node scripts/utils/cache-analyzer.js --endpoint=/api/v1/manifests/concert
 */

const https = require('https');

const API_BASE = process.env.API_URL || 'https://api.mcc-cal.com';
const args = process.argv.slice(2);
const iterations = parseInt(args.find(arg => arg.startsWith('--iterations='))?.split('=')[1] || '5');
const specificEndpoint = args.find(arg => arg.startsWith('--endpoint='))?.split('=')[1];

const CACHEABLE_ENDPOINTS = [
  { name: 'Concert Manifest', path: '/api/v1/manifests/concert', expectedTTL: 600 },
  { name: 'Events Manifest', path: '/api/v1/manifests/events', expectedTTL: 600 },
  { name: 'Journalism Manifest', path: '/api/v1/manifests/journalism', expectedTTL: 600 },
  { name: 'Blog Posts', path: '/api/v1/blog/posts', expectedTTL: 300 },
];

function parseUrl(urlString) {
  const url = new URL(urlString);
  return {
    hostname: url.hostname,
    path: url.pathname,
    protocol: url.protocol,
  };
}

function makeRequest(urlString) {
  return new Promise((resolve, reject) => {
    const { hostname, path, protocol } = parseUrl(urlString);
    const startTime = Date.now();
    
    const options = {
      hostname,
      path,
      method: 'GET',
      headers: {
        'User-Agent': 'McCal-Media-Cache-Analyzer/1.0',
      },
    };

    const client = protocol === 'https:' ? https : require('http');
    const req = client.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const duration = Date.now() - startTime;
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data,
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

function parseCacheControl(header) {
  if (!header) return {};
  const parts = header.split(',').map(p => p.trim());
  const result = {};
  
  parts.forEach(part => {
    const [key, value] = part.split('=');
    if (value) {
      result[key.trim()] = parseInt(value);
    } else {
      result[key.trim()] = true;
    }
  });
  
  return result;
}

async function analyzeEndpoint(endpoint) {
  console.log(`\n📊 Analyzing: ${endpoint.name}`);
  console.log(`   Endpoint: ${endpoint.path}`);
  console.log(`   Expected TTL: ${endpoint.expectedTTL}s\n`);

  const results = {
    name: endpoint.name,
    path: endpoint.path,
    expectedTTL: endpoint.expectedTTL,
    requests: [],
    stats: {
      totalRequests: iterations,
      cacheHits: 0,
      cacheMisses: 0,
      hitRate: 0,
      avgDuration: 0,
      avgHitDuration: 0,
      avgMissDuration: 0,
      minDuration: Infinity,
      maxDuration: 0,
    },
  };

  for (let i = 0; i < iterations; i++) {
    try {
      const url = `${API_BASE}${endpoint.path}`;
      const result = await makeRequest(url);
      
      const cacheStatus = result.headers['x-cache'] || 'UNKNOWN';
      const isHit = cacheStatus === 'HIT';
      const cacheControl = parseCacheControl(result.headers['cache-control']);
      
      const requestData = {
        iteration: i + 1,
        statusCode: result.statusCode,
        duration: result.duration,
        cacheStatus,
        isHit,
        cacheControl,
        age: parseInt(result.headers['age']) || 0,
        etag: result.headers['etag'],
      };
      
      results.requests.push(requestData);
      
      // Update stats
      if (isHit) {
        results.stats.cacheHits++;
      } else {
        results.stats.cacheMisses++;
      }
      
      results.stats.minDuration = Math.min(results.stats.minDuration, result.duration);
      results.stats.maxDuration = Math.max(results.stats.maxDuration, result.duration);
      
      // Display progress
      const status = isHit ? '✅ HIT' : '⚠️  MISS';
      console.log(`   Request ${i + 1}/${iterations}: ${status} - ${result.duration}ms (age: ${requestData.age}s)`);
      
      // Small delay between requests
      if (i < iterations - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.log(`   Request ${i + 1}/${iterations}: ❌ ERROR - ${error.message}`);
      results.requests.push({
        iteration: i + 1,
        error: error.message,
      });
    }
  }

  // Calculate final stats
  const successfulRequests = results.requests.filter(r => !r.error);
  const durations = successfulRequests.map(r => r.duration);
  
  results.stats.avgDuration = durations.length
    ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
    : 0;
  
  const hitDurations = successfulRequests.filter(r => r.isHit).map(r => r.duration);
  results.stats.avgHitDuration = hitDurations.length
    ? Math.round(hitDurations.reduce((a, b) => a + b, 0) / hitDurations.length)
    : 0;
  
  const missDurations = successfulRequests.filter(r => !r.isHit).map(r => r.duration);
  results.stats.avgMissDuration = missDurations.length
    ? Math.round(missDurations.reduce((a, b) => a + b, 0) / missDurations.length)
    : 0;
  
  results.stats.hitRate = results.stats.totalRequests
    ? Math.round((results.stats.cacheHits / results.stats.totalRequests) * 100)
    : 0;
  
  // Display summary
  console.log('\n   📈 Statistics:');
  console.log(`      Cache Hits: ${results.stats.cacheHits}/${results.stats.totalRequests} (${results.stats.hitRate}%)`);
  console.log(`      Avg Duration: ${results.stats.avgDuration}ms`);
  console.log(`      Avg Hit Duration: ${results.stats.avgHitDuration}ms`);
  console.log(`      Avg Miss Duration: ${results.stats.avgMissDuration}ms`);
  console.log(`      Min/Max: ${results.stats.minDuration}ms / ${results.stats.maxDuration}ms`);
  
  return results;
}

async function runAnalysis() {
  console.log('\n🔍 Cache Performance Analysis\n');
  console.log(`API Base: ${API_BASE}`);
  console.log(`Iterations: ${iterations}`);
  console.log(`Time: ${new Date().toISOString()}`);
  
  const endpointsToAnalyze = specificEndpoint
    ? CACHEABLE_ENDPOINTS.filter(e => e.path === specificEndpoint)
    : CACHEABLE_ENDPOINTS;

  const allResults = [];
  
  for (const endpoint of endpointsToAnalyze) {
    const result = await analyzeEndpoint(endpoint);
    allResults.push(result);
  }

  // Overall summary
  console.log('\n\n═══════════════════════════════════════');
  console.log('📊 OVERALL SUMMARY');
  console.log('═══════════════════════════════════════\n');
  
  allResults.forEach(result => {
    const hitRateEmoji = result.stats.hitRate >= 80 ? '🟢' : result.stats.hitRate >= 50 ? '🟡' : '🔴';
    console.log(`${hitRateEmoji} ${result.name}`);
    console.log(`   Hit Rate: ${result.stats.hitRate}% | Avg: ${result.stats.avgDuration}ms`);
  });
  
  const overallHitRate = Math.round(
    allResults.reduce((sum, r) => sum + r.stats.hitRate, 0) / allResults.length
  );
  
  console.log(`\n🎯 Overall Cache Hit Rate: ${overallHitRate}%`);
  
  if (overallHitRate >= 80) {
    console.log('   ✅ Excellent! Cache is performing well.');
  } else if (overallHitRate >= 50) {
    console.log('   ⚠️  Good, but could be improved. Check cache TTL settings.');
  } else {
    console.log('   ❌ Poor cache performance. Review cache configuration.');
  }
  
  console.log('\n');
}

runAnalysis().catch(error => {
  console.error('\n❌ Analysis failed:', error.message);
  process.exit(1);
});
