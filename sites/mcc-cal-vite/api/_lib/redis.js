/**
 * Redis Client Utility
 * Provides Redis connection for caching, rate limiting, and booking locks
 */
import { createClient } from 'redis';

let client = null;
let isConnecting = false;

export async function getRedisClient() {
  if (client?.isReady) {
    return client;
  }

  if (isConnecting) {
    // Wait for existing connection attempt
    await new Promise(resolve => setTimeout(resolve, 100));
    return getRedisClient();
  }

  // Support both standard Redis and Vercel KV
  const redisUrl = process.env.REDIS_URL || process.env.KV_URL;
  if (!redisUrl) {
    return null;
  }

  try {
    isConnecting = true;
    
    client = createClient({
      url: redisUrl,
      socket: {
        connectTimeout: 5000,
        reconnectStrategy: (retries) => {
          if (retries > 3) {
            console.warn('Redis reconnection failed after 3 retries');
            return false;
          }
          return Math.min(retries * 100, 1000);
        }
      }
    });

    client.on('error', (err) => {
      console.error('Redis Client Error:', err.message);
    });

    await client.connect();
    console.log('Redis connected successfully');
    return client;
  } catch (err) {
    console.error('Redis connection failed:', err.message);
    return null;
  } finally {
    isConnecting = false;
  }
}

export async function closeRedisConnection() {
  if (client?.isReady) {
    await client.quit();
    client = null;
  }
}

// Cache utilities
export async function getCache(key) {
  const redis = await getRedisClient();
  if (!redis) return null;
  
  try {
    const value = await redis.get(key);
    return value ? JSON.parse(value) : null;
  } catch (err) {
    console.error('Cache get error:', err.message);
    return null;
  }
}

export async function setCache(key, value, ttlSeconds = 300) {
  const redis = await getRedisClient();
  if (!redis) return false;
  
  try {
    await redis.setEx(key, ttlSeconds, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error('Cache set error:', err.message);
    return false;
  }
}

export async function deleteCache(key) {
  const redis = await getRedisClient();
  if (!redis) return false;
  
  try {
    await redis.del(key);
    return true;
  } catch (err) {
    console.error('Cache delete error:', err.message);
    return false;
  }
}

// Distributed lock for booking slots
export async function acquireBookingLock(date, time, ttlSeconds = 60) {
  const redis = await getRedisClient();
  if (!redis) return { success: false, reason: 'redis_unavailable' };
  
  const lockKey = `booking:lock:${date}:${time}`;
  const lockValue = `${Date.now()}:${Math.random()}`;
  
  try {
    const acquired = await redis.set(lockKey, lockValue, {
      NX: true, // Only set if not exists
      EX: ttlSeconds
    });
    
    if (acquired) {
      return { 
        success: true, 
        lockKey, 
        lockValue,
        release: async () => {
          try {
            // Only release if we own the lock
            const current = await redis.get(lockKey);
            if (current === lockValue) {
              await redis.del(lockKey);
              return { success: true };
            } else if (current === null) {
              console.warn(`[acquireBookingLock] Lock ${lockKey} already expired before release`);
              return { success: false, reason: 'expired' };
            } else {
              console.error(`[acquireBookingLock] Lock ${lockKey} value mismatch - possible race condition`);
              return { success: false, reason: 'ownership_mismatch' };
            }
          } catch (err) {
            console.error(`[acquireBookingLock] Failed to release lock ${lockKey}:`, err.message);
            return { success: false, reason: 'error', error: err.message };
          }
        }
      };
    }
    
    return { success: false, reason: 'slot_locked' };
  } catch (err) {
    console.error('Lock acquisition error:', err.message);
    return { success: false, reason: 'error' };
  }
}

// Rate limiting with Redis
export async function checkRedisRateLimit(key, limit, windowMs) {
  const redis = await getRedisClient();
  if (!redis) return { allowed: true, useFallback: true }; // Fall back to memory-based
  
  const now = Date.now();
  const windowKey = `ratelimit:${key}:${Math.floor(now / windowMs)}`;
  
  try {
    const pipeline = redis.multi();
    pipeline.incr(windowKey);
    pipeline.expire(windowKey, Math.ceil(windowMs / 1000));
    pipeline.get(windowKey);
    
    const results = await pipeline.exec();
    const count = parseInt(results[2], 10);
    
    const allowed = count <= limit;
    const resetAt = (Math.floor(now / windowMs) + 1) * windowMs;
    
    return {
      allowed,
      remaining: Math.max(0, limit - count),
      resetAt,
      total: count
    };
  } catch (err) {
    console.error('Redis rate limit error:', err.message);
    return { allowed: true, useFallback: true };
  }
}
