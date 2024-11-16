# Build stage
FROM node:20-alpine as builder

# Install build dependencies
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY src/services/analytics ./src/services/analytics
COPY src/shared ./src/shared

# Build TypeScript code
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built files from builder stage
COPY --from=builder /app/dist/services/analytics ./dist/services/analytics
COPY --from=builder /app/dist/shared ./dist/shared
COPY --from=builder /app/node_modules ./node_modules

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT}/health || exit 1

# Default environment variables
ENV NODE_ENV=production \
    PORT=3005 \
    SERVICE_NAME=analytics-service \
    NODE_OPTIONS="--experimental-specifier-resolution=node --es-module-specifier-resolution=node" \
    METRICS_RETENTION_DAYS=30 \
    AGGREGATION_INTERVAL=60000 \
    MAX_BATCH_SIZE=1000

# Install additional tools for health checks and monitoring
RUN apk add --no-cache curl jq

# Create directories for data persistence
RUN mkdir -p /app/data/metrics /app/data/events

# Expose ports for main service and metrics
EXPOSE 3005
EXPOSE 9090

# Start the application
CMD ["node", "dist/services/analytics/index.js"]
