/**
 * Enhanced Rate Limiting with Redis
 * Uses Redis as primary store with in-memory fallback
 */
import { checkRedisRateLimit } from './redis.js';

const ROUTE_STORES = new Map();
let lastCleanupTime = 0;
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_STORE_SIZE = 1000; // Limit entries per route

function shouldBypassRateLimit() {
  return process.env.NODE_ENV !== 'production' && !process.env.VERCEL;
}

function getRouteStore(route) {
  if (!ROUTE_STORES.has(route)) {
    ROUTE_STORES.set(route, new Map());
  }
  return ROUTE_STORES.get(route);
}

function cleanupAllStores() {
  const now = Date.now();
  if (now - lastCleanupTime < CLEANUP_INTERVAL_MS) {
    return; // Skip if cleanup ran recently
  }
  
  for (const [route, store] of ROUTE_STORES.entries()) {
    sweepExpiredEntries(store, now);
    
    // If store still too large, remove oldest entries
    if (store.size > MAX_STORE_SIZE) {
      const entries = Array.from(store.entries());
      entries.sort((a, b) => a[1].resetAt - b[1].resetAt);
      const toRemove = entries.slice(0, entries.length - MAX_STORE_SIZE);
      for (const [key] of toRemove) {
        store.delete(key);
      }
    }
    
    // Delete empty route stores
    if (store.size === 0) {
      ROUTE_STORES.delete(route);
    }
  }
  
  lastCleanupTime = now;
}

function getClientIp(req) {
  const forwardedFor = req.headers['x-forwarded-for'];
  if (typeof forwardedFor === 'string' && forwardedFor.trim()) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = req.headers['x-real-ip'];
  if (typeof realIp === 'string' && realIp.trim()) {
    return realIp.trim();
  }

  return (req.socket && req.socket.remoteAddress) || 
         (req.connection && req.connection.remoteAddress) || 
         'unknown';
}

function setRateLimitHeaders(res, { limit, remaining, resetAt }) {
  res.setHeader('X-RateLimit-Limit', String(limit));
  res.setHeader('X-RateLimit-Remaining', String(Math.max(remaining, 0)));
  res.setHeader('X-RateLimit-Reset', String(Math.ceil(resetAt / 1000)));
}

function sweepExpiredEntries(store, now) {
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt <= now) {
      store.delete(key);
    }
  }
}

function applyMemoryRateLimit(req, res, { route, limit, windowMs }) {
  const now = Date.now();
  cleanupAllStores(); // Periodic cleanup to prevent memory leak
  const store = getRouteStore(route);
  sweepExpiredEntries(store, now);

  const ip = getClientIp(req);
  const key = `${route}:${ip}`;
  const currentEntry = store.get(key);
  const activeEntry =
    currentEntry && currentEntry.resetAt > now
      ? currentEntry
      : {
          count: 0,
          resetAt: now + windowMs,
        };

  if (activeEntry.count >= limit) {
    const retryAfterSeconds = Math.max(1, Math.ceil((activeEntry.resetAt - now) / 1000));
    setRateLimitHeaders(res, {
      limit,
      remaining: 0,
      resetAt: activeEntry.resetAt,
    });
    res.setHeader('Retry-After', String(retryAfterSeconds));
    return {
      allowed: false,
      retryAfterSeconds,
    };
  }

  activeEntry.count += 1;
  store.set(key, activeEntry);

  setRateLimitHeaders(res, {
    limit,
    remaining: limit - activeEntry.count,
    resetAt: activeEntry.resetAt,
  });

  return { allowed: true };
}

export async function applyRateLimit(req, res, { route, limit, windowMs }) {
  if (shouldBypassRateLimit()) {
    return { allowed: true };
  }

  const ip = getClientIp(req);
  const key = `${route}:${ip}`;

  // Try Redis first
  const redisResult = await checkRedisRateLimit(key, limit, windowMs);
  
  if (!redisResult.useFallback) {
    // Redis is working
    if (!redisResult.allowed) {
      const retryAfterSeconds = Math.max(1, Math.ceil((redisResult.resetAt - Date.now()) / 1000));
      setRateLimitHeaders(res, {
        limit,
        remaining: 0,
        resetAt: redisResult.resetAt,
      });
      res.setHeader('Retry-After', String(retryAfterSeconds));
      return {
        allowed: false,
        retryAfterSeconds,
      };
    }

    setRateLimitHeaders(res, {
      limit,
      remaining: redisResult.remaining,
      resetAt: redisResult.resetAt,
    });

    return { allowed: true };
  }

  // Fall back to memory-based rate limiting
  return applyMemoryRateLimit(req, res, { route, limit, windowMs });
}
