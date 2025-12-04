/**
 * Webhook Routes
 *
 * Endpoints for triggering cache invalidation when manifests are regenerated.
 * Call this after adding new images and regenerating manifests.
 */

const express = require("express");
const router = express.Router();
const cache = require("../cache/redis-client");
const { MANIFEST_TYPES, MANIFEST_CONFIG } = require("../config/manifests");

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

function requireSecret(req, res, next) {
  // Allow missing secret in non-production for ease of local testing
  if (!WEBHOOK_SECRET && process.env.NODE_ENV !== "production") {
    console.warn(
      "⚠️  WEBHOOK_SECRET not set; allowing webhook without auth (development only)"
    );
    return next();
  }

  if (!WEBHOOK_SECRET) {
    return res.status(503).json({
      error: "Webhook Not Configured",
      message: "WEBHOOK_SECRET env var is required to use webhook endpoints",
    });
  }

  const provided = req.get("x-webhook-secret") || req.query.secret;
  if (provided !== WEBHOOK_SECRET) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Invalid webhook secret",
    });
  }

  return next();
}

// Protect all webhook routes
router.use(requireSecret);

/**
 * Invalidate cache for specific manifest type
 * POST /api/v1/webhooks/invalidate/:type
 */
router.post("/invalidate/:type", async (req, res) => {
  const { type } = req.params;
  const validTypes = MANIFEST_TYPES;

  if (!validTypes.includes(type)) {
    return res.status(400).json({
      error: "Invalid Type",
      message: `Type must be one of: ${validTypes.join(", ")}`,
    });
  }

  try {
    await cache.del(`manifest:${type}`);

    res.json({
      success: true,
      message: `Cache invalidated for ${type}`,
      type,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({
      error: "Cache Invalidation Failed",
      message: err.message,
    });
  }
});

/**
 * Invalidate all manifest caches
 * POST /api/v1/webhooks/invalidate-all
 */
router.post("/invalidate-all", async (req, res) => {
  try {
    const keys = await cache.keys("manifest:*");

    for (const key of keys) {
      await cache.del(key);
    }

    res.json({
      success: true,
      message: "All manifest caches invalidated",
      clearedCount: keys.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({
      error: "Cache Invalidation Failed",
      message: err.message,
    });
  }
});

/**
 * Refresh cache for specific manifest type
 * Invalidates old cache and immediately warms with new data
 * POST /api/v1/webhooks/refresh/:type
 */
router.post("/refresh/:type", async (req, res) => {
  const { type } = req.params;
  const validTypes = MANIFEST_TYPES;

  if (!validTypes.includes(type)) {
    return res.status(400).json({
      error: "Invalid Type",
      message: `Type must be one of: ${validTypes.join(", ")}`,
    });
  }

  try {
    const fs = require("fs").promises;
    const path = require("path");

    // Invalidate old cache
    await cache.del(`manifest:${type}`);

    // Load fresh data
    const manifestPath = MANIFEST_CONFIG[type];
    const fullPath = path.join(
      process.cwd(),
      "src",
      "images",
      "Portfolios",
      manifestPath
    );
    const data = await fs.readFile(fullPath, "utf8");
    const manifest = JSON.parse(data);

    // Warm cache with new data
    await cache.set(`manifest:${type}`, manifest);

    res.json({
      success: true,
      message: `Cache refreshed for ${type}`,
      type,
      itemCount:
        manifest.bands?.length ||
        manifest.events?.length ||
        manifest.stories?.length ||
        manifest.collections?.length ||
        manifest.items?.length ||
        0,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({
      error: "Cache Refresh Failed",
      message: err.message,
    });
  }
});

module.exports = router;
