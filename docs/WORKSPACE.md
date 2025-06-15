# Bun Workspace Guide

How to work with the meh-trics monorepo structure.

## Workspace Structure

```json
{
  "name": "meh-trics",
  "workspaces": ["backend", "frontend"],
  "packageManager": "bun@1.0.0"
}
```

**Benefits:**
- Single `bun.lock` ensures version consistency
- Shared dev tools across packages
- Cross-workspace script execution
- Efficient dependency deduplication

## Package Organization

### Backend (`backend/package.json`)
```json
{
  "name": "backend",
  "scripts": {
    "dev": "bun --watch encore run",
    "build": "cd ../frontend && bun install && bun run build --outDir=../backend/frontend/dist",
    "test": "bun test",
    "type-check": "bun tsc --noEmit"
  }
}
```

### Frontend (`frontend/package.json`)
```json
{
  "name": "frontend", 
  "scripts": {
    "dev": "bun vite",
    "build": "bun vite build",
    "test": "bun test",
    "type-check": "bun tsc --noEmit"
  }
}
```

## Command Reference

### From Root Directory
```bash
# Setup
bun install                  # Install all workspace dependencies

# Development
bun run dev                 # Both backend + frontend
bun run dev:backend        # Backend only
bun run dev:frontend       # Frontend only

# Testing
bun test                   # All workspace tests
bun run test:e2e          # E2E tests

# Code quality
bun run lint              # Format all code
bun run type-check        # TypeScript validation
```

### From Individual Workspaces
```bash
# Backend workspace (backend/)
bun run dev               # Start Encore server
bun test                  # Backend tests only

# Frontend workspace (frontend/)
bun run dev               # Start Vite dev server
bun run build             # Production build
```

## Dependency Management

### Installing Dependencies
```bash
# Workspace-specific
bun add --cwd backend express          # Backend only
bun add --cwd frontend react-query     # Frontend only

# Shared dev tools (root)
bun add -d playwright @playwright/test
```

### Dependency Categories
- **Root**: Shared dev tools (Biome, Playwright, TypeScript configs)
- **Backend**: Encore.dev, Node.js utilities
- **Frontend**: React ecosystem, UI components, build tools

## Best Practices

### Adding New Workspaces
1. Create directory with `package.json`
2. Add to root `workspaces` array
3. Run `bun install` to register
4. Add scripts to root `package.json`

### Managing Dependencies
- Use workspace-specific installs for package dependencies
- Install shared dev tools at root level
- Keep lockfile committed for reproducible builds
- Use `bun update` to keep dependencies current

### Cross-Workspace Development
1. Make API changes in backend
2. Regenerate frontend client: `cd backend && encore gen client --target leap`
3. Update frontend to use new APIs
4. Test end-to-end to validate integration

## Why Bun Workspaces?

### Performance
- **~20x faster** installs vs npm
- **Native TypeScript** support
- **Built-in test runner**
- **Hot reloading** for development

### Developer Experience  
- **Single command setup**: `bun install`
- **Consistent tooling**: Same linter/formatter everywhere
- **Unified testing**: One command for all tests
- **Simplified CI**: One lockfile, predictable builds

## Troubleshooting

### Common Issues
```bash
# Clear and reinstall
rm -rf node_modules */node_modules
bun install

# Dependency conflicts
bun why package-name

# Update all workspaces
bun update
```

### Getting Help
- [Bun workspaces docs](https://bun.sh/docs/install/workspaces)
- [Encore.dev docs](https://encore.dev/docs)
- Project GitHub issues
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
