# Build stage
FROM node:18-alpine as builder

WORKDIR /app

# Copy package files
COPY server/package*.json ./
COPY server/tsconfig.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY server/src/ ./src/
COPY shared/ ../shared/

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files and install production dependencies
COPY server/package*.json ./
RUN npm install --production

# Copy built assets from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/../shared ../shared

EXPOSE 3457
ENV PORT=3457

CMD ["node", "dist/index.js"]
