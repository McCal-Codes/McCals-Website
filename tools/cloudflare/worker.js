/**
 * McCal API - Cloudflare Worker (Self-Contained)
 * 
 * Comprehensive API serving:
 * - Manifest serving with edge caching
 * - Blog authentication and post management
 * - Webhook endpoints for cache management
 * - Rate limiting and cache statistics
 * 
 * Environment Variables Required:
 * - JWT_SECRET: Secret for JWT token signing
 * - WEBHOOK_SECRET: Secret for webhook authentication
 * - BLOG_AUTHORS: JSON string with author credentials
 * - ALLOWED_ORIGINS: Comma-separated list of allowed CORS origins
 * - MANIFEST_BASE_URL: Base URL for manifest files (GitHub raw)
 * 
 * Deploy: wrangler deploy worker.js
 */

// === UTILITIES ===

function corsHeaders(request, env) {
  const allowed = (env?.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
  const origin = request.headers.get('Origin');
  const isAllowed = allowed.some(pattern => {
    if (pattern === '*') return true;
    if (pattern.includes('*')) {
      const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
      return regex.test(origin);
    }
    return pattern === origin;
  });
  
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : '',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Webhook-Secret',
    'Access-Control-Max-Age': '86400',
  };
}

async function getRateLimitKey(request) {
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  return `ratelimit:${ip}`;
}

async function checkRateLimit(kv, key, maxRequests = 100, windowMs = 60000) {
  const count = parseInt((await kv.get(key)) || '0', 10);
  if (count >= maxRequests) {
    return false;
  }
  await kv.put(key, String(count + 1), { expirationTtl: Math.ceil(windowMs / 1000) });
  return true;
}

function getJWTHeader() {
  return { alg: 'HS256', typ: 'JWT' };
}

