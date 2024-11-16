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
COPY src/services/identity ./src/services/identity
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
COPY --from=builder /app/dist/services/identity ./dist/services/identity
COPY --from=builder /app/dist/shared ./dist/shared
COPY --from=builder /app/node_modules ./node_modules

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT}/health || exit 1

# Default environment variables
ENV NODE_ENV=production \
    PORT=3001 \
    SERVICE_NAME=identity-service \
    NODE_OPTIONS="--experimental-specifier-resolution=node --es-module-specifier-resolution=node"

# Expose port
EXPOSE 3001

# Start the application
CMD ["node", "dist/services/identity/index.js"]
