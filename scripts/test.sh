#!/bin/bash

# Exit on error
set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Print with color
print_status() {
    echo -e "${GREEN}==>${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}WARNING:${NC} $1"
}

print_error() {
    echo -e "${RED}ERROR:${NC} $1"
}

# Run unit tests
run_unit_tests() {
    local SERVICE=$1
    
    if [ -z "$SERVICE" ]; then
        print_status "Running all unit tests..."
        
        # Run frontend tests
        print_status "Running frontend tests..."
        npm run test
        
        # Run backend tests for each service
        cd server
        for service in identity project agent billing analytics; do
            print_status "Running $service service tests..."
            npm run test:$service
        done
        cd ..
    else
        print_status "Running $SERVICE tests..."
        if [ "$SERVICE" = "frontend" ]; then
            npm run test
        else
            cd server && npm run test:$SERVICE
        fi
    fi
}

# Run integration tests
run_integration_tests() {
    print_status "Running integration tests..."
    
    # Start test environment if not running
    if ! docker-compose -f docker-compose.test.yml ps | grep -q "Up"; then
        print_status "Starting test environment..."
        docker-compose -f docker-compose.test.yml up -d
        sleep 10
    fi
    
    # Run integration tests
    cd server && npm run test:integration
}

# Run end-to-end tests
run_e2e_tests() {
    print_status "Running end-to-end tests..."
    
    # Start test environment if not running
    if ! docker-compose -f docker-compose.test.yml ps | grep -q "Up"; then
        print_status "Starting test environment..."
        docker-compose -f docker-compose.test.yml up -d
        sleep 10
    fi
    
    # Run Cypress tests
    npm run test:e2e
}

# Generate test coverage report
generate_coverage() {
    print_status "Generating test coverage report..."
    
    # Frontend coverage
    print_status "Generating frontend coverage..."
    npm run test:coverage
    
    # Backend coverage
    print_status "Generating backend coverage..."
    cd server && npm run test:coverage
    
    # Merge coverage reports
    print_status "Merging coverage reports..."
    npx nyc merge coverage/frontend coverage/backend coverage/merged
    npx nyc report --reporter=html --reporter=text -t coverage/merged
}

# Clean up test artifacts
cleanup_tests() {
    print_status "Cleaning up test artifacts..."
    
    # Stop test containers
    docker-compose -f docker-compose.test.yml down
    
    # Remove coverage reports
    rm -rf coverage
    rm -rf server/coverage
    
    # Remove test databases
    docker volume rm $(docker volume ls -q | grep "test") || true
}

# Main function
main() {
    case "$1" in
        "unit")
            run_unit_tests "$2"
            ;;
        "integration")
            run_integration_tests
            ;;
        "e2e")
            run_e2e_tests
            ;;
        "coverage")
            generate_coverage
            ;;
        "cleanup")
            cleanup_tests
            ;;
        "all")
            run_unit_tests
            run_integration_tests
            run_e2e_tests
            generate_coverage
            ;;
        *)
            echo "Usage: $0 {unit [service]|integration|e2e|coverage|cleanup|all}"
            exit 1
            ;;
    esac
}

# Run main function with arguments
main "$@"
