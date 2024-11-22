FROM node:18-alpine

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose the service port
EXPOSE 3000

# Start the service
CMD ["npm", "run", "start:prod"]
