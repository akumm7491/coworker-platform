#!/bin/bash

# Set Node.js options for ESM and TypeScript
export NODE_OPTIONS="--experimental-loader ts-node/esm --no-warnings --experimental-specifier-resolution=node"

# Start the development server
npx ts-node --esm src/index.ts
