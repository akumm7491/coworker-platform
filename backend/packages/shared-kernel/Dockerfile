# Base stage for common dependencies
FROM node:20-alpine as base
WORKDIR /app
RUN apk add --no-cache python3 make g++

# Dependencies stage
FROM base as dependencies
WORKDIR /app
COPY package*.json ./
RUN npm install --no-package-lock

# Builder stage
FROM base as builder
WORKDIR /app
COPY package*.json ./
RUN npm install --no-package-lock
COPY . .
RUN npm install -g typescript
RUN tsc

# Production stage
FROM node:20-alpine as production
WORKDIR /app

# Copy built files and dependencies
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package*.json ./

# Install production dependencies only
ENV NODE_ENV=production
RUN npm install --omit=dev --no-package-lock

# Set the command to run the compiled JavaScript
CMD ["node", "dist/index.js"]
