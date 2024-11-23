# Base stage for common dependencies
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache python3 make g++

# Dependencies stage
FROM base AS dependencies
WORKDIR /app

# Copy the entire monorepo structure
COPY . .

# Build and install shared kernel
WORKDIR /app/backend/packages/shared-kernel
RUN npm install --no-package-lock && npm run build

# Build and install task service
WORKDIR /app/backend/services/task-service
RUN npm install --no-package-lock

# Production stage
FROM node:20-alpine AS production
WORKDIR /app

# Copy built files and dependencies
COPY --from=dependencies /app/backend/packages/shared-kernel /app/backend/packages/shared-kernel
COPY --from=dependencies /app/backend/services/task-service/dist ./dist
COPY --from=dependencies /app/backend/services/task-service/package*.json ./
COPY --from=dependencies /app/backend/services/task-service/.env* ./
COPY --from=dependencies /app/backend/services/task-service/.npmrc ./

# Install production dependencies
ENV NODE_ENV=production
WORKDIR /app/backend/packages/shared-kernel
RUN npm install --omit=dev --no-package-lock

WORKDIR /app
RUN npm install --omit=dev --no-package-lock

# Expose the port the app runs on
EXPOSE 3001

# Set the command to run the compiled JavaScript
CMD ["node", "dist/main.js"]
