# Development stage
FROM node:18.20.4-alpine

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy package files
COPY server/package*.json ./
COPY server/tsconfig.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY server/src/ ./src/
COPY shared/ ../shared/

# Set Node.js options for development
ENV NODE_ENV=development
ENV DEBUG=*
ENV NODE_OPTIONS="--experimental-specifier-resolution=node"

EXPOSE 3457

# Start the server in development mode
CMD ["npx", "nodemon", "--exec", "node", "--loader", "ts-node/esm", "src/index.ts"]
