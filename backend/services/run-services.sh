#!/bin/bash

# Function to run tests for a service
run_tests() {
    local service=$1
    echo "Running tests for $service..."
    cd $service
    npm install
    npm test
    cd ..
}

# Function to start a service
start_service() {
    local service=$1
    echo "Starting $service..."
    cd $service
    npm install
    npm run dev &
    cd ..
}

# Make the script executable from any directory
cd "$(dirname "$0")"

if [ "$1" = "test" ]; then
    # Run tests for both services
    run_tests "task-service"
    run_tests "identity-service"
elif [ "$1" = "start" ]; then
    # Start both services in development mode
    start_service "task-service"
    start_service "identity-service"
    
    # Keep the script running and handle Ctrl+C
    echo "Services are running. Press Ctrl+C to stop all services."
    trap "trap - SIGTERM && kill -- -$$" SIGINT SIGTERM EXIT
    wait
else
    echo "Usage: ./run-services.sh [test|start]"
    echo "  test  - Run tests for both services"
    echo "  start - Start both services in development mode"
    exit 1
fi
