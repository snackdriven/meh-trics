#!/bin/bash

# Meh-Trics Development Setup Script
# This script sets up the development environment for the Meh-Trics application

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Utility functions
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Main setup function
main() {
    echo "🚀 Meh-Trics Development Setup"
    echo "================================"
    echo ""

    # Check prerequisites
    print_status "Checking prerequisites..."
    
    # Check for Node.js
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18 or higher is required. Current version: $(node --version)"
        exit 1
    fi
    print_success "Node.js $(node --version) detected"

    # Check for npm
    if ! command_exists npm; then
        print_error "npm is not installed. Please install npm."
        exit 1
    fi
    print_success "npm $(npm --version) detected"

    # Check for Bun (optional but recommended)
    if command_exists bun; then
        print_success "Bun $(bun --version) detected"
        USE_BUN=true
    else
        print_warning "Bun not found. Using npm instead. Install Bun for faster builds: https://bun.sh/"
        USE_BUN=false
    fi

    # Check for Encore CLI (for backend)
    if ! command_exists encore; then
        print_warning "Encore CLI not found. Install it for backend development:"
        print_warning "  curl -L https://encore.dev/install.sh | bash"
        print_warning "  Then restart your terminal or run: source ~/.bashrc"
    else
        print_success "Encore CLI detected"
    fi

    echo ""
    print_status "Setting up project dependencies..."

    # Clean any existing node_modules to prevent conflicts
    print_status "Cleaning existing dependencies..."
    if [ -d "node_modules" ]; then
        rm -rf node_modules
        print_success "Removed root node_modules"
    fi
    
    if [ -d "frontend/node_modules" ]; then
        rm -rf frontend/node_modules
        print_success "Removed frontend node_modules"
    fi

    # Install root dependencies
    print_status "Installing workspace dependencies..."
    if [ "$USE_BUN" = true ]; then
        bun install
    else
        npm install --force
    fi
    print_success "Root dependencies installed"

    # Install frontend dependencies
    print_status "Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
    print_success "Frontend dependencies installed"

    # Backend setup
    if command_exists encore; then
        print_status "Setting up backend..."
        cd backend
        
        # Check if encore.app exists, if not create a basic one
        if [ ! -f "encore.app" ]; then
            print_status "Creating encore.app configuration..."
            cat > encore.app << EOF
{
  "id": "meh-trics"
}
EOF
        fi
        
        cd ..
        print_success "Backend setup complete"
    else
        print_warning "Skipping backend setup (Encore CLI not found)"
    fi

    echo ""
    print_success "🎉 Setup complete!"
    echo ""
    echo "📋 Next Steps:"
    echo "  1. Install recommended VS Code extensions:"
    echo "     - Biome (biomejs.biome)"
    echo "     - Encore (encoredev.encore)"
    echo ""
    echo "  2. Start development servers:"
    echo "     Frontend: npm run dev:frontend (or cd frontend && npm run dev)"
    echo "     Backend:  encore run (requires Encore CLI)"
    echo ""
    echo "  3. Development URLs:"
    echo "     Frontend: http://localhost:3000"
    echo "     Backend:  http://localhost:4000"
    echo "     API Docs: http://localhost:4000/docs"
    echo ""
    echo "  4. Useful commands:"
    echo "     Format code:  npm run format"
    echo "     Lint code:    npm run lint"
    echo "     Run tests:    npm run test"
    echo "     Build:        npm run build"
    echo ""
    
    if [ "$USE_BUN" = false ]; then
        echo "  💡 Consider installing Bun for faster builds: https://bun.sh/"
        echo ""
    fi
    
    if ! command_exists encore; then
        echo "  ⚠️  Install Encore CLI for backend development:"
        echo "     curl -L https://encore.dev/install.sh | bash"
        echo ""
    fi
    
    echo "📚 Documentation:"
    echo "   - Development Guide: docs/DEVELOPMENT.md"
    echo "   - Features Overview: docs/FEATURES.md"
    echo "   - Claude Instructions: CLAUDE.md"
    echo ""
    echo "🐛 Issues? Check:"
    echo "   - README.md for troubleshooting"
    echo "   - GitHub Issues: https://github.com/your-repo/issues"
}

# Run main function
main "$@"