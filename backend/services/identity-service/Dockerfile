# Base stage for common dependencies
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache python3 make g++ jq

# Build shared kernel
FROM base AS shared-kernel
WORKDIR /app/backend/packages/shared-kernel
COPY backend/packages/shared-kernel/package*.json ./
COPY backend/packages/shared-kernel/tsconfig.json ./
COPY backend/packages/shared-kernel/src ./src
RUN npm install
RUN npm run build
RUN npm pack

# Build identity service
FROM base AS builder
WORKDIR /app/backend/services/identity-service

# Copy package files first
COPY backend/services/identity-service/package*.json ./

# Create a temporary package.json without the shared-kernel dependency
RUN cp package.json package.json.orig && \
    cat package.json.orig | jq 'del(.dependencies["@coworker/shared-kernel"])' > package.json

# Install dependencies (excluding shared-kernel)
RUN npm install

# Restore original package.json
RUN mv package.json.orig package.json

# Copy and install the shared kernel
COPY --from=shared-kernel /app/backend/packages/shared-kernel/coworker-shared-kernel-*.tgz ./
RUN npm install ./coworker-shared-kernel-*.tgz

# Install TypeScript type definitions
RUN npm install --save-dev @types/bcrypt @types/passport-jwt @types/passport-github2 @types/passport-google-oauth20

# Copy source files
COPY backend/services/identity-service/tsconfig.json ./
COPY backend/services/identity-service/src ./src

# Build the application
RUN npm run build

# Production stage
FROM base AS production
WORKDIR /app

# Copy production files
COPY --from=builder /app/backend/services/identity-service/dist ./dist
COPY --from=builder /app/backend/services/identity-service/package*.json ./

# Create a temporary package.json without the shared-kernel dependency
RUN cp package.json package.json.orig && \
    cat package.json.orig | jq 'del(.dependencies["@coworker/shared-kernel"])' > package.json

# Install production dependencies
ENV NODE_ENV=production
RUN npm install --omit=dev

# Restore original package.json
RUN mv package.json.orig package.json

# Copy and install the shared kernel
COPY --from=shared-kernel /app/backend/packages/shared-kernel/coworker-shared-kernel-*.tgz ./
RUN npm install ./coworker-shared-kernel-*.tgz --omit=dev && \
    rm ./coworker-shared-kernel-*.tgz

# Copy environment files
COPY backend/services/identity-service/.env* ./

# Expose port and start application
EXPOSE 3002
CMD ["npm", "start"]
