/**
 * Redis Cache Client
 * 
 * Provides Redis caching functionality for manifest data.
 * Falls back to in-memory cache if Redis is unavailable.
 */

const redis = require('redis');

class RedisCache {
  constructor() {
    this.client = null;
    this.connected = false;
    this.fallbackCache = new Map(); // In-memory fallback
    this.CACHE_TTL = parseInt(process.env.CACHE_TTL_MINUTES || '60') * 60; // Convert to seconds
  }

  /**
   * Initialize Redis connection
   */
  async connect() {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    try {
      this.client = redis.createClient({
        url: redisUrl,
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              console.error('❌ Redis: Max reconnection attempts reached');
              return new Error('Max reconnection attempts reached');
            }
            return Math.min(retries * 100, 3000); // Exponential backoff
          }
        }
      });

      this.client.on('error', (err) => {
        console.error('Redis Client Error:', err.message);
        this.connected = false;
      });

      this.client.on('connect', () => {
        console.log('🔗 Redis: Connected');
        this.connected = true;
      });

      this.client.on('ready', () => {
        console.log('✅ Redis: Ready');
      });

      this.client.on('reconnecting', () => {
        console.log('🔄 Redis: Reconnecting...');
      });

      await this.client.connect();
      return true;
    } catch (err) {
      console.warn('⚠️  Redis unavailable, using in-memory cache:', err.message);
      this.connected = false;
      return false;
    }
  }

  /**
   * Get value from cache
   */
  async get(key) {
    if (this.connected && this.client) {
      try {
        const value = await this.client.get(key);
        return value ? JSON.parse(value) : null;
      } catch (err) {
        console.warn('Redis GET error, using fallback:', err.message);
        return this.fallbackCache.get(key) || null;
      }
    }
    
    // Fallback to in-memory
    const cached = this.fallbackCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL * 1000) {
      return cached.data;
    }
    return null;
  }

  /**
   * Set value in cache
   */
  async set(key, value, ttl = null) {
    const cacheTTL = ttl || this.CACHE_TTL;
    
    if (this.connected && this.client) {
      try {
        await this.client.setEx(key, cacheTTL, JSON.stringify(value));
        return true;
      } catch (err) {
        console.warn('Redis SET error, using fallback:', err.message);
        this.fallbackCache.set(key, { data: value, timestamp: Date.now() });
        return false;
      }
    }
    
    // Fallback to in-memory
    this.fallbackCache.set(key, { data: value, timestamp: Date.now() });
    return true;
  }

  /**
   * Delete key from cache
   */
  async del(key) {
    if (this.connected && this.client) {
      try {
        await this.client.del(key);
      } catch (err) {
        console.warn('Redis DEL error:', err.message);
      }
    }
    this.fallbackCache.delete(key);
  }

  /**
   * Clear all cache
   */
  async clear() {
    if (this.connected && this.client) {
      try {
        await this.client.flushDb();
      } catch (err) {
        console.warn('Redis FLUSH error:', err.message);
      }
    }
    this.fallbackCache.clear();
  }

  /**
   * Get all keys matching pattern
   */
  async keys(pattern = '*') {
    if (this.connected && this.client) {
      try {
        // Use SCAN via scanIterator to avoid blocking Redis for large datasets
        const found = [];
        for await (const k of this.client.scanIterator({ MATCH: pattern, COUNT: 100 })) {
          // Some redis client implementations return batches (arrays) from scanIterator;
          // normalize to a flat array.
          if (Array.isArray(k)) {
            found.push(...k);
          } else {
            found.push(k);
          }
        }
        return found;
      } catch (err) {
        console.warn('Redis KEYS/SCAN error:', err.message);
      }
    }
    return Array.from(this.fallbackCache.keys());
  }

  /**
   * Get TTL (seconds) for a key. Returns null if unknown or not supported.
   */
  async ttl(key) {
    if (this.connected && this.client) {
      try {
        const t = await this.client.ttl(key);
        // TTL returns -2 (key doesn't exist) or -1 (no expiry) per Redis semantics
        return typeof t === 'number' ? t : null;
      } catch (err) {
        console.warn('Redis TTL error:', err.message);
        return null;
      }
    }

    // Fallback: cannot determine TTL for in-memory fallback
    return null;
  }

  /**
   * Get memory usage for a key in bytes using MEMORY USAGE Redis command.
   * Returns number or null when unsupported.
   */
  async memoryUsage(key) {
    if (this.connected && this.client) {
      try {
        // Use the MEMORY USAGE command
        const result = await this.client.sendCommand(['MEMORY', 'USAGE', key]);
        const n = Number(result);
        return Number.isFinite(n) ? n : null;
      } catch (err) {
        // Some Redis setups may not allow MEMORY commands - fall back silently
        console.warn('Redis MEMORY USAGE error:', err.message);
        return null;
      }
    }

    // Fallback to approximate size for in-memory cache if present
    const cached = this.fallbackCache.get(key);
    if (cached) {
      return Buffer.byteLength(JSON.stringify(cached.data), 'utf8');
    }
    return null;
  }

  /**
   * Get cache statistics
   */
  async stats() {
    const stats = {
      type: this.connected ? 'redis' : 'in-memory',
      connected: this.connected,
      ttl: `${this.CACHE_TTL / 60} minutes`,
    };

    if (this.connected && this.client) {
      try {
        const info = await this.client.info('memory');
        const keys = await this.client.dbSize();
        stats.keys = keys;
        stats.memory = this._parseRedisMemory(info);
      } catch (err) {
        console.warn('Redis STATS error:', err.message);
      }
    } else {
      stats.keys = this.fallbackCache.size;
      stats.memory = {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        unit: 'MB'
      };
    }

    return stats;
  }

  /**
   * Parse Redis memory info
   */
  _parseRedisMemory(info) {
    const usedMatch = info.match(/used_memory_human:([^\r\n]+)/);
    const peakMatch = info.match(/used_memory_peak_human:([^\r\n]+)/);
    
    return {
      used: usedMatch ? usedMatch[1].trim() : 'unknown',
      peak: peakMatch ? peakMatch[1].trim() : 'unknown'
    };
  }

  /**
   * Close Redis connection
   */
  async disconnect() {
    if (this.client && this.connected) {
      try {
        await this.client.quit();
        console.log('👋 Redis: Disconnected');
      } catch (err) {
        console.error('Error disconnecting from Redis:', err.message);
      }
    }
  }
}

// Create singleton instance
const cache = new RedisCache();

module.exports = cache;
