#!/bin/bash

# API Development Setup Script
# Sets up local development environment with proper port management

set -e

API_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT_MANIFEST="$API_DIR/.port-lock"
DEFAULT_PORT=3001

# Color output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

function find_available_port() {
  local port=$DEFAULT_PORT
  while lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; do
    echo -e "${YELLOW}Port $port in use, trying $((port + 1))...${NC}"
    port=$((port + 1))
    if [ $port -gt 3020 ]; then
      echo -e "${RED}Cannot find available port in range 3001-3020${NC}"
      return 1
    fi
  done
  echo $port
}

function cleanup() {
  if [ -f "$PORT_MANIFEST" ]; then
    STORED_PORT=$(cat "$PORT_MANIFEST")
    echo -e "${YELLOW}Cleaning up port manifest for port $STORED_PORT${NC}"
    rm -f "$PORT_MANIFEST"
  fi
}

function setup_environment() {
  echo -e "${GREEN}Setting up API development environment...${NC}"
  
  # Kill any existing processes on default port
  pkill -f "npm run api:dev" 2>/dev/null || true
  pkill -f "node.*server.js" 2>/dev/null || true
  
  sleep 2
  
  # Find available port
  AVAILABLE_PORT=$(find_available_port)
  if [ $? -ne 0 ]; then
    exit 1
  fi
  
  echo "$AVAILABLE_PORT" > "$PORT_MANIFEST"
  
  echo -e "${GREEN}✅ Using port: $AVAILABLE_PORT${NC}"
  echo ""
  echo "Starting API development server..."
  echo "  - API Base: http://localhost:$AVAILABLE_PORT"
  echo "  - Blog Routes: http://localhost:$AVAILABLE_PORT/api/v1/blog"
  echo "  - Manifests: http://localhost:$AVAILABLE_PORT/api/v1/manifests"
  echo ""
  
  # Start API with proper port
  export API_PORT=$AVAILABLE_PORT
  export NODE_ENV=development
  export WEBHOOK_SECRET=dev-webhook-secret-12345
  export BLOG_JWT_SECRET=dev-blog-secret-12345
  
  cd "$API_DIR"
  npm run api:dev
}

# Trap cleanup on exit
trap cleanup EXIT

# Run setup
setup_environment
