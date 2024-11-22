#!/bin/bash

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

# Show usage
show_usage() {
    echo "Usage: ./dev.sh [command]"
    echo
    echo "Commands:"
    echo "  start       Start the development environment"
    echo "  stop        Stop the development environment"
    echo "  restart     Restart the development environment"
    echo "  logs        Show logs (use -f to follow)"
    echo "  status      Show status of all services"
    echo "  rebuild     Rebuild and restart services"
    echo "  clean       Stop and remove all containers, volumes, and images"
    echo "  shell       Open a shell in a container (e.g., ./dev.sh shell frontend)"
    echo
    echo "Examples:"
    echo "  ./dev.sh start"
    echo "  ./dev.sh logs -f"
    echo "  ./dev.sh shell frontend"
}

# Check if Docker is running
check_docker() {
    if ! docker info &> /dev/null; then
        print_error "Docker is not running"
        print_status "Please start Docker Desktop and try again"
        exit 1
    fi
}

# Start development environment
start_dev() {
    print_status "Starting development environment..."
    docker compose -f docker-compose.dev.yml up -d
    print_status "Development environment started!"
    print_status "Frontend: http://localhost:3456"
    print_status "API Gateway: http://localhost:3450"
    print_status "Identity Service: http://localhost:3451"
    print_status "Agent Service: http://localhost:3452"
    print_status "Monitoring Service: http://localhost:3453"
    print_status "Collaboration Service: http://localhost:3454"
    print_status "PostgreSQL: postgresql://localhost:5433"
    print_status "Redis: redis://localhost:6379"
    print_status "Kafka: localhost:9092"
}

# Stop development environment
stop_dev() {
    print_status "Stopping development environment..."
    docker compose -f docker-compose.dev.yml down
}

# Show logs
show_logs() {
    if [ "$1" = "-f" ]; then
        docker compose -f docker-compose.dev.yml logs --tail=100 -f
    else
        docker compose -f docker-compose.dev.yml logs --tail=100
    fi
}

# Show status
show_status() {
    print_status "Development environment status:"
    docker compose -f docker-compose.dev.yml ps
}

# Rebuild services
rebuild_services() {
    print_status "Rebuilding services..."
    # First, rebuild all the services
    docker compose -f docker-compose.dev.yml build \
        frontend \
        api-gateway \
        identity-service \
        agent-service \
        monitoring-service \
        collaboration-service

    # Then start everything including dependencies
    docker compose -f docker-compose.dev.yml up -d
}

# Clean everything
clean_env() {
    print_warning "This will remove all containers, volumes, and images. Are you sure? (y/n)"
    read -r answer
    if [ "$answer" = "y" ]; then
        print_status "Cleaning development environment..."
        docker compose -f docker-compose.dev.yml down -v --rmi all
        print_status "Development environment cleaned!"
    fi
}

# Open shell in container
open_shell() {
    if [ -z "$1" ]; then
        print_error "Please specify a service name"
        echo "Available services:"
        docker compose -f docker-compose.dev.yml ps --services
        exit 1
    fi

    if ! docker compose -f docker-compose.dev.yml ps --services | grep -q "^$1$"; then
        print_error "Service '$1' not found"
        echo "Available services:"
        docker compose -f docker-compose.dev.yml ps --services
        exit 1
    fi

    print_status "Opening shell in $1 container..."
    docker compose -f docker-compose.dev.yml exec "$1" sh
}

# Main script
check_docker

case $1 in
    start)
        start_dev
        ;;
    stop)
        stop_dev
        ;;
    restart)
        stop_dev
        start_dev
        ;;
    logs)
        shift
        show_logs "$@"
        ;;
    status)
        show_status
        ;;
    rebuild)
        rebuild_services
        ;;
    clean)
        clean_env
        ;;
    shell)
        shift
        open_shell "$1"
        ;;
    *)
        show_usage
        ;;
esac
