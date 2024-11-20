# Development stage
FROM node:18.20.4-alpine

WORKDIR /app/server

# Install build dependencies
RUN apk add --no-cache python3 make g++ git

# Copy package files
COPY server/package*.json ./
COPY server/tsconfig.json ./

# Install dependencies with legacy peer deps to handle compatibility issues
RUN npm install --legacy-peer-deps && \
    npm install -g tsx && \
    npm install reflect-metadata@0.1.13

# Copy source code
COPY server/src/ ./src/
COPY shared/ ../shared/

# Set Node.js options for development
ENV NODE_ENV=development
ENV DEBUG=*

EXPOSE 3457

# Start the server using tsx
CMD ["tsx", "--tsconfig", "tsconfig.json", "src/server.ts"]
