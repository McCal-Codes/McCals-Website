# Widget API Quick Reference

## Enable API Loading

Add to any supported widget container:
```html
<div id="widgetPf" data-api="on">
```

## Available Endpoints

| Portfolio Type | Endpoint | Widget Versions |
|---------------|----------|-----------------|
| Concert | `/api/v1/manifests/concert` | v4.7.1+ |
| Events | `/api/v1/manifests/events` | *Ready* |
| Journalism | `/api/v1/manifests/journalism` | *Ready* |
| Portrait | `/api/v1/manifests/portrait` | *Ready* |
| Nature | `/api/v1/manifests/nature` | *Ready* |
| Featured | `/api/v1/manifests/featured` | *Ready* |
| Universal | `/api/v1/manifests/universal` | *Ready* |

## Dev Commands

```bash
# Start with API proxy
npm run dev:with-api

# Start API only
npm run api:start

# Test API health
curl http://localhost:3001/api/health

# List all manifests
curl http://localhost:3001/api/v1/manifests

# Get specific manifest
curl http://localhost:3001/api/v1/manifests/concert

# Clear cache
curl -X POST http://localhost:3001/api/v1/manifests/cache/clear

# Cache stats
curl http://localhost:3001/api/v1/manifests/cache/stats
```

## Response Format

```json
{
  "type": "concert",
  "data": {
    "version": "1.0",
    "generated": "2025-11-23T...",
    "bands": [...]
  },
  "meta": {
    "timestamp": "2025-11-23T...",
    "cached": false
  }
}
```

## Widget Data Access

In widget JavaScript:
```javascript
const response = await fetch('/api/v1/manifests/TYPE');
const json = await response.json();
const manifest = json.data;  // Your manifest data
```

## Fallback Behavior

1. **API enabled** (`data-api="on"`):
   - Try `/api/v1/manifests/TYPE` first
   - Fall back to GitHub Raw on error
   
2. **API disabled** (default):
   - Uses GitHub Raw directly
   - No API calls made

## Cache

- **TTL**: 5 minutes
- **Storage**: In-memory (clears on server restart)
- **Management**: See endpoints above

## See Also

- Full guide: `docs/integrations/api-integration-guide.md`
- API docs: `src/api/README.md`
- Example: `src/widgets/concert-portfolio/versions/v4.7.1-api-optional.html`
