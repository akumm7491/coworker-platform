# Base stage for common dependencies
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache python3 make g++

# Build shared kernel
FROM base AS shared-kernel
WORKDIR /app/shared-kernel
COPY backend/packages/shared-kernel/package*.json ./
COPY backend/packages/shared-kernel/tsconfig.json ./
COPY backend/packages/shared-kernel/src ./src
RUN npm install
RUN npm run build
RUN npm pack

# Build task service
FROM base AS builder
WORKDIR /app/task-service
# Copy shared kernel tarball
COPY --from=shared-kernel /app/shared-kernel/coworker-shared-kernel-*.tgz ../
# Copy task service files
COPY backend/services/task-service/package*.json ./
RUN npm install ../coworker-shared-kernel-*.tgz
COPY backend/services/task-service/tsconfig.json ./
COPY backend/services/task-service/src ./src
RUN npm run build

# Production stage
FROM node:20-alpine AS production
WORKDIR /app

# Copy production files
COPY --from=shared-kernel /app/shared-kernel/coworker-shared-kernel-*.tgz ./
COPY --from=builder /app/task-service/dist ./dist
COPY --from=builder /app/task-service/package*.json ./
COPY backend/services/task-service/.env* ./

# Install production dependencies
ENV NODE_ENV=production
RUN npm install coworker-shared-kernel-*.tgz --omit=dev && \
    rm coworker-shared-kernel-*.tgz

# Expose the port the app runs on
EXPOSE 3001

# Set the command to run the compiled JavaScript
CMD ["node", "dist/main.js"]
