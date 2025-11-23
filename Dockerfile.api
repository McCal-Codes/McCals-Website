# McCal Media API Server - Docker Container
# Optimized for API-only deployment

FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy scripts folder needed for postinstall
COPY scripts ./scripts

# Install dependencies (production only for smaller image)
RUN npm ci --only=production

# Copy only necessary files for API
COPY src/api ./src/api
COPY src/images/Portfolios ./src/images/Portfolios

# Expose API port
EXPOSE 3001

# Health check for API
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/health || exit 1

# Set environment variables
ENV NODE_ENV=production
ENV API_PORT=3001

# Start the API server
CMD ["node", "src/api/server.js"]
