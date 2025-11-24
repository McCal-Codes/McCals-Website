/**
 * Admin Routes
 *
 * Minimal admin endpoints for inspecting the cache without RedisInsight.
 * GET /api/v1/admin/cache - lists keys and simple size/item counts
 */

const express = require('express');
const router = express.Router();
const cache = require('../cache/redis-client');

// Helper to compute item count for manifest-like objects
function getItemCount(obj) {
  if (!obj) return 0;
  if (Array.isArray(obj)) return obj.length;
  return obj.bands?.length || obj.events?.length || obj.stories?.length || obj.collections?.length || obj.items?.length || 0;
}

/**
 * List cache keys with lightweight metadata
 * GET /api/v1/admin/cache
 */
router.get('/cache', async (req, res) => {
  try {
    const stats = await cache.stats();
    const keys = await cache.keys('manifest:*');

    const items = [];
    for (const key of keys) {
      try {
        const value = await cache.get(key);
        const json = value || null;
        // Prefer the Redis MEMORY USAGE command when available
        let sizeBytes = null;
        try {
          const mem = await cache.memoryUsage(key);
          if (typeof mem === 'number') sizeBytes = mem;
        } catch (_) {
          /* ignore */
        }

        if (!sizeBytes) {
          sizeBytes = json ? Buffer.byteLength(JSON.stringify(json), 'utf8') : 0;
        }

        const itemCount = getItemCount(json);
        const ttlSeconds = await cache.ttl(key);
        items.push({ key, itemCount, sizeBytes, ttlSeconds, cached: !!json });
      } catch (err) {
        items.push({ key, error: err.message });
      }
    }

    res.json({
      success: true,
      cache: stats,
      items,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: 'AdminError', message: err.message });
  }
});

module.exports = router;
