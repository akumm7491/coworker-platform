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

# Check if services are running
check_services() {
    print_status "Checking required services..."
    
    local SERVICES=("postgres" "mongodb" "redis" "kafka" "zookeeper" "elasticsearch")
    local MISSING_SERVICES=()
    
    for service in "${SERVICES[@]}"; do
        if ! docker ps | grep -q "$service"; then
            MISSING_SERVICES+=("$service")
        fi
    done
    
    if [ ${#MISSING_SERVICES[@]} -ne 0 ]; then
        print_warning "Starting missing services: ${MISSING_SERVICES[*]}"
        docker-compose up -d "${MISSING_SERVICES[@]}"
        sleep 10
    fi
}

# Start development environment
start_dev() {
    print_status "Starting development environment..."
    
    # Start infrastructure services if not running
    check_services
    
    # Start all microservices in development mode
    print_status "Starting microservices..."
    
    # Use concurrently to run all services
    concurrently \
        --names "identity,project,agent,billing,analytics" \
        --prefix "[{name}]" \
        --prefix-colors "blue.bold,green.bold,yellow.bold,magenta.bold,cyan.bold" \
        "cd server && npm run dev:identity" \
        "cd server && npm run dev:project" \
        "cd server && npm run dev:agent" \
        "cd server && npm run dev:billing" \
        "cd server && npm run dev:analytics"
}

# Clean up development environment
cleanup() {
    print_status "Cleaning up development environment..."
    
    # Stop all running containers
    docker-compose down
    
    # Remove development certificates
    rm -rf ./certs
    
    # Clean npm caches
    npm cache clean --force
    
    print_status "Development environment cleaned up successfully"
}

# Show service status
show_status() {
    print_status "Service Status:"
    
    echo "Docker Containers:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    
    echo -e "\nKafka Topics:"
    docker-compose exec kafka kafka-topics.sh --list --bootstrap-server localhost:9092
    
    echo -e "\nMicroservices:"
    curl -s http://localhost:3001/health || echo "Identity Service: Not running"
    curl -s http://localhost:3002/health || echo "Project Service: Not running"
    curl -s http://localhost:3003/health || echo "Agent Service: Not running"
    curl -s http://localhost:3004/health || echo "Billing Service: Not running"
    curl -s http://localhost:3005/health || echo "Analytics Service: Not running"
}

# Show logs
show_logs() {
    local SERVICE=$1
    
    if [ -z "$SERVICE" ]; then
        docker-compose logs -f
    else
        docker-compose logs -f "$SERVICE"
    fi
}

# Main function
main() {
    case "$1" in
        "start")
            start_dev
            ;;
        "stop")
            docker-compose down
            ;;
        "restart")
            docker-compose down
            start_dev
            ;;
        "cleanup")
            cleanup
            ;;
        "status")
            show_status
            ;;
        "logs")
            show_logs "$2"
            ;;
        *)
            echo "Usage: $0 {start|stop|restart|cleanup|status|logs [service]}"
            exit 1
            ;;
    esac
}

# Run main function with arguments
main "$@"
