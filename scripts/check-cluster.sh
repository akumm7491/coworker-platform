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

# Check Docker
check_docker() {
    print_status "Checking Docker..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        print_status "Install Docker Desktop from https://www.docker.com/products/docker-desktop"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        print_error "Docker daemon is not running"
        print_status "Start Docker Desktop and try again"
        exit 1
    fi
    
    print_status "Docker is running properly"
}

# Check Kubernetes
check_kubernetes() {
    print_status "Checking Kubernetes..."
    
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl is not installed"
        print_status "Installing kubectl..."
        brew install kubectl
    fi
    
    if ! kubectl cluster-info &> /dev/null; then
        print_error "Kubernetes cluster is not accessible"
        print_status "Enable Kubernetes in Docker Desktop settings and try again"
        exit 1
    fi
    
    # Check Kubernetes version
    local k8s_version=$(kubectl version --short | grep "Server Version" | cut -d " " -f3)
    print_status "Kubernetes version: $k8s_version"
    
    # Check node status
    print_status "Checking node status..."
    kubectl get nodes
    
    # Check system pods
    print_status "Checking system pods..."
    kubectl get pods -n kube-system
}

# Check Istio
check_istio() {
    print_status "Checking Istio..."
    
    if ! command -v istioctl &> /dev/null; then
        print_error "istioctl is not installed"
        print_status "Installing Istio..."
        curl -L https://istio.io/downloadIstio | sh -
        local ISTIO_DIR=$(ls -d istio-*)
        export PATH=$PWD/$ISTIO_DIR/bin:$PATH
        print_status "Added istioctl to PATH temporarily"
        print_status "To add permanently, add this to your ~/.zshrc or ~/.bash_profile:"
        print_status "export PATH=\$PATH:$PWD/$ISTIO_DIR/bin"
    fi
    
    # Check Istio version
    print_status "Istio version:"
    istioctl version
    
    # Check if Istio is installed in the cluster
    if ! kubectl get namespace istio-system &> /dev/null; then
        print_warning "Istio is not installed in the cluster"
        read -p "Would you like to install Istio now? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_status "Installing Istio..."
            istioctl install --set profile=demo -y
        else
            print_warning "Skipping Istio installation"
            return
        fi
    fi
    
    # Check Istio pods
    print_status "Checking Istio pods..."
    kubectl get pods -n istio-system
}

# Check required namespaces
check_namespaces() {
    print_status "Checking namespaces..."
    
    local REQUIRED_NAMESPACES=("default" "monitoring" "istio-system")
    
    for ns in "${REQUIRED_NAMESPACES[@]}"; do
        if ! kubectl get namespace $ns &> /dev/null; then
            print_warning "Namespace $ns does not exist"
            kubectl create namespace $ns
            print_status "Created namespace $ns"
        fi
        
        # Check istio-injection label
        if [[ "$ns" != "istio-system" ]]; then
            if ! kubectl get namespace $ns -o jsonpath='{.metadata.labels.istio-injection}' | grep enabled &> /dev/null; then
                print_warning "Istio injection not enabled for namespace $ns"
                kubectl label namespace $ns istio-injection=enabled --overwrite
                print_status "Enabled Istio injection for namespace $ns"
            fi
        fi
    done
}

# Check storage class
check_storage_class() {
    print_status "Checking storage class..."
    
    kubectl get storageclasses
}

# Check resource quotas
check_resource_quotas() {
    print_status "Checking resource quotas..."
    
    for ns in default monitoring; do
        kubectl get resourcequota -n $ns
    done
}

# Check networking
check_networking() {
    print_status "Checking networking..."
    
    # Check if CoreDNS is running
    print_status "Checking CoreDNS..."
    kubectl get pods -n kube-system -l k8s-app=kube-dns
    
    # Check if Istio ingress gateway is running
    print_status "Checking Istio ingress gateway..."
    kubectl get pods -n istio-system -l app=istio-ingressgateway
}

# Main function
main() {
    print_status "Starting cluster diagnostics..."
    
    check_docker
    check_kubernetes
    check_istio
    check_namespaces
    check_storage_class
    check_resource_quotas
    check_networking
    
    print_status "Diagnostics completed!"
    print_status "Your cluster appears to be properly configured."
    print_status "Next steps:"
    print_status "1. Run './scripts/setup-istio.sh' to set up monitoring"
    print_status "2. Run './scripts/dev-setup.sh' to set up the development environment"
}

# Run main function
main
