# Workspace & Monorepo Guide

This document explains the monorepo structure and Bun workspace configuration for the meh-trics project.

## Overview

The project uses **Bun workspaces** to manage a monorepo containing:
- **Backend**: Encore.dev API server with TypeScript
- **Frontend**: React + Vite PWA application
- **Shared tooling**: Tests, linting, scripts, and documentation

## Workspace Configuration

### Root Package.json

The root `package.json` defines the workspace structure:

```json
{
  "name": "leap-app",
  "workspaces": ["backend", "frontend"],
  "packageManager": "bun@1.0.0",
  "scripts": {
    "dev:all": "bun run dev:backend & bun run dev:frontend",
    "build": "bun run --filter=frontend build && bun run --filter=backend build"
  }
}
```

### Workspace Benefits

1. **Unified Dependencies**: Single `bun.lock` file ensures version consistency
2. **Cross-workspace Scripts**: Run commands across packages from the root
3. **Shared Dev Tools**: ESLint, TypeScript, Playwright configurations work everywhere
4. **Efficient Installs**: Bun deduplicates dependencies across workspaces

## Package Structure

### Backend Workspace (`backend/package.json`)

```json
{
  "name": "backend",
  "packageManager": "bun@1.0.0",
  "scripts": {
    "dev": "bun --watch encore run",
    "build": "cd ../frontend && bun install && bun run build --outDir=../backend/frontend/dist",
    "test": "bun test",
    "type-check": "bun tsc --noEmit"
  },
  "dependencies": {
    "encore.dev": "^1.48.4",
    "node-ical": "^0.20.1"
  }
}
```

**Key features:**
- Uses `bun --watch` for hot reloading during development
- Builds frontend into backend's static assets directory
- TypeScript support with strict type checking

### Frontend Workspace (`frontend/package.json`)

```json
{
  "name": "frontend",
  "packageManager": "bun@1.0.0",
  "scripts": {
    "dev": "bun vite",
    "build": "bun vite build",
    "preview": "bun vite preview",
    "test": "bun test",
    "type-check": "bun tsc --noEmit"
  },
  "dependencies": {
    "react": "^19.1.0",
    "vite": "^6.3.5"
  }
}
```

**Key features:**
- Modern React 19 with Vite for fast development
- PWA capabilities with service worker support
- Component library with Radix UI and Tailwind CSS

## Development Commands

### From Root Directory

```bash
# Install all dependencies
bun install

# Start both backend and frontend
bun run dev:all

# Start individual services
bun run dev:backend          # Backend only
bun run dev:frontend         # Frontend only

# Build everything
bun run build

# Run all tests
bun test

# End-to-end testing
bun run test:e2e
bun run test:e2e:ui          # With Playwright UI

# Code quality
bun run lint:sql             # SQL migration linting
bun run check:migrations     # Migration validation
```

### From Individual Workspaces

```bash
# Backend commands (from backend/)
bun run dev                  # Start Encore server
bun test                     # Run backend tests
bun run type-check           # TypeScript validation

# Frontend commands (from frontend/)
bun run dev                  # Start Vite dev server
bun run build                # Production build
bun run preview              # Preview production build
```

## Dependency Management

### Installing Dependencies

```bash
# Root workspace (shared dev tools)
bun add -d playwright @playwright/test

# Backend workspace
bun add --cwd backend express @types/express

# Frontend workspace  
bun add --cwd frontend react-query @tanstack/react-query
```

### Dependency Categories

**Root dependencies:**
- Development tools (Playwright, Biome, TypeScript configs)
- Build scripts and maintenance utilities
- Shared testing dependencies

**Backend dependencies:**
- Encore.dev framework
- Node.js utilities (node-ical, etc.)
- Backend-specific testing tools

**Frontend dependencies:**
- React and React ecosystem
- UI components (Radix UI, Tailwind)
- Build tools (Vite, PostCSS)

## File Organization

```
meh-trics/
├── package.json                 # Root workspace config
├── bun.lock                    # Unified lockfile
├── biome.json                  # Code formatting config
├── playwright.config.ts        # E2E test config
├── vitest.config.ts            # Unit test config
├── backend/
│   ├── package.json            # Backend dependencies
│   ├── encore.app              # Encore app config
│   ├── task/                   # Task service
│   ├── mood/                   # Mood tracking service
│   ├── habits/                 # Habit tracking service
│   └── ...                     # Other services
├── frontend/
│   ├── package.json            # Frontend dependencies
│   ├── vite.config.ts          # Vite configuration
│   ├── src/                    # React application
│   └── ...                     # Frontend assets
├── docs/                       # Documentation
├── e2e/                        # Playwright tests
└── scripts/                    # Build utilities
```

## Why Bun + Workspaces?

### Performance Benefits
- **~20x faster installs** compared to npm
- **Native TypeScript support** without transpilation overhead
- **Built-in test runner** with Jest-compatible APIs
- **Hot module reloading** for development

### Development Experience
- **Single command setup**: `bun install` configures everything
- **Consistent tooling**: Same linter, formatter across all packages
- **Unified testing**: Run tests across workspaces with one command
- **Simplified CI/CD**: One lockfile, predictable builds

### Maintenance Advantages
- **Version consistency**: No dependency conflicts between packages
- **Reduced disk usage**: Shared dependencies via hoisting
- **Easier debugging**: Single dependency tree to analyze
- **Scalable structure**: Easy to add new packages (mobile, docs, etc.)

## Best Practices

### Adding New Workspaces

1. Create a new directory with its own `package.json`
2. Add the directory to the root `workspaces` array
3. Run `bun install` to register the new workspace
4. Add appropriate scripts to the root `package.json`

### Managing Dependencies

- **Use workspace-specific installs** for package-specific dependencies
- **Install shared dev tools at the root** level
- **Keep lockfile committed** to ensure reproducible builds
- **Use `bun update`** to keep dependencies current

### Cross-workspace Development

- **Generate frontend client** after backend API changes
- **Run type checking** across all workspaces before committing
- **Test end-to-end** to validate workspace integration
- **Use workspace scripts** for consistent development commands

## Troubleshooting

### Common Issues

**"Package not found" errors:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules backend/node_modules frontend/node_modules
bun install
```

**Dependency version conflicts:**
```bash
# Check for duplicate packages
bun why package-name

# Update all workspaces
bun update
```

**TypeScript path resolution:**
```bash
# Regenerate TypeScript configs
bun run type-check
```

**Build failures:**
```bash
# Clean build artifacts
bun run clean  # If clean script exists
bun run build
```

### Getting Help

- **Bun documentation**: https://bun.sh/docs
- **Workspace guide**: https://bun.sh/docs/install/workspaces  
- **Encore documentation**: https://encore.dev/docs
- **Project issues**: See GitHub issues or DEVELOPMENT.md
