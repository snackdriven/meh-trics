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

## Getting Started
Refer to the main [README.md](../README.md#getting-started) for initial setup and installation instructions.

## Development Workflow

### Creating a Backend Endpoint
1. Add a new `.ts` file inside the appropriate service directory (e.g., `backend/task/`)
2. Export a function annotated with `encore.service`
3. Start the API server with `cd backend && encore run`

### Regenerating the Frontend Client
After changing the API surface, run the following from the `backend` directory:
```bash
encore gen client --target leap
```
This updates `frontend/client.ts`.

### Available Scripts

From the **root directory**:

```bash
# Install all dependencies
bun install

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
bun x biome check --apply . # Format and lint code
```

## Environment Variables

Configuration is managed via environment variables. You can create a `.env` file in the project root. Example:

```bash
# .env
PORT=4000 # Port for the Encore backend server
DATABASE_URL=postgres://user:pass@localhost:5432/mehtrics
# Add other environment variables as needed
```
The frontend (Vite) uses port 5173 by default.

## SQL Best Practices

- Run `bun x biome check --apply .` before committing to format SQL files along with TypeScript/JavaScript.
- Execute `bun run lint:sql` to catch common SQL mistakes in migrations.
- Run `bun run check:migrations` to ensure migration numbers aren't duplicated within a service.
- Minimize migrations during local development: update the latest migration file rather than creating a new one until the change is ready for wider use.
- Refer to [DATABASE_MIGRATIONS.md](DATABASE_MIGRATIONS.md) for detailed schema patterns and guidelines.

## Deployment

### Encore Cloud Platform

#### Step 1: Login to your Encore Cloud Account

Before deploying, ensure you have authenticated the Encore CLI with your Encore account:

```bash
encore auth login
```

#### Step 2: Set Up Git Remote

Add Encore's git remote to enable direct deployment (replace with your app-specific URL):

```bash
git remote add encore encore://your-app-name-xxxx
```

#### Step 3: Deploy Your Application

Deploy by pushing your code:

```bash
git add -A .
git commit -m "Deploy to Encore Cloud"
git push encore
```

Monitor your deployment progress in the Encore Cloud dashboard.

### GitHub Integration (Recommended for Production)

For production applications, integrate with GitHub for automated deployments:

1. Open your app in the **Encore Cloud dashboard**.
2. Navigate to your app's **Settings > Integrations > GitHub**.
3. Click **Connect Account to GitHub** and grant access to your repository.

Once connected, pushing to your configured GitHub repository branch (e.g., `main`) will automatically trigger deployments. Encore Cloud Pro users also get Preview Environments for each pull request.

### Self-Hosting with Docker
You can build a Docker image for self-hosting:
1. Use `encore build docker -t your-image-name:tag .` to create a Docker image.
2. Configure your `docker-compose.yml` or Docker deployment with necessary environment variables:

```yaml
# Example docker-compose.yml snippet
version: '3.8'
services:
  mehtrics-backend:
    image: your-image-name:tag
    ports:
      - "4000:4000" # Or your configured backend port
    environment:
      - PORT=4000 # Ensure this matches the port Encore runs on inside the container
      - DATABASE_URL=postgres://user:pass@db_host:5432/mehtrics
    # ... other configurations like volumes, network, depends_on for database
```
Refer to the official [Encore self-hosting documentation](https://encore.dev/docs/self-host/docker-build) for more details.

## Troubleshooting

- **Dependencies not found**: Run `bun install` from the project root.
- **Port conflicts**: Ensure ports 4000 (backend) and 5173 (frontend) are available.
- **Database migrations**: If you encounter errors like `column "X" does not exist`, restart the backend with `cd backend && encore run` to apply any pending database migrations. Migrations run automatically when the Encore server starts.
