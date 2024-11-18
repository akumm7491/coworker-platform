# Development stage
FROM node:18.20.4-alpine

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++ git

# Copy package files
COPY server/package*.json ./server/
COPY server/tsconfig.json ./server/

# Set working directory to server
WORKDIR /app/server

# Install dependencies with legacy peer deps to handle compatibility issues
RUN npm install --legacy-peer-deps

# Copy source code
COPY server/src/ ./src/
COPY shared/ ../shared/

# Set Node.js options for development
ENV NODE_ENV=development
ENV DEBUG=*
ENV NODE_OPTIONS="--experimental-specifier-resolution=node"

EXPOSE 3457

# Start the server in development mode
CMD ["npm", "run", "dev"]
