# McCal Media API

RESTful API server for serving portfolio data, manifests, and media assets. Designed to integrate with the existing static site and Squarespace widgets.

## Features

- 🚀 Express.js-based REST API
- 📦 In-memory caching with configurable TTL
- 🔒 CORS configuration for Squarespace integration
- 💚 Health check endpoints for monitoring
- 📊 Manifest serving with cache control
- 🛡️ Error handling and request logging

## Quick Start

### Prerequisites

- Node.js >= 16.0.0
- npm or yarn

### Installation

Dependencies are already installed at the workspace root. No additional installation needed.

### Running the Server

```bash
# Start the server (production mode)
npm run api:start

# Start with auto-reload (development mode, requires nodemon)
npm run api:dev

# Test if server is running
npm run api:test
```

The API will be available at `http://localhost:3001`

## API Endpoints

### Root

```
GET /
```

Returns API information and available endpoints.

**Response:**

```json
{
  "name": "McCal Media API",
  "version": "1.0.0",
  "status": "running",
  "endpoints": {
    "health": "/api/health",
    "v1": {
      "health": "/api/v1/health",
      "manifests": "/api/v1/manifests"
    }
  }
}
```

### Health Checks

#### Basic Health Check

```
GET /api/health
```

Returns server health status and basic metrics.

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2025-11-21T18:00:00.000Z",
  "uptime": 123.456,
  "memory": {
    "used": 7,
    "total": 9,
    "unit": "MB"
  }
}
```

#### Detailed Health Check

```
GET /api/health/detailed
```

Returns comprehensive health status including dependency checks.

#### Readiness Probe

```
GET /api/health/ready
```

For Kubernetes/container orchestration readiness checks.

#### Liveness Probe

```
GET /api/health/live
```

For Kubernetes/container orchestration liveness checks.

### Manifests

#### List All Manifests

```
GET /api/v1/manifests
```

Returns a list of all available manifest types.

**Response:**

```json
{
  "manifests": [
    {
      "type": "concert",
      "endpoint": "/api/v1/manifests/concert"
    },
    {
      "type": "events",
      "endpoint": "/api/v1/manifests/events"
    }
    // ... more manifests
  ],
  "total": 7,
  "cacheStatus": {
    "cached": 3,
    "ttl": "5 minutes"
  }
}
```

#### Get Specific Manifest

```
GET /api/v1/manifests/:type
```

Returns manifest data for a specific portfolio type.

**Available Types:**

- `concert` - Concert photography portfolio
- `events` - Events photography portfolio
- `journalism` - Photojournalism portfolio
- `nature` - Nature photography portfolio
- `portrait` - Portrait photography portfolio
- `featured` - Featured work portfolio
- `universal` - Universal/combined portfolio

**Response:**

```json
{
  "type": "concert",
  "data": {
    "bands": [...],
    "totalBands": 16,
    "generated": "2025-11-21T18:00:00.000Z",
    "version": "2.0"
  },
  "meta": {
    "timestamp": "2025-11-21T18:00:00.000Z",
    "cached": false
  }
}
```

**Response Headers:**

- `X-Cache: HIT` - Data served from cache
- `X-Cache: MISS` - Data read from filesystem

#### Clear Manifest Cache

```
POST /api/v1/manifests/cache/clear
```

Clears the in-memory manifest cache. Useful during development.

**Response:**

```json
{
  "message": "Cache cleared successfully",
  "clearedCount": 3,
  "timestamp": "2025-11-21T18:00:00.000Z"
}
```

#### Get Cache Statistics

```
GET /api/v1/manifests/cache/stats
```

Returns cache statistics and memory usage.

## Configuration

### Environment Variables

Create a `.env` file in the `src/api/` directory (see `.env.example`):

```bash
# Server Configuration
API_PORT=3001
NODE_ENV=development

