// API v1 Router
// Aggregates versioned routes for v1

const express = require("express");
const router = express.Router();

// Routes
const v1Health = require("./health");
const manifestRoutes = require("../../routes/manifests");
const webhookRoutes = require("../../routes/webhooks");
const adminRoutes = require("../../routes/admin");
const blogRoutes = require("../../routes/blog");
if (process.env.NODE_ENV !== "production") {
  console.log("[v1] Mounting blog routes under /blog");
}

// Debug: log v1 router traffic (development only)
router.use((req, res, next) => {
  if (process.env.NODE_ENV !== "production") {
    console.log(`[v1] ${req.method} ${req.originalUrl}`);
  }
  next();
});

// Mount under v1 namespace
router.use("/health", v1Health);
router.use("/manifests", manifestRoutes);
router.use("/webhooks", webhookRoutes);
router.use("/admin", adminRoutes);
router.use("/blog", blogRoutes);

// Simple ping for v1 router verification
router.get("/ping", (req, res) => {
  res.json({ ok: true, version: "v1" });
});

module.exports = router;
