/**
 * Manifest Routes
 * 
 * Provides access to portfolio manifest data.
 * Reads from the generated manifest files in src/images/Portfolios/
 */

const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

// In-memory cache for manifests (cleared on server restart)
const manifestCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Manifest configuration - maps portfolio types to their manifest file paths
 */
const MANIFEST_CONFIG = {
  concert: 'Concert/concert-manifest.json',
  events: 'Events/events-manifest.json',
  journalism: 'Journalism/journalism-manifest.json',
  nature: 'Nature/nature-manifest.json',
  portrait: 'Portrait/portrait-manifest.json',
  featured: 'featured-manifest.json',
  universal: 'portfolio-manifest.json',
};

/**
 * Helper: Read and parse a manifest file
 */
async function readManifest(type) {
  const manifestPath = MANIFEST_CONFIG[type];
  if (!manifestPath) {
    throw new Error(`Unknown manifest type: ${type}`);
  }
  
  const fullPath = path.join(
    process.cwd(),
    'src',
    'images',
    'Portfolios',
    manifestPath
  );
  
  try {
    const data = await fs.readFile(fullPath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') {
      throw new Error(`Manifest not found: ${type}`);
    }
    throw err;
  }
}

/**
 * Helper: Get manifest from cache or read from disk
 */
async function getCachedManifest(type) {
  const cached = manifestCache.get(type);
  const now = Date.now();
  
  if (cached && now - cached.timestamp < CACHE_TTL) {
    return { data: cached.data, fromCache: true };
  }
  
  const data = await readManifest(type);
  manifestCache.set(type, { data, timestamp: now });
  
  return { data, fromCache: false };
}

/**
 * List all available manifest types
 * GET /api/v1/manifests
 */
router.get('/', (req, res) => {
  const manifests = Object.keys(MANIFEST_CONFIG).map(type => ({
    type,
    endpoint: `/api/v1/manifests/${type}`,
  }));
  
  res.json({
    manifests,
    total: manifests.length,
    cacheStatus: {
      cached: manifestCache.size,
      ttl: CACHE_TTL / 1000 / 60 + ' minutes',
    },
  });
});

/**
 * Get a specific manifest by type
 * GET /api/v1/manifests/:type
 */
router.get('/:type', async (req, res, next) => {
  const { type } = req.params;
  
  try {
    const { data, fromCache } = await getCachedManifest(type);
    
    res.set('X-Cache', fromCache ? 'HIT' : 'MISS');
    res.json({
      type,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        cached: fromCache,
      },
    });
  } catch (err) {
    if (err.message.includes('Unknown manifest type')) {
      return res.status(404).json({
        error: 'Not Found',
        message: err.message,
        availableTypes: Object.keys(MANIFEST_CONFIG),
      });
    }
    
    if (err.message.includes('Manifest not found')) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Manifest file not found for type: ${type}`,
        suggestion: 'Run `npm run manifest:generate` to create manifests',
      });
    }
    
    next(err);
  }
});

/**
 * Clear manifest cache (useful for development)
 * POST /api/v1/manifests/cache/clear
 */
router.post('/cache/clear', (req, res) => {
  const clearedCount = manifestCache.size;
  manifestCache.clear();
  
  res.json({
    message: 'Cache cleared successfully',
    clearedCount,
    timestamp: new Date().toISOString(),
  });
});

/**
 * Get cache statistics
 * GET /api/v1/manifests/cache/stats
 */
router.get('/cache/stats', (req, res) => {
  const stats = {
    entries: manifestCache.size,
    ttl: CACHE_TTL / 1000 / 60 + ' minutes',
    keys: Array.from(manifestCache.keys()),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      unit: 'MB',
    },
  };
  
  res.json(stats);
});

module.exports = router;
