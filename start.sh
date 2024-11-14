#!/bin/bash

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Docker is not installed. Please install Docker first."
    exit 1
fi

# Function to check Docker Compose version
check_docker_compose() {
    if ! docker compose version &> /dev/null; then
        echo "Docker Compose V2 is not available. Please make sure you have Docker Desktop installed with Compose V2."
        exit 1
    fi
}

# Check Docker Compose
check_docker_compose

# Default to development mode if no argument is provided
MODE=${1:-dev}

if [ "$MODE" = "dev" ]; then
    echo "Starting in development mode..."
    ./docker/dev.sh
elif [ "$MODE" = "prod" ]; then
    echo "Starting in production mode..."
    ./docker/prod.sh
else
    echo "Invalid mode. Use 'dev' or 'prod'"
    exit 1
fi
