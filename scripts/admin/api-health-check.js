#!/usr/bin/env node

/**
 * API Development Health Check
 *
 * Validates that the API development environment is properly set up
 * and running. Runs a series of tests against the API endpoints.
 */

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.API_PORT || 3001;
const HOST = "localhost";
const BASE_URL = `http://${HOST}:${PORT}`;

// Color output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
};

function log(message, color = "reset") {
  console.log(
    `${colors[color]}${message}${colors.reset} - api-health-check.js:29`
  );
}

function logSuccess(message) {
  log(`✅ ${message}`, "green");
}

function logError(message) {
  log(`❌ ${message}`, "red");
}

function logInfo(message) {
  log(`ℹ️  ${message}`, "cyan");
}

function logWarn(message) {
  log(`⚠️  ${message}`, "yellow");
}

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      timeout: 5000,
      headers: {
        "Content-Type": "application/json",
      },
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data ? JSON.parse(data) : null,
            rawBody: data,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: null,
            rawBody: data,
          });
        }
      });
    });

    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Request timeout"));
    });

    req.on("error", reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function checkFilesExist() {
  log("\n📁 Checking required files...", "bold");

  const files = [
    "src/api/server.js",
    "src/api/versions/v1/index.js",
    "src/api/routes/blog.js",
    "src/api/routes/webhooks.js",
    "src/api/config/blog-authors.json",
    "src/images/blog/blog-posts.json",
  ];

  let allExist = true;
  for (const file of files) {
    const fullPath = path.join(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      logSuccess(`${file}`);
    } else {
      logError(`${file} - MISSING`);
      allExist = false;
    }
  }

  return allExist;
}

async function checkPortAvailable() {
  log("\n🔌 Checking API connection...", "bold");

  try {
    const response = await makeRequest("GET", "/api/health");
    logSuccess(`API is responding on port ${PORT}`);
    logInfo(`Status: ${response.status}`);
    return true;
  } catch (error) {
    logError(`Cannot connect to API on port ${PORT}`);
    logError(`Error: ${error.message}`);
    return false;
  }
}

async function testEndpoints() {
  log("\n🧪 Testing API endpoints...", "bold");

  const tests = [
    {
      name: "Health Check",
      method: "GET",
      path: "/api/health",
      expectedStatus: 200,
    },
    {
      name: "Blog Posts List",
      method: "GET",
      path: "/api/v1/blog/posts",
      expectedStatus: 200,
    },
    {
      name: "Manifests List",
      method: "GET",
      path: "/api/v1/manifests",
      expectedStatus: 200,
    },
    {
      name: "Concert Manifest",
      method: "GET",
      path: "/api/v1/manifests/concert",
      expectedStatus: [200, 404], // 404 is OK if not generated yet
    },
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const response = await makeRequest(test.method, test.path);
      const expectedArray = Array.isArray(test.expectedStatus)
        ? test.expectedStatus
        : [test.expectedStatus];

      if (expectedArray.includes(response.status)) {
        logSuccess(`${test.name} (${response.status})`);
        passed++;
      } else {
        logError(
          `${test.name} - Expected ${test.expectedStatus}, got ${response.status}`
        );
        failed++;
      }
    } catch (error) {
      logError(`${test.name} - ${error.message}`);
      failed++;
    }
  }

  log(
    `\nResults: ${passed} passed, ${failed} failed`,
    passed > 0 ? "green" : "red"
  );
  return failed === 0;
}

async function checkConfiguration() {
  log("\n⚙️  Checking configuration...", "bold");

  // Check blog authors config
  try {
    const authPath = path.join(
      process.cwd(),
      "src/api/config/blog-authors.json"
    );
    const authConfig = JSON.parse(fs.readFileSync(authPath, "utf-8"));

    if (authConfig.authors && authConfig.authors.length > 0) {
      const authors = authConfig.authors.map((a) => a.username).join(", ");
      logSuccess(`Blog authors configured: ${authors}`);
    } else {
      logWarn(`No blog authors configured`);
    }
  } catch (error) {
    logError(`Cannot read blog authors config: ${error.message}`);
  }

  // Check blog posts
  try {
    const postsPath = path.join(
      process.cwd(),
      "src/images/blog/blog-posts.json"
    );
    const posts = JSON.parse(fs.readFileSync(postsPath, "utf-8"));

    if (Array.isArray(posts) && posts.length > 0) {
      logSuccess(`Blog posts file exists with ${posts.length} posts`);
    } else {
      logWarn(`Blog posts file is empty`);
    }
  } catch (error) {
    logError(`Cannot read blog posts: ${error.message}`);
  }

  // Check environment variables
  const envVars = {
    NODE_ENV: process.env.NODE_ENV || "not set",
    API_PORT: process.env.API_PORT || "not set",
    WEBHOOK_SECRET: process.env.WEBHOOK_SECRET ? "***" : "not set",
    BLOG_JWT_SECRET: process.env.BLOG_JWT_SECRET ? "***" : "not set",
  };

  for (const [key, value] of Object.entries(envVars)) {
    logInfo(`${key}: ${value}`);
  }
}

async function runHealthCheck() {
  log(`\n${colors.bold}🏥 API Development Health Check${colors.reset}`);
  log(`Base URL: ${BASE_URL}\n`, "cyan");

  try {
    // Step 1: Check files
    const filesOk = await checkFilesExist();

    // Step 2: Check port
    const portOk = await checkPortAvailable();

    if (!portOk) {
      log("\n⚠️  API is not running. Start it with:", "yellow");
      log("   npm run api:setup-dev\n", "yellow");
      process.exit(1);
    }

    // Step 3: Test endpoints
    const endpointsOk = await testEndpoints();

    // Step 4: Check configuration
    await checkConfiguration();

    // Summary
    log("\n" + "=".repeat(50), "bold");
    if (filesOk && portOk && endpointsOk) {
      logSuccess("All checks passed! API is ready for development.");
      log("\nNext steps:", "cyan");
      log("  1. Start the site dev server: npm run dev", "cyan");
      log("  2. Test widgets at http://localhost:3000", "cyan");
      log("  3. Create blog posts and test authoring", "cyan");
    } else {
      logWarn("Some checks failed. See above for details.");
    }
    log("=".repeat(50) + "\n", "bold");
  } catch (error) {
    logError(`Unexpected error: ${error.message}`);
    process.exit(1);
  }
}

// Run the health check
runHealthCheck().catch((error) => {
  logError(`Fatal error: ${error.message}`);
  process.exit(1);
});
