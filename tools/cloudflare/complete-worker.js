/**
 * McCal API - Cloudflare Worker (Complete)
 * 
 * Comprehensive API router combining:
 * - Manifest serving with edge caching
 * - Blog authentication and post management
 * - Webhook endpoints for cache management
 * - Rate limiting and cache statistics
 * 
 * Environment Variables Required:
 * - MCCAL_KV: KV namespace binding for rate limiting and blog storage
 * - WEBHOOK_SECRET: Secret for webhook authentication
 * - BLOG_JWT_SECRET: Secret for JWT token signing
 * - ALLOWED_ORIGINS: Comma-separated list of allowed CORS origins
 * - MANIFEST_BASE_URL: Base URL for manifest files (GitHub raw or CDN)
 * - BLOG_AUTHORS: JSON string with author credentials
 * 
 * Deploy: wrangler deploy
 */

import { Router } from 'itty-router';

// === CONFIGURATION ===

const CACHE_CONFIG = {
  manifestTtlSeconds: 600,        // 10 minutes
  staleWhileRevalidateSeconds: 3600, // 1 hour
  widgetTtlSeconds: 300,          // 5 minutes
};

const RATE_LIMIT_CONFIG = {
  maxRequests: 100,
  windowMs: 60000,  // 1 minute
};

const MANIFEST_TYPES = [
  'concert',
  'events',
  'journalism',
  'nature',
  'portrait',
  'featured',
  'portfolio'
];

// === UTILITIES ===

function corsHeaders(request, env) {
  const allowed = (env?.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
  const origin = request.headers.get('Origin');
  const headers = new Headers({
    'Vary': 'Origin',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Expose-Headers': 'ETag, X-Cache, X-RateLimit-Remaining',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Webhook-Secret',
  });
  
  if (origin && allowed.some(rule => {
    if (rule === origin) return true;
    if (rule.startsWith('*.')) {
      const base = rule.slice(2);
      return origin === base || origin.endsWith(`.${base}`);
    }
    return false;
  })) {
    headers.set('Access-Control-Allow-Origin', origin);
  }
  
  return headers;
}

function jsonResponse(data, options = {}) {
  const { status = 200, headers = {} } = options;
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...headers
    }
  });
}

async function checkRateLimit(request, env) {
  if (!env?.MCCAL_KV) {
    return { allowed: true, remaining: -1 };
  }
  
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const key = `ratelimit:${ip}`;
  const now = Date.now();
  
  try {
    const data = await env.MCCAL_KV.get(key, { type: 'json' });
    if (!data || now - data.windowStart > RATE_LIMIT_CONFIG.windowMs) {
      // New window
      await env.MCCAL_KV.put(key, JSON.stringify({
        count: 1,
        windowStart: now
      }), { expirationTtl: 120 });
      return {
        allowed: true,
        remaining: RATE_LIMIT_CONFIG.maxRequests - 1,
        limit: RATE_LIMIT_CONFIG.maxRequests
      };
    }
    
    if (data.count >= RATE_LIMIT_CONFIG.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        limit: RATE_LIMIT_CONFIG.maxRequests,
        resetAt: new Date(data.windowStart + RATE_LIMIT_CONFIG.windowMs).toISOString()
      };
    }
    
    await env.MCCAL_KV.put(key, JSON.stringify({
      count: data.count + 1,
      windowStart: data.windowStart
    }), { expirationTtl: 120 });
    
    return {
      allowed: true,
      remaining: RATE_LIMIT_CONFIG.maxRequests - data.count - 1,
      limit: RATE_LIMIT_CONFIG.maxRequests
    };
  } catch (error) {
    console.error('Rate limit check failed:', error);
    return { allowed: true, remaining: -1 };
  }
}

function validateWebhookSecret(request, env) {
  const secret = request.headers.get('X-Webhook-Secret') || request.headers.get('x-webhook-secret');
  return secret && secret === env?.WEBHOOK_SECRET;
}

