#!/bin/bash

# Stop any running containers
echo "Stopping any running containers..."
docker compose -f docker-compose.dev.yml down

# Remove any existing node_modules volumes
echo "Cleaning up volumes..."
docker volume rm $(docker volume ls -q | grep "coworker-platform_node_modules") 2>/dev/null || true

# Prepare backend build context
echo "Preparing backend build context..."
./docker/prepare-backend.sh

# Build and start containers
echo "Building and starting containers..."
docker compose -f docker-compose.dev.yml up --build

# Trap Ctrl+C
trap 'docker compose -f docker-compose.dev.yml down' INT