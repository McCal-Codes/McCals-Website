/**
 * Manifest Routes
 *
 * Provides access to portfolio manifest data.
 * Reads from the generated manifest files in src/images/Portfolios/
 * Uses Redis cache for high-performance data access
 */

const express = require("express");
const router = express.Router();
const fs = require("fs").promises;
const path = require("path");
const cache = require("../cache/redis-client");
const etag = require("etag");

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

const { MANIFEST_CONFIG, MANIFEST_TYPES } = require("../config/manifests");

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
    "src",
    "images",
    "Portfolios",
    manifestPath
  );

  try {
    const data = await fs.readFile(fullPath, "utf8");
    return JSON.parse(data);
  } catch (err) {
    if (err.code === "ENOENT") {
      throw new Error(`Manifest not found: ${type}`);
    }
    throw err;
  }
}

/**
 * Helper: Get manifest from cache or read from disk
 */
async function getCachedManifest(type) {
  const cacheKey = `manifest:${type}`;

  // Try to get from Redis cache
  const cached = await cache.get(cacheKey);
  if (cached) {
    return { data: cached, fromCache: true };
  }

  // Cache miss - read from disk
  const data = await readManifest(type);

  // Store in Redis cache
  await cache.set(cacheKey, data);

  return { data, fromCache: false };
}

/**
 * List all available manifest types
 * GET /api/v1/manifests
 */
router.get("/", async (req, res) => {
  const manifests = Object.keys(MANIFEST_CONFIG).map((type) => ({
    type,
    endpoint: `/api/v1/manifests/${type}`,
  }));

  const stats = await cache.stats();

  res.json({
    manifests,
    total: manifests.length,
    cacheStatus: stats,
  });
});

/**
 * Get a specific manifest by type
 * GET /api/v1/manifests/:type
 */
router.get("/:type", async (req, res, next) => {
  const { type } = req.params;

  try {
    const { data, fromCache } = await getCachedManifest(type);

    // Generate ETag for caching
    const dataString = JSON.stringify(data);
    const etagValue = etag(dataString);

    // Check if client has cached version
    const clientETag = req.headers["if-none-match"];
    if (clientETag === etagValue) {
      return res.status(304).end(); // Not Modified
    }

    // Set cache headers
    res.set({
      "X-Cache": fromCache ? "HIT" : "MISS",
      ETag: etagValue,
      "Cache-Control": "public, max-age=300, must-revalidate", // 5 minutes browser cache
      Vary: "Accept-Encoding",
    });

    res.json({
      type,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        cached: fromCache,
      },
    });
  } catch (err) {
    if (err.message.includes("Unknown manifest type")) {
      return res.status(404).json({
        error: "Not Found",
        message: err.message,
        availableTypes: Object.keys(MANIFEST_CONFIG),
      });
    }

    if (err.message.includes("Manifest not found")) {
      return res.status(404).json({
        error: "Not Found",
        message: `Manifest file not found for type: ${type}`,
        suggestion: "Run `npm run manifest:generate` to create manifests",
      });
    }

    next(err);
  }
});

/**
 * Clear manifest cache (useful for development)
 * POST /api/v1/manifests/cache/clear
 */
router.post("/cache/clear", async (req, res) => {
  if (WEBHOOK_SECRET) {
    const provided = req.get("x-webhook-secret") || req.query.secret;
    if (provided !== WEBHOOK_SECRET) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Invalid webhook secret",
      });
    }
  }

  const keys = await cache.keys("manifest:*");
  for (const key of keys) {
    await cache.del(key);
  }

  res.json({
    message: "Cache cleared successfully",
    clearedCount: keys.length,
    timestamp: new Date().toISOString(),
  });
});

/**
 * Get cache statistics
 * GET /api/v1/manifests/cache/stats
 */
router.get("/cache/stats", async (req, res) => {
  const stats = await cache.stats();
  res.json(stats);
});

module.exports = router;
