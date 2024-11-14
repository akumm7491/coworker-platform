#!/bin/bash

# Default to development mode
ENV=${1:-dev}

# Function to check if a port is in use
check_port() {
    if lsof -i :$1 > /dev/null; then
        return 0
    else
        return 1
    fi
}

# Function to stop processes on a port
stop_port() {
    if check_port $1; then
        echo "Stopping process on port $1..."
        lsof -ti :$1 | xargs kill -9
        sleep 2
    fi
}

# Function to clean up Docker resources
cleanup_docker() {
    echo "Cleaning up Docker resources..."
    if [ "$ENV" = "prod" ]; then
        docker compose down --remove-orphans
    else
        docker compose -f docker-compose.dev.yml down --remove-orphans
    fi
    docker system prune -f
}

# Stop any existing processes
if [ "$ENV" = "prod" ]; then
    stop_port 80   # Frontend production
else
    stop_port 5175 # Frontend development
fi
stop_port 8000  # Backend

# Clean up Docker resources
cleanup_docker

# Start the application using Docker Compose
if [ "$ENV" = "prod" ]; then
    echo "Starting the application in production mode..."
    docker compose up --build
else
    echo "Starting the application in development mode..."
    docker compose -f docker-compose.dev.yml up --build
fi

# Trap Ctrl+C and clean up
trap 'cleanup_docker' INT