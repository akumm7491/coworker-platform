#!/bin/bash

# Create a temporary build context
rm -rf server/build-context
mkdir -p server/build-context

# Copy server files
cp server/package*.json server/build-context/
cp server/tsconfig.json server/build-context/
cp -r server/src server/build-context/

# Copy shared directory
cp -r shared server/build-context/shared

echo "Build context prepared"
