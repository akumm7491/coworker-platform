# Build stage
FROM node:18-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./
COPY vite.config.ts ./

# Install dependencies
RUN npm install

# Copy source code
COPY src/ ./src/
COPY public/ ./public/
COPY index.html ./

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install serve to run the application
RUN npm install -g serve

# Copy built assets from builder stage
COPY --from=builder /app/dist ./dist

EXPOSE 5175

CMD ["serve", "-s", "dist", "-l", "5175"]
