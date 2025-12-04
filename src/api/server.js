/**
 * McCal Media API Server
 *
 * Main API server for serving portfolio data, manifests, and media assets.
 * Designed to work alongside the existing static site and Squarespace integration.
 *
 * @version 1.0.0
 * @date 2025-11-21
 */

const express = require("express");
const cors = require("cors");
const path = require("path");
const compression = require("compression");
const etag = require("etag");

// Import cache client
const cache = require("./cache/redis-client");

// Import route modules
const healthRoutes = require("./routes/health");
const v1Router = require("./versions/v1");

// Configuration
const PORT = process.env.API_PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || "development";

// CORS configuration for local dev and Squarespace domains
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:3001",
      /\.squarespace\.com$/, // Squarespace preview domains
      /\.sqsp\.com$/, // Squarespace CDN
      /mccalmedia\.com$/, // Production domain (adjust as needed)
    ];

    const isAllowed = allowedOrigins.some((pattern) => {
      if (pattern instanceof RegExp) {
        return pattern.test(origin);
      }
      return pattern === origin;
    });

    if (isAllowed || NODE_ENV === "development") {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-API-Key"],
};

// Initialize Express app
const app = express();

// Middleware
app.use(cors(corsOptions));
app.use(compression({ threshold: 1024 })); // Compress responses > 1KB
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path} - server.js:68`);
  next();
});

// API Routes
// Non-versioned alias for health
app.use("/api/health", healthRoutes);
// Versioned API
app.use("/api/v1", v1Router);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    name: "McCal Media API",
    version: "1.0.0",
    status: "running",
    endpoints: {
      health: "/api/health",
      v1: {
        health: "/api/v1/health",
        manifests: "/api/v1/manifests",
      },
    },
    documentation: "/api/docs",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString(),
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error: - server.js:101", err);

  // CORS errors
  if (err.message && err.message.includes("CORS")) {
    return res.status(403).json({
      error: "CORS Error",
      message: "Origin not allowed",
      timestamp: new Date().toISOString(),
    });
  }

  // Generic errors
  res.status(err.status || 500).json({
    error: err.name || "Internal Server Error",
    message: err.message || "An unexpected error occurred",
    ...(NODE_ENV === "development" && { stack: err.stack }),
    timestamp: new Date().toISOString(),
  });
});

// Cache warming function
async function warmCache() {
  const { MANIFEST_CONFIG, MANIFEST_TYPES } = require("./config/manifests");
  const manifestTypes = MANIFEST_TYPES;
  console.log("🔥 Warming cache with all manifests... - server.js:125");

  const fs = require("fs").promises;
  // MANIFEST_CONFIG is imported above

  let warmedCount = 0;
  for (const type of manifestTypes) {
    try {
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
      await cache.set(`manifest:${type}`, manifest);
      warmedCount++;
    } catch (err) {
      console.warn(`⚠️  Failed to warm cache for ${type}: ${err.message}`);
    }
  }

  console.log(
    `✅ Cache warmed: ${warmedCount}/${manifestTypes.length} manifests loaded - server.js:150`
  );
}

// Start server
const server = app.listen(PORT, async () => {
  console.log(
    "\n╔════════════════════════════════════════════════════════╗ - server.js:154"
  );
  console.log(
    "║          McCal Media API Server                        ║ - server.js:155"
  );
  console.log(
    "╚════════════════════════════════════════════════════════╝ - server.js:156"
  );
  console.log(`\n🚀 Server running in ${NODE_ENV} mode - server.js:157`);

  // Initialize Redis cache
  console.log("🔄 Connecting to Redis cache... - server.js:160");
  await cache.connect();

  // Warm the cache on startup
  await warmCache();

  console.log(`📡 API listening on: http://localhost:${PORT} - server.js:165`);
  console.log(`🔗 Root endpoint: http://localhost:${PORT}/ - server.js:166`);
  console.log(
    `💚 Health check: http://localhost:${PORT}/api/health\n - server.js:167`
  );
  console.log("Available routes: - server.js:168");
  console.log(
    "GET  /api/health              Health check (alias) - server.js:169"
  );
  console.log(
    "GET  /api/v1/health           Health check (v1) - server.js:170"
  );
  console.log(
    "GET  /api/v1/manifests        List all manifests - server.js:171"
  );
  console.log(
    "GET  /api/v1/manifests/:type  Get specific manifest\n - server.js:172"
  );
  console.log("Press Ctrl+C to stop\n - server.js:173");
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log(
    "\n⚠️  SIGTERM signal received: closing HTTP server - server.js:144"
  );
  await cache.disconnect();
  server.close(() => {
    console.log("✅ HTTP server closed - server.js:147");
    process.exit(0);
  });
});

process.on("SIGINT", async () => {
  console.log(
    "\n⚠️  SIGINT signal received: closing HTTP server - server.js:152"
  );
  await cache.disconnect();
  server.close(() => {
    console.log("✅ HTTP server closed - server.js:155");
    process.exit(0);
  });
});

module.exports = app;
