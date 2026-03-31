const ROUTE_STORES = new Map();

function shouldBypassRateLimit() {
  return process.env.NODE_ENV !== 'production' && !process.env.VERCEL;
}

function getRouteStore(route) {
  if (!ROUTE_STORES.has(route)) {
    ROUTE_STORES.set(route, new Map());
  }

  return ROUTE_STORES.get(route);
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

  return req.socket?.remoteAddress || req.connection?.remoteAddress || 'unknown';
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

export function applyRateLimit(req, res, { route, limit, windowMs }) {
  if (shouldBypassRateLimit()) {
    return { allowed: true };
  }

  const now = Date.now();
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