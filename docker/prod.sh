#!/bin/bash

# Stop any running containers
echo "Stopping any running containers..."
docker compose down

# Build and start containers in detached mode
echo "Building and starting containers in production mode..."
docker compose up --build -d

# Show logs
echo "Showing container logs..."
docker compose logs -f
