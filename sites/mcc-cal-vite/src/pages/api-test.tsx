/**
 * API Integration Test Page
 * 
 * Tests the Cloudflare Worker API endpoints and verifies CORS is working
 * with dev.mcc-cal.com domain.
 * 
 * Accessible at: http://localhost:3000/api-test
 */

import { useState, useEffect } from 'react';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error' | 'warning';
  message: string;
  duration?: number;
  details?: unknown;
}

interface APIHealth {
  apiUrl: string;
  domain: string;
  timestamp: string;
  tests: TestResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
  };
}

export default function APITestPage() {
  const [results, setResults] = useState<APIHealth | null>(null);
  const [running, setRunning] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL || 'https://api.mcc-cal.com';
  const BLOG_BASE = `${window.location.origin}/content/blog-static`;

  async function runTests() {
    setRunning(true);
    const testResults: TestResult[] = [];
    const startTime = Date.now();

    // Test 1: CORS Preflight
    try {
      const startTest = Date.now();
      const response = await fetch(`${API_BASE}/api/v1/manifests/concert`, {
        method: 'OPTIONS',
        headers: {
          'Origin': window.location.origin,
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'Content-Type',
        },
      });
      const duration = Date.now() - startTest;

      if (
        response.headers.get('Access-Control-Allow-Origin') === window.location.origin ||
        response.headers.get('Access-Control-Allow-Origin') === '*'
      ) {
        testResults.push({
          name: 'CORS Preflight',
          status: 'success',
          message: `CORS headers present from ${window.location.origin}`,
          duration,
        });
      } else {
        testResults.push({
          name: 'CORS Preflight',
          status: 'warning',
          message: `CORS Allow-Origin: ${response.headers.get('Access-Control-Allow-Origin')}`,
          duration,
        });
      }
    } catch (error) {
      testResults.push({
        name: 'CORS Preflight',
        status: 'error',
        message: `CORS preflight failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: error,
      });
    }

    // Test 2: Concert Manifest
    try {
      const startTest = Date.now();
      const response = await fetch(`${API_BASE}/api/v1/manifests/concert`);
      const duration = Date.now() - startTest;

      if (response.ok) {
        const data = await response.json();
        testResults.push({
          name: 'Concert Manifest',
          status: 'success',
          message: `Successfully fetched concert manifest (${Object.keys(data).length} properties)`,
          duration,
          details: { totalImages: data.totalImages, bandCount: data.bands?.length },
        });
      } else {
        testResults.push({
          name: 'Concert Manifest',
          status: 'error',
          message: `HTTP ${response.status}: ${response.statusText}`,
          duration,
        });
      }
    } catch (error) {
      testResults.push({
        name: 'Concert Manifest',
        status: 'error',
        message: `Failed to fetch concert manifest: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: error,
      });
    }

    // Test 3: Events Manifest
    try {
      const startTest = Date.now();
      const response = await fetch(`${API_BASE}/api/v1/manifests/events`);
      const duration = Date.now() - startTest;

      if (response.ok) {
        const data = await response.json();
        testResults.push({
          name: 'Events Manifest',
          status: 'success',
          message: `Successfully fetched events manifest (${Object.keys(data).length} properties)`,
          duration,
          details: { totalImages: data.totalImages, eventCount: data.events?.length },
        });
      } else {
        testResults.push({
          name: 'Events Manifest',
          status: 'error',
          message: `HTTP ${response.status}: ${response.statusText}`,
          duration,
        });
      }
    } catch (error) {
      testResults.push({
        name: 'Events Manifest',
        status: 'error',
        message: `Failed to fetch events manifest: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: error,
      });
    }

    // Test 4: Journalism Manifest
    try {
      const startTest = Date.now();
      const response = await fetch(`${API_BASE}/api/v1/manifests/journalism`);
      const duration = Date.now() - startTest;

      if (response.ok) {
        const data = await response.json();
        testResults.push({
          name: 'Journalism Manifest',
          status: 'success',
          message: `Successfully fetched journalism manifest`,
          duration,
          details: { totalImages: data.totalImages },
        });
      } else {
        testResults.push({
          name: 'Journalism Manifest',
          status: 'error',
          message: `HTTP ${response.status}: ${response.statusText}`,
          duration,
        });
      }
    } catch (error) {
      testResults.push({
        name: 'Journalism Manifest',
        status: 'error',
        message: `Failed to fetch journalism manifest: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: error,
      });
    }

    // Test 5: Blog Content
    try {
      const startTest = Date.now();
      const response = await fetch(`${BLOG_BASE}/blog-manifest.json`, {
        cache: 'no-store',
      });
      const duration = Date.now() - startTest;

      if (response.ok) {
        const data = await response.json();
        const firstPost = data.posts?.[0];
        testResults.push({
          name: 'Blog Content',
          status: 'success',
          message: `Successfully fetched static blog content`,
          duration,
          details: { postCount: data.posts?.length || 0, firstSlug: firstPost?.slug || null },
        });
      } else {
        testResults.push({
          name: 'Blog Content',
          status: 'error',
          message: `HTTP ${response.status}: ${response.statusText}`,
          duration,
        });
      }
    } catch (error) {
      testResults.push({
        name: 'Blog Content',
        status: 'warning',
        message: `Static blog content: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: error,
      });
    }

    // Test 6: Rate Limiting Headers
    try {
      const response = await fetch(`${API_BASE}/api/v1/manifests/portrait`);
      const rateLimit = response.headers.get('X-RateLimit-Remaining');
      const rateLimitLimit = response.headers.get('X-RateLimit-Limit');

      if (rateLimit !== null && rateLimitLimit !== null) {
        testResults.push({
          name: 'Rate Limiting',
          status: 'success',
          message: `Rate limiting active (${rateLimit}/${rateLimitLimit} remaining)`,
          details: { remaining: rateLimit, limit: rateLimitLimit },
        });
      } else {
        testResults.push({
          name: 'Rate Limiting',
          status: 'warning',
          message: 'Rate limiting headers not present',
        });
      }
    } catch (error) {
      testResults.push({
        name: 'Rate Limiting',
        status: 'warning',
        message: `Could not verify rate limiting: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }

    // Test 7: Cache Headers
    try {
      const response = await fetch(`${API_BASE}/api/v1/manifests/featured`);
      const cacheControl = response.headers.get('Cache-Control');
      const etag = response.headers.get('ETag');

      if (cacheControl || etag) {
        testResults.push({
          name: 'Cache Headers',
          status: 'success',
          message: `Cache configured (Cache-Control: ${cacheControl}, ETag: ${etag ? 'present' : 'absent'})`,
          details: { cacheControl, etag },
        });
      } else {
        testResults.push({
          name: 'Cache Headers',
          status: 'warning',
          message: 'Cache headers not configured',
        });
      }
    } catch (error) {
      testResults.push({
        name: 'Cache Headers',
        status: 'warning',
        message: `Could not verify cache headers: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }

    void (Date.now() - startTime);
    const summary = {
      total: testResults.length,
      passed: testResults.filter((t) => t.status === 'success').length,
      failed: testResults.filter((t) => t.status === 'error').length,
      warnings: testResults.filter((t) => t.status === 'warning').length,
    };

    setResults({
      apiUrl: API_BASE,
      domain: window.location.origin,
      timestamp: new Date().toISOString(),
      tests: testResults,
      summary,
    });

    setRunning(false);
  }

  useEffect(() => {
    // Auto-run tests on page load
    runTests();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'warning':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return '✓';
      case 'error':
        return '✗';
      case 'warning':
        return '⚠';
      default:
        return '○';
    }
  };

  return (
    <div className="font-sans p-5">
      <h1>API Integration Test</h1>

      <div className="mb-5 p-2.5 bg-gray-200 rounded">
        <p>
          <strong>API Base:</strong> {results?.apiUrl || 'Loading...'}
        </p>
        <p>
          <strong>Domain:</strong> {results?.domain || 'Loading...'}
        </p>
        <p>
          <strong>Test Time:</strong> {results?.timestamp || 'Running...'}
        </p>
      </div>

      {results && (
        <div className="mb-5">
          <h2>Summary</h2>
          <div className="grid grid-cols-4 gap-2.5">
            <div className="p-2.5 bg-green-100 rounded">
              <strong>Total:</strong> {results.summary.total}
            </div>
            <div className="p-2.5 bg-green-100 rounded">
              <strong>Passed:</strong> {results.summary.passed}
            </div>
            <div className="p-2.5 bg-red-100 rounded">
              <strong>Failed:</strong> {results.summary.failed}
            </div>
            <div className="p-2.5 bg-orange-100 rounded">
              <strong>Warnings:</strong> {results.summary.warnings}
            </div>
          </div>
        </div>
      )}

      <h2>Test Results</h2>
      {running && <p>Running tests...</p>}
      {results && (
        <div>
          {results.tests.map((test, idx) => (
            <div
              key={idx}
              className={`mb-2.5 p-3 border border-gray-300 rounded-l ${
                test.status === 'success'
                  ? 'border-l-4 border-l-green-500'
                  : test.status === 'error'
                    ? 'border-l-4 border-l-red-500'
                    : 'border-l-4 border-l-orange-500'
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="m-0 mb-1.25">
                    <span className="mr-2 text-base">{getStatusIcon(test.status)}</span>
                    {test.name}
                  </h3>
                  <p className="m-0 mb-1.25 text-gray-600">{test.message}</p>
                  {typeof test.details === 'object' && test.details !== null && (
                    <pre className="mt-1.25 text-xs text-gray-500 bg-gray-50 p-1.25 rounded overflow-auto">
                      {JSON.stringify(test.details, null, 2)}
                    </pre>
                  )}
                </div>
                <div className="text-right whitespace-nowrap">
                  <span className={`${getStatusColor(test.status)} font-bold`}>
                    {test.status}
                  </span>
                  {test.duration && <p className="mt-1.25 text-gray-500 text-xs">{test.duration}ms</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-5">
        <button
          onClick={runTests}
          disabled={running}
          className={`px-5 py-2.5 bg-blue-500 text-white border-0 rounded ${
            running ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-blue-600'
          } transition-colors`}
        >
          {running ? 'Running...' : 'Run Tests'}
        </button>
      </div>

      <div className="mt-5 p-2.5 bg-gray-100 rounded text-xs">
        <h3>Notes</h3>
        <ul>
          <li>This page tests the Cloudflare Worker API endpoints</li>
          <li>CORS is configured to allow dev.mcc-cal.com</li>
          <li>Blog content is served statically from <code>/content/blog-static</code></li>
          <li>Rate limiting is set to 100 requests per minute</li>
          <li>All manifest requests are cached for 10 minutes (stale-while-revalidate for 1 hour)</li>
        </ul>
      </div>
    </div>
  );
}
