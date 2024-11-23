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

# Initialize databases
init_databases() {
    print_status "Initializing databases..."
    
    # Wait for PostgreSQL to be ready
    print_status "Waiting for PostgreSQL to be ready..."
    docker-compose -f docker-compose.dev.yml exec -T postgres sh -c 'until pg_isready; do sleep 1; done'
    
    # Create databases if they don't exist
    docker-compose -f docker-compose.dev.yml exec -T postgres psql -U postgres -c "CREATE DATABASE task_db;" || true
    docker-compose -f docker-compose.dev.yml exec -T postgres psql -U postgres -c "CREATE DATABASE team_db;" || true
    docker-compose -f docker-compose.dev.yml exec -T postgres psql -U postgres -c "CREATE DATABASE agent_db;" || true
    
    print_status "Databases initialized"
}

# Start development environment
start_dev() {
    print_status "Starting development environment..."
    docker-compose -f docker-compose.dev.yml up -d
    
    # Initialize databases
    init_databases
    
    print_status "Development environment started"
    print_status "Services are accessible at:"
    print_status "  - Task Service: http://localhost:3455"
    print_status "  - Team Service: http://localhost:3456"
    print_status "  - Agent Service: http://localhost:3457"
    print_status "  - Kafka: localhost:9092"
    print_status "  - PostgreSQL: localhost:5433"
}

# Stop development environment
stop_dev() {
    print_status "Stopping development environment..."
    docker-compose -f docker-compose.dev.yml down
    print_status "Development environment stopped"
}

# Show logs
show_logs() {
    if [ "$2" = "-f" ]; then
        docker-compose -f docker-compose.dev.yml logs -f
    else
        docker-compose -f docker-compose.dev.yml logs
    fi
}

# Show status
show_status() {
    print_status "Current status of services:"
    docker-compose -f docker-compose.dev.yml ps
}

# Rebuild services
rebuild_services() {
    print_status "Rebuilding services..."
    
    # Stop current services
    docker-compose -f docker-compose.dev.yml down
    
    # Build images
    docker-compose -f docker-compose.dev.yml build --no-cache task-service team-service agent-service
    
    # Start services
    docker-compose -f docker-compose.dev.yml up -d
    
    # Initialize databases
    init_databases
    
    print_status "Services rebuilt and started"
}

# Clean everything
clean_env() {
    print_status "Cleaning up development environment..."
    docker-compose -f docker-compose.dev.yml down -v --rmi all
    print_status "Development environment cleaned"
}

# Open shell in container
open_shell() {
    if [ -z "$2" ]; then
        print_error "Please specify a service name"
        echo "Available services:"
        docker-compose -f docker-compose.dev.yml ps --services
        exit 1
    fi
    
    if ! docker-compose -f docker-compose.dev.yml ps --services | grep -q "^$2$"; then
        print_error "Service '$2' not found"
        echo "Available services:"
        docker-compose -f docker-compose.dev.yml ps --services
        exit 1
    fi
    
    docker-compose -f docker-compose.dev.yml exec "$2" sh
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
        open_shell "$@"
        ;;
    *)
        show_usage
        exit 1
        ;;
esac
