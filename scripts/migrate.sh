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

# Check database connection
check_database() {
    print_status "Checking database connection..."
    
    if ! docker-compose exec postgres pg_isready -U postgres > /dev/null 2>&1; then
        print_error "PostgreSQL is not ready"
        exit 1
    fi
    
    if ! docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
        print_error "MongoDB is not ready"
        exit 1
    fi
}

# Create new migration
create_migration() {
    local NAME=$1
    local TIMESTAMP=$(date +%Y%m%d%H%M%S)
    local FILENAME="${TIMESTAMP}_${NAME}.sql"
    
    print_status "Creating new migration: $FILENAME"
    
    # Create migrations directory if it doesn't exist
    mkdir -p ./server/migrations
    
    # Create migration file
    cat > "./server/migrations/$FILENAME" << EOF
-- Migration: $NAME
-- Created at: $(date -u +"%Y-%m-%d %H:%M:%S")

-- Write your SQL migration here

-- PostgreSQL changes
BEGIN;

-- Add your PostgreSQL changes here

COMMIT;

-- MongoDB changes (in JavaScript)
/*
db.getSiblingDB('coworker-platform').runCommand({
    // Add your MongoDB changes here
});
*/
EOF
    
    print_status "Migration file created: ./server/migrations/$FILENAME"
}

# Run migrations
run_migrations() {
    local ENV=$1
    
    print_status "Running migrations for environment: ${ENV:-development}"
    
    # Check database connection
    check_database
    
    # Run PostgreSQL migrations
    print_status "Running PostgreSQL migrations..."
    cd server && npm run migrate:postgres
    
    # Run MongoDB migrations
    print_status "Running MongoDB migrations..."
    cd server && npm run migrate:mongo
    
    print_status "Migrations completed successfully"
}

# Rollback migrations
rollback_migrations() {
    local STEPS=${1:-1}
    
    print_status "Rolling back $STEPS migration(s)..."
    
    # Check database connection
    check_database
    
    # Rollback PostgreSQL migrations
    print_status "Rolling back PostgreSQL migrations..."
    cd server && npm run migrate:postgres:undo -- --steps=$STEPS
    
    # Rollback MongoDB migrations
    print_status "Rolling back MongoDB migrations..."
    cd server && npm run migrate:mongo:undo -- --steps=$STEPS
    
    print_status "Rollback completed successfully"
}

# Show migration status
show_status() {
    print_status "Migration Status:"
    
    # PostgreSQL migration status
    echo -e "\nPostgreSQL Migrations:"
    cd server && npm run migrate:postgres:status
    
    # MongoDB migration status
    echo -e "\nMongoDB Migrations:"
    cd server && npm run migrate:mongo:status
}

# Main function
main() {
    case "$1" in
        "create")
            if [ -z "$2" ]; then
                print_error "Migration name is required"
                echo "Usage: $0 create <migration-name>"
                exit 1
            fi
            create_migration "$2"
            ;;
        "up")
            run_migrations "$2"
            ;;
        "down")
            rollback_migrations "${2:-1}"
            ;;
        "status")
            show_status
            ;;
        *)
            echo "Usage: $0 {create <name>|up [env]|down [steps]|status}"
            exit 1
            ;;
    esac
}

# Run main function with arguments
main "$@"
