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

# Check if Homebrew is installed
check_homebrew() {
    print_status "Checking for Homebrew..."
    if ! command -v brew &> /dev/null; then
        print_status "Installing Homebrew..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    else
        print_status "Homebrew is already installed"
        brew update
    fi
}

# Install Docker Desktop if not installed
install_docker() {
    print_status "Checking for Docker..."
    if ! command -v docker &> /dev/null; then
        print_status "Installing Docker Desktop..."
        brew install --cask docker
        print_status "Docker Desktop installed. Please start Docker Desktop from your Applications folder."
        print_status "After starting Docker Desktop, press any key to continue..."
        read -n 1 -s
    else
        print_status "Docker is already installed"
    fi
}

# Install docker-compose
install_docker_compose() {
    print_status "Checking for docker-compose..."
    if ! command -v docker-compose &> /dev/null; then
        print_status "Installing docker-compose..."
        brew install docker-compose
    else
        print_status "docker-compose is already installed"
    fi
}

# Install kubectl
install_kubectl() {
    print_status "Checking for kubectl..."
    if ! command -v kubectl &> /dev/null; then
        print_status "Installing kubectl..."
        brew install kubectl
    else
        print_status "kubectl is already installed"
    fi
}

# Install Istio
install_istio() {
    print_status "Checking for istioctl..."
    if ! command -v istioctl &> /dev/null; then
        print_status "Installing Istio..."
        brew install istioctl
        
        # Download and install Istio
        curl -L https://istio.io/downloadIstio | ISTIO_VERSION=1.20.2 sh -
        
        # Add istioctl to PATH
        ISTIO_DIR=$(ls -d istio-*)
        export PATH=$PWD/$ISTIO_DIR/bin:$PATH
        
        print_status "Adding istioctl to your shell profile..."
        SHELL_PROFILE=""
        if [[ $SHELL == */zsh ]]; then
            SHELL_PROFILE="$HOME/.zshrc"
        elif [[ $SHELL == */bash ]]; then
            SHELL_PROFILE="$HOME/.bash_profile"
        fi
        
        if [ -n "$SHELL_PROFILE" ]; then
            echo "export PATH=\$PATH:$PWD/$ISTIO_DIR/bin" >> "$SHELL_PROFILE"
            print_status "Added Istio to PATH in $SHELL_PROFILE"
        else
            print_warning "Could not determine shell profile. Please add Istio to your PATH manually:"
            echo "export PATH=\$PATH:$PWD/$ISTIO_DIR/bin"
        fi
    else
        print_status "istioctl is already installed"
    fi
}

# Install Node.js using nvm
install_node() {
    print_status "Checking for Node.js..."
    if ! command -v node &> /dev/null; then
        print_status "Installing nvm and Node.js..."
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
        
        # Add nvm to shell profile
        SHELL_PROFILE=""
        if [[ $SHELL == */zsh ]]; then
            SHELL_PROFILE="$HOME/.zshrc"
        elif [[ $SHELL == */bash ]]; then
            SHELL_PROFILE="$HOME/.bash_profile"
        fi
        
        if [ -n "$SHELL_PROFILE" ]; then
            echo 'export NVM_DIR="$HOME/.nvm"' >> "$SHELL_PROFILE"
            echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"' >> "$SHELL_PROFILE"
            echo '[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"' >> "$SHELL_PROFILE"
        fi
        
        # Load nvm
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
        
        # Install Node.js LTS
        nvm install --lts
        nvm use --lts
    else
        print_status "Node.js is already installed"
    fi
}

# Main setup process
main() {
    print_status "Starting macOS development environment setup..."
    
    # Install required tools
    check_homebrew
    install_docker
    install_docker_compose
    install_kubectl
    install_istio
    install_node
    
    print_status "Setup completed successfully!"
    print_warning "Please restart your terminal or run 'source ~/.zshrc' (or ~/.bash_profile) to apply PATH changes."
    print_status "You can now run './scripts/dev-setup.sh' to set up the development environment."
}

# Run main function
main
