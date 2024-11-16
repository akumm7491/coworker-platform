#!/bin/sh

# Set environment variables
export NODE_ENV=development
export DEBUG=*

# Install global dependencies if needed
npm install -g ts-node@10.9.2

# Start the server
exec node --loader ts-node/esm --experimental-specifier-resolution=node src/index.ts