# CORS Configuration (comma-separated)
# ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Cache Configuration
CACHE_TTL_MINUTES=5
```

### CORS Configuration

By default, the API allows requests from:

- `localhost:3000` and `localhost:3001` (local development)
- `*.squarespace.com` (Squarespace preview)
- `*.sqsp.com` (Squarespace CDN)
- Custom domains matching `/mccalmedia\.com$/`

To add more origins, modify the `corsOptions` in `server.js`.

## Caching

The API implements in-memory caching for manifest data:

- **Default TTL:** 5 minutes
- **Cache Strategy:** LRU (Least Recently Used)
- **Cache Key:** Manifest type (concert, events, etc.)

Cache can be cleared manually via the `/api/v1/manifests/cache/clear` endpoint.

## Error Handling

All errors return a consistent JSON format:

```json
{
  "error": "Error Type",
  "message": "Detailed error message",
  "timestamp": "2025-11-21T18:00:00.000Z"
}
```

Common status codes:

- `200` - Success
- `404` - Resource not found
- `403` - CORS error
- `500` - Internal server error

## Development

### Project Structure

```
src/api/
├── server.js                # Main server entry point
├── routes/
│   ├── health.js           # Health check endpoints (non-versioned alias)
│   └── manifests.js        # Manifest endpoints
├── versions/
│   └── v1/
│       ├── index.js        # v1 router aggregator (/api/v1/*)
│       └── health.js       # v1 health routes (/api/v1/health)
├── .env.example            # Environment variables template
├── .gitignore              # Git ignore rules
└── README.md               # This file
```

### Adding New Routes

1. Create a new route file in `routes/`:

```javascript
// routes/myroute.js
const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Hello!" });
});

module.exports = router;
```

2. Import and use in `server.js`:

```javascript
const myRoute = require("./routes/myroute");
const v1 = require("./versions/v1");
v1.use("/myroute", myRoute);
app.use("/api/v1", v1);
```

### Testing

```bash
# Health check
curl http://localhost:3001/api/health

# List manifests
curl http://localhost:3001/api/v1/manifests

# Get specific manifest
curl http://localhost:3001/api/v1/manifests/concert

# With pretty JSON output
curl -s http://localhost:3001/api/health | jq
```

## Integration with Widgets

To consume the API from widgets:

```javascript
// Fetch manifest data
async function loadPortfolio() {
  try {
    const response = await fetch(
      "http://localhost:3001/api/v1/manifests/concert"
    );
    const { data } = await response.json();

    // Use the data
    console.log("Bands:", data.bands);
  } catch (error) {
    console.error("Failed to load portfolio:", error);
    // Fallback to static manifest
  }
}
```

### Supported Widgets

The following widgets support optional API loading via `data-api="on"`:

- **Concert Portfolio v4.7.1** - `/api/v1/manifests/concert`
  - File: `src/widgets/concert-portfolio/versions/v4.7.1-api-optional.html`
  - Data shape: `response.data.bands[]`

For implementation details and patterns to add API support to other widgets, see:

- `docs/integrations/api-integration-guide.md`

## Frontend integration in local development (proxy)

During local development, you can avoid CORS and use same-origin calls via the dev server proxy:

```bash
# Start site + API together with proxy enabled
npm run dev:with-api
```

- The site runs at http://localhost:3000 and proxies /api/\* to http://localhost:3001
- In the browser, call relative endpoints like `/api/v1/manifests/concert`
- Example (inside client code):

```javascript
const res = await fetch("/api/v1/manifests/concert");
const { data } = await res.json();
```

If the API is down, implement a graceful fallback to static manifests to keep widgets functional.

## Deployment

### Option 1: Serverless Functions (Recommended)

Deploy as serverless functions on:

- **Netlify Functions** - Easy Squarespace integration
- **Vercel Serverless** - Zero-config deployment
- **AWS Lambda** - Scalable, pay-per-use

### Option 2: Container Deployment

Deploy as a containerized app on:

- **Railway** - Simple container hosting
- **Fly.io** - Global edge deployment
- **Heroku** - Traditional PaaS

### Option 3: Traditional Hosting

Deploy on VPS or cloud hosting:

- Use PM2 for process management
- Configure nginx as reverse proxy
- Set up SSL/TLS certificates

See `docs/deployment/` for detailed deployment guides (coming soon).

## Roadmap

- [ ] Authentication & API keys
- [ ] Rate limiting per client
- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] Image optimization endpoints
- [ ] GraphQL interface
- [ ] WebSocket support for real-time updates
- [ ] OpenAPI/Swagger documentation
- [ ] Performance metrics & monitoring

## Troubleshooting

### Port Already in Use

If port 3001 is already in use:

```bash
# Find process using port 3001
lsof -ti:3001

# Kill the process
kill -9 $(lsof -ti:3001)

# Or change the port
API_PORT=3002 npm run api:start
```

### CORS Errors

If you see CORS errors in the browser console:

1. Check that the origin is allowed in `corsOptions` (server.js)
2. Ensure credentials are properly configured
3. In development, all origins are allowed by default

### Manifest Not Found

If manifests return 404:

```bash
# Generate all manifests
npm run manifest:generate

# Verify manifest files exist
ls -la src/images/Portfolios/Concert/concert-manifest.json
```

## License

MIT - See LICENSE file in repository root

## Support

For issues, questions, or contributions, please refer to the main repository documentation.

---

**Version:** 1.0.0  
**Last Updated:** 2025-11-21
