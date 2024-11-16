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

# Build Docker images
build_images() {
    local ENV=$1
    local VERSION=$2
    
    print_status "Building Docker images for $ENV environment (version: $VERSION)..."
    
    # Build frontend
    print_status "Building frontend image..."
    docker build -t coworker-platform/frontend:$VERSION \
        --build-arg NODE_ENV=$ENV \
        -f docker/frontend/Dockerfile .
    
    # Build microservices
    cd server
    for service in identity project agent billing analytics; do
        print_status "Building $service service image..."
        docker build -t coworker-platform/$service:$VERSION \
            --build-arg NODE_ENV=$ENV \
            -f docker/$service-service.Dockerfile .
    done
    cd ..
}

# Push Docker images
push_images() {
    local VERSION=$1
    local REGISTRY=${2:-""}
    
    print_status "Pushing Docker images to registry: ${REGISTRY:-local}..."
    
    # Tag and push frontend
    if [ -n "$REGISTRY" ]; then
        docker tag coworker-platform/frontend:$VERSION $REGISTRY/coworker-platform/frontend:$VERSION
        docker push $REGISTRY/coworker-platform/frontend:$VERSION
    fi
    
    # Tag and push microservices
    for service in identity project agent billing analytics; do
        if [ -n "$REGISTRY" ]; then
            docker tag coworker-platform/$service:$VERSION $REGISTRY/coworker-platform/$service:$VERSION
            docker push $REGISTRY/coworker-platform/$service:$VERSION
        fi
    done
}

# Deploy to Kubernetes
deploy_kubernetes() {
    local ENV=$1
    local VERSION=$2
    
    print_status "Deploying to Kubernetes ($ENV environment, version: $VERSION)..."
    
    # Create namespaces if they don't exist
    kubectl create namespace $ENV --dry-run=client -o yaml | kubectl apply -f -
    kubectl create namespace monitoring --dry-run=client -o yaml | kubectl apply -f -
    
    # Apply secrets
    print_status "Applying secrets..."
    kubectl apply -f k8s/secrets/secrets.yaml
    
    # Apply Istio configurations
    print_status "Applying Istio configurations..."
    kubectl apply -f k8s/istio/gateway.yaml
    kubectl apply -f k8s/istio/mesh-policy.yaml
    
    # Update image versions in deployment files
    for file in k8s/*-service.yaml; do
        sed -i '' "s|image: coworker-platform/.*|image: coworker-platform/$(basename $file .yaml):$VERSION|g" $file
    done
    
    # Apply deployments
    print_status "Applying deployments..."
    kubectl apply -f k8s/
    
    # Wait for deployments to be ready
    print_status "Waiting for deployments to be ready..."
    kubectl wait --for=condition=available --timeout=300s -n $ENV deployment --all
}

# Rollback deployment
rollback_deployment() {
    local ENV=$1
    
    print_status "Rolling back deployment in $ENV environment..."
    
    # Rollback Kubernetes deployments
    kubectl rollout undo -n $ENV deployment --all
    
    # Wait for rollback to complete
    print_status "Waiting for rollback to complete..."
    kubectl wait --for=condition=available --timeout=300s -n $ENV deployment --all
}

# Generate version number
generate_version() {
    echo "$(date +%Y%m%d)-$(git rev-parse --short HEAD)"
}

# Main function
main() {
    local VERSION=$(generate_version)
    local ENV=${2:-"development"}
    local REGISTRY=${3:-""}
    
    case "$1" in
        "build")
            build_images "$ENV" "$VERSION"
            ;;
        "push")
            push_images "$VERSION" "$REGISTRY"
            ;;
        "deploy")
            deploy_kubernetes "$ENV" "$VERSION"
            ;;
        "rollback")
            rollback_deployment "$ENV"
            ;;
        "all")
            build_images "$ENV" "$VERSION"
            push_images "$VERSION" "$REGISTRY"
            deploy_kubernetes "$ENV" "$VERSION"
            ;;
        *)
            echo "Usage: $0 {build|push|deploy|rollback|all} [environment] [registry]"
            echo "Environments: development, staging, production"
            exit 1
            ;;
    esac
}

# Run main function with arguments
main "$@"
