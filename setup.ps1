# Meh-Trics Development Setup Script (PowerShell)
# This script sets up the development environment for the Meh-Trics application

param(
    [switch]$SkipPrereqs = $false
)

# Colors for output
$Colors = @{
    Red = 'Red'
    Green = 'Green'
    Blue = 'Blue'
    Yellow = 'Yellow'
    White = 'White'
}

function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor $Colors.Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor $Colors.Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor $Colors.Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $Colors.Red
}

function Test-Command {
    param([string]$Command)
    try {
        Get-Command $Command -ErrorAction Stop | Out-Null
        return $true
    }
    catch {
        return $false
    }
}

function Main {
    Write-Host "🚀 Meh-Trics Development Setup" -ForegroundColor $Colors.Green
    Write-Host "================================" -ForegroundColor $Colors.Green
    Write-Host ""

    if (-not $SkipPrereqs) {
        # Check prerequisites
        Write-Status "Checking prerequisites..."
        
        # Check for Node.js
        if (-not (Test-Command "node")) {
            Write-Error "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
            exit 1
        }
        
        $nodeVersion = (node --version) -replace 'v', ''
        $majorVersion = [int]($nodeVersion.Split('.')[0])
        if ($majorVersion -lt 18) {
            Write-Error "Node.js version 18 or higher is required. Current version: v$nodeVersion"
            exit 1
        }
        Write-Success "Node.js v$nodeVersion detected"

        # Check for npm
        if (-not (Test-Command "npm")) {
            Write-Error "npm is not installed. Please install npm."
            exit 1
        }
        Write-Success "npm $(npm --version) detected"

        # Check for Bun (optional but recommended)
        if (Test-Command "bun") {
            Write-Success "Bun $(bun --version) detected"
            $UseBun = $true
        }
        else {
            Write-Warning "Bun not found. Using npm instead. Install Bun for faster builds: https://bun.sh/"
            $UseBun = $false
        }

        # Check for Encore CLI (for backend)
        if (-not (Test-Command "encore")) {
            Write-Warning "Encore CLI not found. Install it for backend development:"
            Write-Warning "  Visit: https://encore.dev/docs/install"
        }
        else {
            Write-Success "Encore CLI detected"
        }
    }

    Write-Host ""
    Write-Status "Setting up project dependencies..."

    # Clean any existing node_modules to prevent conflicts
    Write-Status "Cleaning existing dependencies..."
    if (Test-Path "node_modules") {
        Remove-Item -Recurse -Force "node_modules"
        Write-Success "Removed root node_modules"
    }
    
    if (Test-Path "frontend/node_modules") {
        Remove-Item -Recurse -Force "frontend/node_modules"
        Write-Success "Removed frontend node_modules"
    }

    # Install root dependencies
    Write-Status "Installing workspace dependencies..."
    if ($UseBun) {
        & bun install
    }
    else {
        & npm install --force
    }
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to install root dependencies"
        exit 1
    }
    Write-Success "Root dependencies installed"

    # Install frontend dependencies
    Write-Status "Installing frontend dependencies..."
    Set-Location "frontend"
    & npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to install frontend dependencies"
        exit 1
    }
    Set-Location ".."
    Write-Success "Frontend dependencies installed"

    # Backend setup
    if (Test-Command "encore") {
        Write-Status "Setting up backend..."
        Set-Location "backend"
        
        # Check if encore.app exists, if not create a basic one
        if (-not (Test-Path "encore.app")) {
            Write-Status "Creating encore.app configuration..."
            @'
{
  "id": "meh-trics"
}
'@ | Out-File -FilePath "encore.app" -Encoding UTF8
        }
        
        Set-Location ".."
        Write-Success "Backend setup complete"
    }
    else {
        Write-Warning "Skipping backend setup (Encore CLI not found)"
    }

    Write-Host ""
    Write-Success "🎉 Setup complete!" -ForegroundColor $Colors.Green
    Write-Host ""
    Write-Host "📋 Next Steps:" -ForegroundColor $Colors.White
    Write-Host "  1. Install recommended VS Code extensions:" -ForegroundColor $Colors.White
    Write-Host "     - Biome (biomejs.biome)" -ForegroundColor $Colors.White
    Write-Host "     - Encore (encoredev.encore)" -ForegroundColor $Colors.White
    Write-Host ""
    Write-Host "  2. Start development servers:" -ForegroundColor $Colors.White
    Write-Host "     Frontend: npm run dev:frontend (or cd frontend && npm run dev)" -ForegroundColor $Colors.White
    Write-Host "     Backend:  encore run (requires Encore CLI)" -ForegroundColor $Colors.White
    Write-Host ""
    Write-Host "  3. Development URLs:" -ForegroundColor $Colors.White
    Write-Host "     Frontend: http://localhost:3000" -ForegroundColor $Colors.White
    Write-Host "     Backend:  http://localhost:4000" -ForegroundColor $Colors.White
    Write-Host "     API Docs: http://localhost:4000/docs" -ForegroundColor $Colors.White
    Write-Host ""
    Write-Host "  4. Useful commands:" -ForegroundColor $Colors.White
    Write-Host "     Format code:  npm run format" -ForegroundColor $Colors.White
    Write-Host "     Lint code:    npm run lint" -ForegroundColor $Colors.White
    Write-Host "     Run tests:    npm run test" -ForegroundColor $Colors.White
    Write-Host "     Build:        npm run build" -ForegroundColor $Colors.White
    Write-Host ""
    
    if (-not $UseBun) {
        Write-Host "  💡 Consider installing Bun for faster builds: https://bun.sh/" -ForegroundColor $Colors.Yellow
        Write-Host ""
    }
    
    if (-not (Test-Command "encore")) {
        Write-Host "  ⚠️  Install Encore CLI for backend development:" -ForegroundColor $Colors.Yellow
        Write-Host "     Visit: https://encore.dev/docs/install" -ForegroundColor $Colors.Yellow
        Write-Host ""
    }
    
    Write-Host "📚 Documentation:" -ForegroundColor $Colors.White
    Write-Host "   - Development Guide: docs/DEVELOPMENT.md" -ForegroundColor $Colors.White
    Write-Host "   - Features Overview: docs/FEATURES.md" -ForegroundColor $Colors.White
    Write-Host "   - Claude Instructions: CLAUDE.md" -ForegroundColor $Colors.White
    Write-Host ""
    Write-Host "🐛 Issues? Check:" -ForegroundColor $Colors.White
    Write-Host "   - README.md for troubleshooting" -ForegroundColor $Colors.White
    Write-Host "   - GitHub Issues: https://github.com/your-repo/issues" -ForegroundColor $Colors.White
}

# Run main function
Main