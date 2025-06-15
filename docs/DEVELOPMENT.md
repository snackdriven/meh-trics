# Development Guide

## Project Structure

This project uses a **monorepo structure** powered by **Bun workspaces**:

```
meh-trics/
├── package.json              # Root workspace configuration
├── bun.lock                  # Unified lockfile for all packages
├── backend/                  # Encore.dev API server
│   ├── task/                 # Task and routine services
│   ├── mood/                 # Mood entry service
│   ├── habits/               # Habit tracker service
│   └── calendar/             # Calendar event service
├── frontend/                 # React + Vite PWA
│   ├── src/                  # React components and hooks
│   └── ...                   # Frontend assets
├── docs/                     # Project documentation
├── e2e/                      # Playwright end-to-end tests
└── scripts/                  # Build and maintenance scripts
```

## Development Workflow

### Creating a Backend Endpoint
1. Add a new `.ts` file inside the appropriate service directory
2. Export a function annotated with `encore.service`
3. Start the API server with `encore run`

### Regenerating the Frontend Client
After changing the API:
```bash
cd backend
encore gen client --target leap
```

### Available Scripts

From the **root directory**:

```bash
# Development
bun run dev:backend          # Start Encore backend only
bun run dev:frontend         # Start Vite frontend only  
bun run dev:all             # Start both concurrently

# Building
bun run build               # Build both packages

# Testing
bun test                    # Run all unit tests
bun run test:e2e           # Run Playwright E2E tests

# Maintenance
bun run lint:sql           # Lint SQL migrations
bun run check:migrations   # Validate migration numbering
```

## Environment Variables

Configuration is managed via environment variables:

```bash
# .env
PORT=3000
DATABASE_URL=postgres://user:pass@localhost:5432/mehtrics
ENCORE_CACHE_TTL=600
```

## SQL Best Practices

- Run `bun x biome check --apply .` before committing
- Execute `bun run lint:sql` to catch SQL mistakes
- Run `bun run check:migrations` to validate migration numbers
- Minimize migrations during local development

## Deployment

### Encore Cloud
Deploy directly to Encore's cloud platform.

### Self-Hosting with Docker
Example `docker-compose.yml`:

```yaml
version: '3'
services:
  mehtrics-backend:
    image: your-backend-image
    environment:
      - PORT=3000
      - DATABASE_URL=postgres://user:pass@db:5432/mehtrics
    # ...config...
```

## Troubleshooting

If you encounter database errors, restart the backend with `encore run` to apply pending migrations.