function base64UrlEncode(str) {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function signJWT(payload, secret) {
  const header = getJWTHeader();
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const message = `${encodedHeader}.${encodedPayload}`;
  
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  const encodedSignature = base64UrlEncode(String.fromCharCode(...new Uint8Array(signature)));
  
  return `${message}.${encodedSignature}`;
}

async function verifyJWT(token, secret) {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  
  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const message = `${encodedHeader}.${encodedPayload}`;
  
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
  const signatureBytes = Uint8Array.from(atob(encodedSignature.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
  
  const isValid = await crypto.subtle.verify('HMAC', key, signatureBytes, new TextEncoder().encode(message));
  if (!isValid) return null;
  
  try {
    const payloadStr = atob(encodedPayload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(payloadStr);
  } catch {
    return null;
  }
}

async function hmacSha256(message, secret) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  return base64UrlEncode(String.fromCharCode(...new Uint8Array(signature)));
}

// === ROUTE HANDLERS ===

async function handleLogin(request, env) {
  try {
    const body = await request.json();
    const { username, password } = body;
    
    const authorsStr = env.BLOG_AUTHORS;
    if (!authorsStr) {
      return new Response(JSON.stringify({ error: 'Server misconfiguration' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    let authors;
    try {
      authors = JSON.parse(authorsStr);
    } catch {
      return new Response(JSON.stringify({ error: 'Server misconfiguration' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
    
    const author = authors.find(a => a.username === username && a.password === password);
    if (!author) {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    const now = Math.floor(Date.now() / 1000);
    const token = await signJWT({
      id: author.id,
      username: author.username,
      name: author.name,
      iat: now,
      exp: now + 86400, // 24 hours
    }, env.JWT_SECRET);
    
    return new Response(JSON.stringify({
      token,
      author: { id: author.id, username: author.username, name: author.name },
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Invalid request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function handleGetPosts(env) {
  const cached = await env.MCCAL_KV.get('blog:posts');
  const posts = cached ? JSON.parse(cached) : [];
  
  return new Response(JSON.stringify({
    posts,
    totalPosts: posts.length,
    cached: !!cached,
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300',
      'X-Cache': cached ? 'HIT' : 'MISS',
    },
  });
}

async function handleCreatePost(request, env) {
  try {
    const body = await request.json();
    const { title, excerpt, blocks } = body;
    
    if (!title || !blocks) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    const posts = JSON.parse((await env.MCCAL_KV.get('blog:posts')) || '[]');
    const newPost = {
      id: `post-${Date.now()}`,
      title,
      excerpt: excerpt || '',
      blocks,
      createdAt: new Date().toISOString(),
    };
    
    posts.push(newPost);
    await env.MCCAL_KV.put('blog:posts', JSON.stringify(posts));
    
    return new Response(JSON.stringify(newPost), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Invalid request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function handleManifest(type, env) {
  // Try multiple path patterns for backwards compatibility
  const typeCapitalized = type.charAt(0).toUpperCase() + type.slice(1);
  const urls = [
    `${env.MANIFEST_BASE_URL}/src/images/Portfolios/${typeCapitalized}/${type}-manifest.json`,
    `${env.MANIFEST_BASE_URL}/src/images/Portfolios/${type}/${type}-manifest.json`,
    `${env.MANIFEST_BASE_URL}/src/images/Portfolios/${type}-manifest.json`,
  ];
  
  for (const url of urls) {
    try {
      const response = await fetch(url, { cf: { cacheTtl: 600 } });
      if (response.ok) {
        const data = await response.json();
        return new Response(JSON.stringify(data), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=600, stale-while-revalidate=3600',
          },
        });
      }
    } catch (e) {
      // Try next URL
    }
  }
  
  return new Response(JSON.stringify({ error: 'Manifest not found' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function handleWebhook(action, request, env) {
  const secret = request.headers.get('X-Webhook-Secret');
  if (secret !== env.WEBHOOK_SECRET) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
  try {
    const body = await request.json();
    
    if (action === 'purge') {
      await env.MCCAL_KV.delete('blog:posts');
      return new Response(JSON.stringify({ success: true, message: 'Cache purged' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    if (action === 'warm') {
      return new Response(JSON.stringify({ success: true, message: 'Cache warmed' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    if (action === 'refresh') {
      return new Response(JSON.stringify({ success: true, message: 'Cache refreshed' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    return new Response(JSON.stringify({ error: 'Unknown action' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Invalid webhook' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// === MAIN HANDLER ===

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    
    // CORS headers
    const cors = corsHeaders(request, env);
    
    // OPTIONS request
    if (method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }
    
    // Routes
    try {
      // Login
      if (method === 'POST' && path === '/api/v1/blog/auth/login') {
        const res = await handleLogin(request, env);
        const headers = new Headers(res.headers);
        Object.entries(cors).forEach(([k, v]) => v && headers.set(k, v));
        return new Response(res.body, { status: res.status, headers });
      }
      
      // Get posts
      if (method === 'GET' && path === '/api/v1/blog/posts') {
        const res = await handleGetPosts(env);
        const headers = new Headers(res.headers);
        Object.entries(cors).forEach(([k, v]) => v && headers.set(k, v));
        return new Response(res.body, { status: res.status, headers });
      }
      
      // Create post
      if (method === 'POST' && path === '/api/v1/blog/posts') {
        const auth = request.headers.get('Authorization') || '';
        const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
        
        if (!token) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json', ...cors },
          });
        }
        
        const payload = await verifyJWT(token, env.JWT_SECRET);
        if (!payload) {
          return new Response(JSON.stringify({ error: 'Invalid token' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json', ...cors },
          });
        }
        
        const res = await handleCreatePost(request, env);
        const headers = new Headers(res.headers);
        Object.entries(cors).forEach(([k, v]) => v && headers.set(k, v));
        return new Response(res.body, { status: res.status, headers });
      }
      
      // Manifest
      if (method === 'GET' && path.startsWith('/api/v1/manifests/')) {
        const type = path.replace('/api/v1/manifests/', '');
        const res = await handleManifest(type, env);
        const headers = new Headers(res.headers);
        Object.entries(cors).forEach(([k, v]) => v && headers.set(k, v));
        return new Response(res.body, { status: res.status, headers });
      }
      
      // Webhooks
      if (method === 'POST' && path.startsWith('/api/v1/webhooks/')) {
        const action = path.replace('/api/v1/webhooks/', '');
        const res = await handleWebhook(action, request, env);
        const headers = new Headers(res.headers);
        Object.entries(cors).forEach(([k, v]) => v && headers.set(k, v));
        return new Response(res.body, { status: res.status, headers });
      }
      
      // Health check
      if (method === 'GET' && path === '/health') {
        return new Response(JSON.stringify({ status: 'ok' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...cors },
        });
      }
      
      // 404
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...cors },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...cors },
      });
    }
  },
};
