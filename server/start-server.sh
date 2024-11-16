#!/bin/sh
export NODE_ENV=development
export DEBUG=*

# Install global dependencies
npm install -g tsx

# Start the server
exec tsx watch src/index.ts
