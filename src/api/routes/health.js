/**
 * Health Check Routes
 *
 * Provides health check endpoints for monitoring and load balancer probes.
 */

const express = require("express");
const router = express.Router();
const { promises: fs, constants: fsConstants } = require("fs");
const path = require("path");

/**
 * Basic health check - always returns 200 if server is running
 * GET /api/health
 */
router.get("/", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      unit: "MB",
    },
  });
});

/**
 * Detailed health check - includes dependency checks
 * GET /api/health/detailed
 */
router.get("/detailed", async (req, res) => {
  const checks = {
    server: "healthy",
    manifests: "unknown",
    filesystem: "unknown",
  };

  let overallStatus = "healthy";

  // Check if manifest directories are accessible
  try {
    const manifestDir = path.join(process.cwd(), "src", "images", "Portfolios");
    await fs.access(manifestDir);
    checks.manifests = "accessible";
  } catch (err) {
    checks.manifests = "error";
    overallStatus = "degraded";
  }

  // Check filesystem write permissions (logs directory)
  try {
    const logsDir = path.join(process.cwd(), "logs");
    await fs.access(logsDir, fsConstants.W_OK);
    checks.filesystem = "writable";
  } catch (err) {
    checks.filesystem = "read-only";
    // This is not critical, so don't degrade status
  }

  const statusCode = overallStatus === "healthy" ? 200 : 503;

  res.status(statusCode).json({
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks,
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
  });
});

/**
 * Readiness probe - for Kubernetes/container orchestration
 * GET /api/health/ready
 */
router.get("/ready", (req, res) => {
  // Add any async initialization checks here
  // For now, if the server is running, it's ready
  res.status(200).json({
    ready: true,
    timestamp: new Date().toISOString(),
  });
});

/**
 * Liveness probe - for Kubernetes/container orchestration
 * GET /api/health/live
 */
router.get("/live", (req, res) => {
  res.status(200).json({
    alive: true,
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