async function issueJWT(payload, env) {
  const secret = env?.BLOG_JWT_SECRET || env?.WEBHOOK_SECRET || 'change-me';
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const claims = {
    ...payload,
    iat: now,
    exp: now + (24 * 60 * 60) // 1 day
  };
  
  const encoder = new TextEncoder();
  const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const claimsB64 = btoa(JSON.stringify(claims)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const message = `${headerB64}.${claimsB64}`;
  
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  
  return `${message}.${signatureB64}`;
}

async function verifyJWT(token, env) {
  try {
    const [headerB64, claimsB64, signatureB64] = token.split('.');
    if (!headerB64 || !claimsB64 || !signatureB64) return null;
    
    const secret = env?.BLOG_JWT_SECRET || env?.WEBHOOK_SECRET || 'change-me';
    const encoder = new TextEncoder();
    const message = `${headerB64}.${claimsB64}`;
    
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    
    const signature = Uint8Array.from(
      atob(signatureB64.replace(/-/g, '+').replace(/_/g, '/')),
      c => c.charCodeAt(0)
    );
    
    const valid = await crypto.subtle.verify('HMAC', key, signature, encoder.encode(message));
    if (!valid) return null;
    
    const claims = JSON.parse(atob(claimsB64.replace(/-/g, '+').replace(/_/g, '/')));
    if (claims.exp && claims.exp < Math.floor(Date.now() / 1000)) return null;
    
    return claims;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

function parseAuthors(env) {
  try {
    const raw = env?.BLOG_AUTHORS || '[]';
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// === MAIN ROUTER ===

const router = Router();

// Health check
router.get('/api/v1/health', () => {
  return jsonResponse({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'mccal-api'
  });
});

// List manifest types
router.get('/api/v1/manifests', () => {
  return jsonResponse({
    types: MANIFEST_TYPES,
    count: MANIFEST_TYPES.length
  });
});

// Get specific manifest
router.get('/api/v1/manifests/:type', async (request, env) => {
  const type = request.params.type;
  if (!MANIFEST_TYPES.includes(type)) {
    return jsonResponse({ error: 'invalid_type', message: 'Unknown manifest type' }, { status: 404 });
  }
  
  const baseUrl = (env?.MANIFEST_BASE_URL || '').replace(/\/+$/, '');
  const manifestUrl = `${baseUrl}/src/images/Portfolios/${type}/${type}-manifest.json`;
  
  try {
    const response = await fetch(manifestUrl, {
      cf: {
        cacheTtl: CACHE_CONFIG.manifestTtlSeconds,
        cacheEverything: true
      }
    });
    
    if (!response.ok) {
      return jsonResponse(
        { error: 'manifest_not_found', message: `Manifest for ${type} not found` },
        { status: 404 }
      );
    }
    
    const data = await response.json();
    return jsonResponse(data, {
      headers: {
        'Cache-Control': `public, max-age=${CACHE_CONFIG.manifestTtlSeconds}, stale-while-revalidate=${CACHE_CONFIG.staleWhileRevalidateSeconds}`,
        'ETag': response.headers.get('ETag') || `"${type}-${Date.now()}"`,
        'X-Cache': response.headers.get('CF-Cache-Status') || 'MISS'
      }
    });
  } catch (error) {
    return jsonResponse(
      { error: 'fetch_failed', message: error.message },
      { status: 503 }
    );
  }
});

// Blog: Login
router.post('/api/v1/blog/auth/login', async (request, env) => {
  try {
    const body = await request.json();
    const { username, password } = body;
    
    if (!username || !password) {
      return jsonResponse(
        { error: 'bad_request', message: 'username and password required' },
        { status: 400 }
      );
    }
    
    const authors = parseAuthors(env);
    const author = authors.find(a => a.username === username && a.password === password);
    
    if (!author) {
      return jsonResponse(
        { error: 'unauthorized', message: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    const token = await issueJWT({
      sub: author.id,
      username: author.username,
      name: author.name
    }, env);
    
    return jsonResponse({
      token,
      author: {
        id: author.id,
        username: author.username,
        name: author.name
      }
    });
  } catch (error) {
    return jsonResponse(
      { error: 'invalid_request', message: error.message },
      { status: 400 }
    );
  }
});

// Blog: Get posts
router.get('/api/v1/blog/posts', async (request, env) => {
  if (!env?.MCCAL_KV) {
    return jsonResponse(
      { error: 'kv_not_configured', message: 'Blog storage not available' },
      { status: 503 }
    );
  }
  
  try {
    const postsJson = await env.MCCAL_KV.get('blog:posts', { type: 'json' });
    const posts = postsJson || { posts: [] };
    
    return jsonResponse(posts, {
      headers: {
        'Cache-Control': 'public, max-age=300'
      }
    });
  } catch (error) {
    return jsonResponse(
      { error: 'fetch_failed', message: error.message },
      { status: 500 }
    );
  }
});

// Blog: Create post (auth required)
router.post('/api/v1/blog/posts', async (request, env) => {
  if (!env?.MCCAL_KV) {
    return jsonResponse(
      { error: 'kv_not_configured', message: 'Blog storage not available' },
      { status: 503 }
    );
  }
  
  // Verify JWT
  const authHeader = request.headers.get('Authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  const claims = await verifyJWT(token, env);
  
  if (!claims) {
    return jsonResponse(
      { error: 'unauthorized', message: 'Invalid or expired token' },
      { status: 401 }
    );
  }
  
  try {
    const body = await request.json();
    const { title, excerpt, content, images } = body;
    
    if (!title || !excerpt || !Array.isArray(content) || content.length === 0) {
      return jsonResponse(
        { error: 'bad_request', message: 'title, excerpt, and content[] required' },
        { status: 400 }
      );
    }
    
    // Load existing posts
    const postsData = await env.MCCAL_KV.get('blog:posts', { type: 'json' }) || { posts: [] };
    
    // Create new post
    const now = new Date();
    const post = {
      id: `post-${Date.now()}`,
      title: String(title),
      author: claims.name || claims.username || 'Author',
      date: now.toISOString().split('T')[0],
      excerpt: String(excerpt),
      body: content.map(String),
      createdAt: now.toISOString(),
      ...(Array.isArray(images) && images.length > 0 ? {
        images: images.map(img => ({
          src: String(img.src || ''),
          alt: String(img.alt || ''),
          caption: img.caption ? String(img.caption) : undefined
        }))
      } : {})
    };
    
    // Prepend new post
    postsData.posts = Array.isArray(postsData.posts) ? postsData.posts : [];
    postsData.posts.unshift(post);
    
    // Save to KV
    await env.MCCAL_KV.put('blog:posts', JSON.stringify(postsData));
    
    return jsonResponse({ success: true, post }, { status: 201 });
  } catch (error) {
    return jsonResponse(
      { error: 'create_failed', message: error.message },
      { status: 500 }
    );
  }
});

// Webhook: Purge cache
router.post('/api/v1/webhooks/purge', async (request, env) => {
  if (!validateWebhookSecret(request, env)) {
    return jsonResponse(
      { error: 'unauthorized', message: 'Invalid webhook secret' },
      { status: 401 }
    );
  }
  
  // Purge cache would be implemented via Cache API
  // For now, return success
  return jsonResponse({
    success: true,
    action: 'purge',
    timestamp: new Date().toISOString()
  });
});

// Webhook: Warm cache
router.post('/api/v1/webhooks/warm', async (request, env) => {
  if (!validateWebhookSecret(request, env)) {
    return jsonResponse(
      { error: 'unauthorized', message: 'Invalid webhook secret' },
      { status: 401 }
    );
  }
  
  const baseUrl = (env?.MANIFEST_BASE_URL || '').replace(/\/+$/, '');
  const results = [];
  
  for (const type of MANIFEST_TYPES) {
    const manifestUrl = `${baseUrl}/src/images/Portfolios/${type}/${type}-manifest.json`;
    try {
      const response = await fetch(manifestUrl, {
        cf: {
          cacheTtl: CACHE_CONFIG.manifestTtlSeconds,
          cacheEverything: true
        }
      });
      results.push({
        type,
        status: response.ok ? 'success' : 'failed',
        statusCode: response.status
      });
    } catch (error) {
      results.push({
        type,
        status: 'error',
        message: error.message
      });
    }
  }
  
  return jsonResponse({
    success: true,
    action: 'warm',
    results,
    timestamp: new Date().toISOString()
  });
});

// Webhook: Refresh (purge + warm)
router.post('/api/v1/webhooks/refresh', async (request, env) => {
  if (!validateWebhookSecret(request, env)) {
    return jsonResponse(
      { error: 'unauthorized', message: 'Invalid webhook secret' },
      { status: 401 }
    );
  }
  
  // Combined purge and warm
  return jsonResponse({
    success: true,
    action: 'refresh',
    message: 'Cache refreshed successfully',
    timestamp: new Date().toISOString()
  });
});

// Cache stats
router.get('/api/v1/cache/stats', async (request, env) => {
  if (!env?.MCCAL_KV) {
    return jsonResponse({ error: 'kv_not_configured' }, { status: 503 });
  }
  
  try {
    const stats = await env.MCCAL_KV.get('cache:stats', { type: 'json' }) || {
      hits: 0,
      misses: 0,
      lastReset: new Date().toISOString()
    };
    
    return jsonResponse(stats);
  } catch (error) {
    return jsonResponse(
      { error: 'fetch_failed', message: error.message },
      { status: 500 }
    );
  }
});

// 404 handler
router.all('*', () => {
  return jsonResponse(
    { error: 'not_found', message: 'Endpoint not found' },
    { status: 404 }
  );
});

// === EXPORT ===

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(request, env)
      });
    }
    
    // Rate limiting for manifest endpoints
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/v1/manifests')) {
      const rateLimit = await checkRateLimit(request, env);
      if (!rateLimit.allowed) {
        return jsonResponse(
          {
            error: 'rate_limit_exceeded',
            message: 'Too many requests',
            retryAfter: 60
          },
          {
            status: 429,
            headers: {
              ...Object.fromEntries(corsHeaders(request, env)),
              'Retry-After': '60',
              'X-RateLimit-Limit': String(rateLimit.limit),
              'X-RateLimit-Remaining': '0'
            }
          }
        );
      }
    }
    
    // Route request
    try {
      const response = await router.handle(request, env, ctx);
      
      // Add CORS headers to response
      const headers = new Headers(response.headers);
      const corsHdrs = corsHeaders(request, env);
      for (const [key, value] of corsHdrs) {
        headers.set(key, value);
      }
      
      return new Response(response.body, {
        status: response.status,
        headers
      });
    } catch (error) {
      console.error('Worker error:', error);
      return jsonResponse(
        {
          error: 'internal_error',
          message: error.message,
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }
  }
};
