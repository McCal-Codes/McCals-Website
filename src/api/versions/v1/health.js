/**
 * API v1 - Health Check Routes
 */
const express = require("express");
const router = express.Router();
const { promises: fs, constants: fsConstants } = require("fs");
const path = require("path");

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

router.get("/detailed", async (req, res) => {
  const checks = {
    server: "healthy",
    manifests: "unknown",
    filesystem: "unknown",
  };
  let overallStatus = "healthy";
  try {
    const manifestDir = path.join(process.cwd(), "src", "images", "Portfolios");
    await fs.access(manifestDir);
    checks.manifests = "accessible";
  } catch (err) {
    checks.manifests = "error";
    overallStatus = "degraded";
  }
  try {
    const logsDir = path.join(process.cwd(), "logs");
    await fs.access(logsDir, fsConstants.W_OK);
    checks.filesystem = "writable";
  } catch (err) {
    checks.filesystem = "read-only";
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

router.get("/ready", (req, res) => {
  res.status(200).json({ ready: true, timestamp: new Date().toISOString() });
});

router.get("/live", (req, res) => {
  res.status(200).json({ alive: true, timestamp: new Date().toISOString() });
});

module.exports = router;
