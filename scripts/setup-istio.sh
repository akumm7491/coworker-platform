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

# Check if kubectl is configured
check_kubectl() {
    print_status "Checking kubectl configuration..."
    if ! kubectl cluster-info &> /dev/null; then
        print_error "kubectl is not configured or cluster is not accessible"
        exit 1
    fi
}

# Install Istio
install_istio() {
    print_status "Installing Istio..."
    
    # Install Istio with demo profile
    istioctl install --set profile=demo -y
    
    # Enable injection for default namespace
    kubectl label namespace default istio-injection=enabled --overwrite
    
    print_status "Istio installed successfully"
}

# Create monitoring namespace
create_monitoring_namespace() {
    print_status "Creating monitoring namespace..."
    kubectl apply -f k8s/monitoring/namespace.yaml
}

# Install monitoring stack
install_monitoring() {
    print_status "Installing monitoring stack..."
    
    # Install Prometheus
    kubectl apply -f k8s/monitoring/prometheus.yaml
    
    # Install Grafana
    kubectl apply -f k8s/monitoring/grafana.yaml
    
    # Install Kiali
    kubectl apply -f k8s/monitoring/kiali.yaml
    
    print_status "Monitoring stack installed successfully"
}

# Apply Istio configurations
apply_istio_config() {
    print_status "Applying Istio configurations..."
    
    # Apply gateway and virtual services
    kubectl apply -f k8s/istio/gateway.yaml
    
    # Apply mesh policies
    kubectl apply -f k8s/istio/mesh-policy.yaml
    
    print_status "Istio configurations applied successfully"
}

# Wait for pods to be ready
wait_for_pods() {
    local namespace=$1
    print_status "Waiting for pods in namespace $namespace to be ready..."
    
    kubectl wait --for=condition=ready pod --all -n $namespace --timeout=300s
}

# Port forward monitoring services
setup_port_forward() {
    print_status "Setting up port forwarding for monitoring services..."
    
    # Port forward Grafana
    kubectl port-forward -n monitoring svc/grafana 3000:3000 &
    
    # Port forward Prometheus
    kubectl port-forward -n monitoring svc/prometheus 9090:9090 &
    
    # Port forward Kiali
    kubectl port-forward -n monitoring svc/kiali 20001:20001 &
    
    print_status "Port forwarding set up successfully"
    print_status "Access monitoring services at:"
    print_status "- Grafana: http://localhost:3000"
    print_status "- Prometheus: http://localhost:9090"
    print_status "- Kiali: http://localhost:20001"
}

# Main setup process
main() {
    print_status "Starting Istio and monitoring setup..."
    
    # Check prerequisites
    check_kubectl
    
    # Install and configure Istio
    install_istio
    
    # Set up monitoring
    create_monitoring_namespace
    install_monitoring
    
    # Apply Istio configurations
    apply_istio_config
    
    # Wait for all pods to be ready
    wait_for_pods "istio-system"
    wait_for_pods "monitoring"
    
    # Set up port forwarding
    setup_port_forward
    
    print_status "Setup completed successfully!"
    print_status "Your Istio service mesh is now ready with monitoring enabled."
}

# Run main function
main
