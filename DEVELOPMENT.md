# Development Guide

This project uses a **Bun workspace monorepo** structure with an Encore backend and React frontend. Follow the steps below to get the app running locally.

## Prerequisites

### Encore CLI
If this is your first time using Encore, install the CLI that runs the local development environment:

- **macOS:** `brew install encoredev/tap/encore`
- **Linux:** `curl -L https://encore.dev/install.sh | bash`
- **Windows:** `iwr https://encore.dev/install.ps1 | iex`

### Bun Package Manager
Install Bun for fast package management and workspace support:

```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash
# Or on Windows (PowerShell):
powershell -c "irm bun.sh/install.ps1 | iex"
```

## Quick Start

### 1. Install All Dependencies
From the **project root**, install all workspace dependencies:

```bash
bun install
```

This single command installs dependencies for both backend and frontend workspaces.

### 2. Start Development Servers

#### Option A: Start Both Servers (Recommended)
```bash
bun run dev:all
```

#### Option B: Start Individually
```bash
# Terminal 1: Backend
bun run dev:backend

# Terminal 2: Frontend  
bun run dev:frontend
```

### 3. Access the Application
- **Frontend:** http://localhost:5173 (React + Vite)
- **Backend API:** http://localhost:4000 (Encore)
- **Metrics Dashboard:** http://localhost:4000/metrics

## Workspace Structure

The monorepo is organized into workspaces:

```
meh-trics/
├── package.json          # Root workspace config
├── backend/              # Encore API workspace
│   ├── package.json      # Backend dependencies
│   └── ...
├── frontend/             # React PWA workspace
│   ├── package.json      # Frontend dependencies
│   └── ...
└── bun.lock             # Unified lockfile
```

## Development Workflow

### Installing New Dependencies

```bash
# Install to root workspace (dev tools, scripts)
bun add -d @types/node

# Install to backend workspace
bun add --cwd backend some-package

# Install to frontend workspace
bun add --cwd frontend react-query
```

### Running Tests

```bash
# All tests
bun test

# Specific workspace tests
cd backend && bun test
cd frontend && bun test

# E2E tests
bun run test:e2e
```

### Building for Production

```bash
# Build all workspaces
bun run build

# Build specific workspace
cd frontend && bun run build
cd backend && bun run build
```

### Generating Frontend Client

When you modify backend APIs, regenerate the TypeScript client:

```bash
cd backend
encore gen client --target leap
```

The generated client will be available at `frontend/client.ts`.

### Code Quality & Maintenance

```bash
# Format code with Biome
bun x biome check --apply .

# Lint SQL migrations
bun run lint:sql

# Check migration numbering
bun run check:migrations
```

## Troubleshooting

### Common Issues

**Dependencies not found**: Run `bun install` from the project root to ensure all workspaces are up to date.

**Port conflicts**: The frontend uses port 5173 and backend uses 4000. Ensure these ports are available.

**Database migrations**: If you see "column does not exist" errors, restart the backend with `encore run` to apply pending migrations.

## Deployment

### Self-hosting
See the [self-hosting instructions](https://encore.dev/docs/self-host/docker-build) for how to use encore build docker to create a Docker image and
configure it.

### Encore Cloud Platform

#### Step 1: Login to your Encore Cloud Account

Before deploying, ensure you have authenticated the Encore CLI with your Encore account (same as your Leap account)

```bash
encore auth login
```

#### Step 2: Set Up Git Remote

Add Encore's git remote to enable direct deployment:

```bash
git remote add encore encore://task-habit-mood-tracker-grz2
```

#### Step 3: Deploy Your Application

Deploy by pushing your code:

```bash
git add -A .
git commit -m "Deploy to Encore Cloud"
git push encore
```

Monitor your deployment progress in the [Encore Cloud dashboard](https://app.encore.dev/task-habit-mood-tracker-grz2/deploys).

## GitHub Integration (Recommended for Production)

For production applications, we recommend integrating with GitHub instead of using Encore's managed git:

### Connecting Your GitHub Account

1. Open your app in the **Encore Cloud dashboard**
2. Navigate to Encore Cloud [GitHub Integration settings](https://app.encore.cloud/task-habit-mood-tracker-grz2/settings/integrations/github)
3. Click **Connect Account to GitHub**
4. Grant access to your repository

Once connected, pushing to your GitHub repository will automatically trigger deployments. Encore Cloud Pro users also get Preview Environments for each pull request.

### Deploy via GitHub

After connecting GitHub, deploy by pushing to your repository:

```bash
git add -A .
git commit -m "Deploy via GitHub"
git push origin main
```

## Additional Resources

- [Encore Documentation](https://encore.dev/docs)
- [Deployment Guide](https://encore.dev/docs/platform/deploy/deploying)
- [GitHub Integration](https://encore.dev/docs/platform/integrations/github)
- [Encore Cloud Dashboard](https://app.encore.dev)



