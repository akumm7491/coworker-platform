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

# Run ESLint
run_eslint() {
    local FIX=$1
    
    print_status "Running ESLint..."
    
    if [ "$FIX" = "fix" ]; then
        # Frontend
        print_status "Fixing frontend code..."
        npm run lint:fix
        
        # Backend
        print_status "Fixing backend code..."
        cd server && npm run lint:fix
    else
        # Frontend
        print_status "Linting frontend code..."
        npm run lint
        
        # Backend
        print_status "Linting backend code..."
        cd server && npm run lint
    fi
}

# Run Prettier
run_prettier() {
    local FIX=$1
    
    print_status "Running Prettier..."
    
    if [ "$FIX" = "fix" ]; then
        # Frontend
        print_status "Formatting frontend code..."
        npm run format:fix
        
        # Backend
        print_status "Formatting backend code..."
        cd server && npm run format:fix
    else
        # Frontend
        print_status "Checking frontend code formatting..."
        npm run format:check
        
        # Backend
        print_status "Checking backend code formatting..."
        cd server && npm run format:check
    fi
}

# Run TypeScript type checking
run_typecheck() {
    print_status "Running TypeScript type checking..."
    
    # Frontend
    print_status "Type checking frontend code..."
    npm run typecheck
    
    # Backend
    print_status "Type checking backend code..."
    cd server && npm run typecheck
}

# Run security audit
run_security_audit() {
    print_status "Running security audit..."
    
    # Frontend
    print_status "Auditing frontend dependencies..."
    npm audit
    
    # Backend
    print_status "Auditing backend dependencies..."
    cd server && npm audit
}

# Main function
main() {
    case "$1" in
        "eslint")
            run_eslint "$2"
            ;;
        "prettier")
            run_prettier "$2"
            ;;
        "typecheck")
            run_typecheck
            ;;
        "security")
            run_security_audit
            ;;
        "all")
            run_eslint
            run_prettier
            run_typecheck
            run_security_audit
            ;;
        *)
            echo "Usage: $0 {eslint [fix]|prettier [fix]|typecheck|security|all}"
            exit 1
            ;;
    esac
}

# Run main function with arguments
main "$@"
