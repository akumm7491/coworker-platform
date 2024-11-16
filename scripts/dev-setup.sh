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

# Check required tools
check_requirements() {
    print_status "Checking required tools..."
    
    local REQUIRED_TOOLS=("docker" "docker-compose" "kubectl" "istioctl" "node" "npm")
    local MISSING_TOOLS=()

    for tool in "${REQUIRED_TOOLS[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            MISSING_TOOLS+=("$tool")
        fi
    done

    if [ ${#MISSING_TOOLS[@]} -ne 0 ]; then
        print_error "Missing required tools: ${MISSING_TOOLS[*]}"
        echo "Please install the missing tools and try again."
        exit 1
    fi

    print_status "All required tools are installed"
}

# Create development certificates
setup_certificates() {
    print_status "Setting up development certificates..."
    
    mkdir -p ./certs
    
    if [ ! -f ./certs/dev.key ] || [ ! -f ./certs/dev.crt ]; then
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout ./certs/dev.key \
            -out ./certs/dev.crt \
            -subj "/CN=localhost"
            
        print_status "Development certificates created"
    else
        print_warning "Development certificates already exist"
    fi
}

# Set up environment files
setup_env_files() {
    print_status "Setting up environment files..."
    
    local ENV_FILES=(
        ".env"
        "server/.env"
    )
    
    for env_file in "${ENV_FILES[@]}"; do
        if [ ! -f "$env_file" ]; then
            cp "${env_file}.example" "$env_file"
            print_status "Created $env_file from example"
        else
            print_warning "$env_file already exists"
        fi
    done
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Root project dependencies
    npm install
    
    # Server dependencies
    cd server && npm install && cd ..
    
    print_status "Dependencies installed successfully"
}

# Set up local development database
setup_local_db() {
    print_status "Setting up local databases..."
    
    # Start PostgreSQL and MongoDB containers if not running
    if ! docker ps | grep -q "postgres"; then
        docker-compose up -d postgres
    fi
    
    if ! docker ps | grep -q "mongodb"; then
        docker-compose up -d mongodb
    fi
    
    # Wait for databases to be ready
    print_status "Waiting for databases to be ready..."
    sleep 10
    
    # Run database migrations
    print_status "Running database migrations..."
    cd server && npm run migrate && cd ..
}

# Set up Kafka topics
setup_kafka() {
    print_status "Setting up Kafka..."
    
    # Start Kafka if not running
    if ! docker ps | grep -q "kafka"; then
        docker-compose up -d zookeeper kafka
        sleep 10
    fi
    
    # Create required topics
    local TOPICS=(
        "coworker-platform.users.events"
        "coworker-platform.projects.events"
        "coworker-platform.agents.events"
        "coworker-platform.billing.events"
    )
    
    for topic in "${TOPICS[@]}"; do
        docker-compose exec kafka kafka-topics.sh \
            --create --if-not-exists \
            --bootstrap-server localhost:9092 \
            --replication-factor 1 \
            --partitions 3 \
            --topic "$topic"
    done
    
    print_status "Kafka topics created successfully"
}

# Main setup process
main() {
    print_status "Starting development environment setup..."
    
    check_requirements
    setup_certificates
    setup_env_files
    install_dependencies
    setup_local_db
    setup_kafka
    
    print_status "Development environment setup completed successfully!"
    print_status "You can now start the development environment with: npm run dev"
}

# Run main function
main
