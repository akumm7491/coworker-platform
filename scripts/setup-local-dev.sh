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

# Check and fix kubectl config
setup_kubectl() {
    print_status "Setting up kubectl configuration..."
    
    # Check if kubectl is installed
    if ! command -v kubectl &> /dev/null; then
        print_status "Installing kubectl..."
        brew install kubectl
    fi
    
    # Check if Docker Desktop's context exists
    if ! kubectl config get-contexts docker-desktop &> /dev/null; then
        print_warning "Docker Desktop context not found"
        print_status "Creating Docker Desktop context..."
        kubectl config set-context docker-desktop --cluster=docker-desktop --user=docker-desktop
    fi
    
    # Set Docker Desktop as the current context
    kubectl config use-context docker-desktop
    
    # Verify connection
    if kubectl cluster-info &> /dev/null; then
        print_status "Successfully connected to Kubernetes cluster"
    else
        print_error "Still unable to connect to Kubernetes cluster"
        print_status "Trying to fix common issues..."
        
        # Check if ~/.kube directory exists
        if [ ! -d ~/.kube ]; then
            print_status "Creating ~/.kube directory..."
            mkdir -p ~/.kube
        fi
        
        # Check if config file exists
        if [ ! -f ~/.kube/config ]; then
            print_status "Creating default kubectl config..."
            cat > ~/.kube/config << EOF
apiVersion: v1
clusters:
- cluster:
    server: https://kubernetes.docker.internal:6443
    insecure-skip-tls-verify: true
  name: docker-desktop
contexts:
- context:
    cluster: docker-desktop
    user: docker-desktop
  name: docker-desktop
current-context: docker-desktop
kind: Config
preferences: {}
users:
- name: docker-desktop
  user:
    client-certificate-data: ${HOME}/.docker/certs/client-cert.pem
    client-key-data: ${HOME}/.docker/certs/client-key.pem
EOF
        fi
        
        # Set proper permissions
        chmod 600 ~/.kube/config
    fi
}

# Install development tools
install_dev_tools() {
    print_status "Installing development tools..."
    
    # Install Node.js version manager
    if ! command -v nvm &> /dev/null; then
        print_status "Installing nvm..."
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
        
        # Add NVM to shell
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
        
        print_status "Installing Node.js LTS..."
        nvm install --lts
        nvm use --lts
    fi
    
    # Install Yarn
    if ! command -v yarn &> /dev/null; then
        print_status "Installing Yarn..."
        npm install -g yarn
    fi
    
    # Install development dependencies
    print_status "Installing project dependencies..."
    yarn install
    
    # Install server dependencies
    if [ -d "server" ]; then
        print_status "Installing server dependencies..."
        cd server && yarn install && cd ..
    fi
}

# Set up local databases
setup_local_databases() {
    print_status "Setting up local databases..."
    
    # Create docker-compose-local.yml if it doesn't exist
    if [ ! -f docker-compose-local.yml ]; then
        print_status "Creating local docker-compose configuration..."
        cat > docker-compose-local.yml << EOF
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: coworker_platform_dev
    volumes:
      - postgres_data:/var/lib/postgresql/data

  mongodb:
    image: mongo:7.0
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  mongodb_data:
  redis_data:
EOF
    fi
    
    # Start local databases
    print_status "Starting local databases..."
    docker-compose -f docker-compose-local.yml up -d
}

# Set up environment files
setup_env_files() {
    print_status "Setting up environment files..."
    
    # Create root .env if it doesn't exist
    if [ ! -f .env ]; then
        print_status "Creating root .env..."
        cat > .env << EOF
NODE_ENV=development
VITE_API_URL=http://localhost:3000
EOF
    fi
    
    # Create server .env if it doesn't exist
    if [ -d "server" ] && [ ! -f server/.env ]; then
        print_status "Creating server .env..."
        cat > server/.env << EOF
NODE_ENV=development
PORT=3000

# Database URLs
POSTGRES_URL=postgresql://postgres:postgres@localhost:5432/coworker_platform_dev
MONGODB_URL=mongodb://localhost:27017/coworker_platform_dev
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your_development_secret
JWT_EXPIRES_IN=24h

# Services
IDENTITY_SERVICE_URL=http://localhost:3001
PROJECT_SERVICE_URL=http://localhost:3002
AGENT_SERVICE_URL=http://localhost:3003
BILLING_SERVICE_URL=http://localhost:3004
ANALYTICS_SERVICE_URL=http://localhost:3005
EOF
    fi
}

# Set up Git hooks
setup_git_hooks() {
    print_status "Setting up Git hooks..."
    
    # Initialize husky
    yarn add -D husky
    yarn husky install
    
    # Add pre-commit hook
    yarn husky add .husky/pre-commit "yarn lint-staged"
    
    # Add lint-staged configuration if it doesn't exist
    if [ ! -f .lintstagedrc.json ]; then
        cat > .lintstagedrc.json << EOF
{
  "*.{js,jsx,ts,tsx}": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.{json,md,yml,yaml}": [
    "prettier --write"
  ]
}
EOF
    fi
}

# Main function
main() {
    print_status "Starting local development setup..."
    
    setup_kubectl
    install_dev_tools
    setup_local_databases
    setup_env_files
    setup_git_hooks
    
    print_status "Local development environment setup completed!"
    print_status "Next steps:"
    print_status "1. Review and update environment variables in .env files"
    print_status "2. Start the development server with 'yarn dev'"
    print_status "3. Start the backend services with 'cd server && yarn dev'"
}

# Run main function
main
