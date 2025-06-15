# Development Guide

Comprehensive development guide for the meh-trics wellbeing application.

## Project Structure

**Bun workspace monorepo** with unified dependency management:

```
meh-trics/
├── package.json              # Root workspace + shared scripts
├── bun.lock                  # Unified lockfile
├── backend/                  # Encore.dev API services
│   ├── task/                 # Task management agent
│   ├── mood/                 # Mood tracking agent
│   ├── habits/               # Habit tracking agent
│   └── calendar/             # Calendar aggregation agent
├── frontend/                 # React + Vite PWA
├── e2e/                      # Playwright tests
└── docs/                     # Documentation
```

## Quick Setup

```bash
# Prerequisites: Bun + Encore CLI
git clone <repo-url>
cd meh-trics
bun install                   # Install all workspace dependencies
bun run dev                   # Start both backend + frontend
```

## Development Commands

### Daily Workflow
```bash
bun run dev                   # Start both services
bun run dev:backend          # Backend only (port 4000)
bun run dev:frontend         # Frontend only (port 5173)

# After API changes
cd backend && encore gen client --target leap
```

### Testing & Quality
```bash
bun test                     # All unit tests
bun run test:e2e            # Playwright E2E tests
bun run test:e2e:ui         # E2E with UI
bun run lint                # Format + lint code
bun run type-check          # TypeScript validation
```

### Build & Deploy
```bash
bun run build              # Production build
bun run preview            # Preview build locally
```

## Backend Development

### Creating API Endpoints
1. Add `.ts` file in appropriate service directory (`backend/task/`, `backend/mood/`, etc.)
2. Export function with Encore service annotation:
```typescript
import { api } from "encore.dev/api";

export const createTask = api(
  { method: "POST", path: "/tasks" },
  async (params: { title: string }): Promise<Task> => {
    // Implementation
  }
);
```
3. Restart backend: `cd backend && encore run`
4. Regenerate client: `encore gen client --target leap`

### Database Migrations
- **Development**: Update latest migration file instead of creating new ones
- **Location**: `backend/[service]/migrations/`
- **Auto-apply**: Migrations run automatically when starting Encore
- **Validation**: `bun run check:migrations` ensures no duplicate numbers

### Migration Best Practices
```sql
-- Use descriptive names
-- 14_add_task_filter_indexes.up.sql

-- Include proper constraints
ALTER TABLE tasks ADD CONSTRAINT check_status 
CHECK (status IN ('todo', 'in_progress', 'done', 'archived'));

-- Add indexes for performance
CREATE INDEX idx_tasks_status ON tasks(status) WHERE archived_at IS NULL;
```

## Frontend Development

### API Client Usage
```typescript
// Generated client (auto-updated)
import backend from "~backend/client";

// Use in components
const tasks = await backend.task.list();
const newTask = await backend.task.create({ title: "New task" });
```

### Theme System
```typescript
// Theme-aware styling
<div className="bg-[var(--color-background-primary)] text-[var(--color-text-primary)]">

// Access theme context
import { useTheme } from '@/contexts/ThemeContext';
const { theme, switchTheme } = useTheme();
```

### Error Handling
```typescript
import { apiCall } from '@/lib/errorHandling';

// Wrap API calls for user-friendly errors
const result = await apiCall(
  () => backend.task.create(data),
  'creating task'
);
```

## Testing Strategy

### Unit Tests (Vitest)
- **Backend**: Test agent logic and API endpoints
- **Frontend**: Test components and hooks with jsdom
- **Run**: `bun test`

### E2E Tests (Playwright)
- **Cross-browser**: Chrome, Firefox, Safari
- **Mobile testing**: Responsive viewports
- **Natural language**: MCP integration for AI-driven testing
- **Run**: `bun run test:e2e`

### Test-Driven Development
1. Write failing test
2. Implement minimal code to pass
3. Refactor while keeping tests green
4. Ensure both unit and E2E coverage

## Dependency Management

### Installing Packages
```bash
# Workspace-specific
bun add --cwd backend express
bun add --cwd frontend react-query

# Root-level (shared dev tools)
bun add -d playwright
```

### Why Bun Workspaces?
- **Performance**: ~20x faster installs than npm
- **Consistency**: Single lockfile prevents version conflicts
- **Convenience**: One `bun install` sets up entire project
- **Scalability**: Easy to add new packages (mobile app, docs, etc.)

## Environment Configuration

### Development Environment
Create `.env` in project root:
```bash
# Backend configuration
PORT=4000
DATABASE_URL=postgres://localhost:5432/mehtrics

# Frontend configuration (VITE_ prefix)
VITE_API_URL=http://localhost:4000
```

### Production Deployment

#### Encore Cloud (Recommended)
```bash
# Authenticate
encore auth login

# Deploy
git push encore main
```

#### Self-Hosting with Docker
```bash
# Build Docker image
encore build docker -t mehtrics:latest .

# Run with Docker Compose
docker-compose up -d
```

## Architecture Details

### Agent-Based Design
Each backend service represents a domain agent:
- **TaskAgent**: Task CRUD, recurring tasks, scheduling
- **MoodAgent**: Mood entries, emotional tracking
- **HabitAgent**: Habit tracking, streaks, analytics
- **CalendarAgent**: Event aggregation, Today view
- **InsightAgent**: Data analysis, trend identification

### PWA Features
- **Offline support**: IndexedDB caching with sync queue
- **Installable**: Service worker + web app manifest
- **Responsive**: Mobile-first design with Tailwind CSS

### Type Safety
- **Backend**: Full TypeScript with strict mode
- **Frontend**: Generated API client ensures type safety
- **Database**: Typed queries with SQL validation

## Performance Optimization

### Database
- **Indexes**: Composite indexes for common query patterns
- **Migrations**: Non-blocking schema changes
- **Constraints**: Proper foreign keys and check constraints

### Frontend
- **Code splitting**: Vite-based lazy loading
- **Caching**: Service worker asset caching
- **Bundling**: Tree shaking and minification

### Monitoring
- **Metrics**: Built-in request timing at `/metrics`
- **Logging**: Structured logging with context
- **Error tracking**: User-friendly error boundaries

## Troubleshooting

### Common Development Issues

**Dependencies not found:**
```bash
rm -rf node_modules */node_modules
bun install
```

**Port conflicts:**
```bash
lsof -ti:4000 | xargs kill -9  # Backend
lsof -ti:5173 | xargs kill -9  # Frontend
```

**API client out of sync:**
```bash
cd backend && encore gen client --target leap
```

**Database migration errors:**
```bash
cd backend && encore run  # Restart to apply migrations
```

### Performance Issues
- **Slow queries**: Check database indexes and query plans
- **Large bundles**: Analyze with `bun run build --analyze`
- **Memory leaks**: Use React DevTools Profiler

### Production Debugging
- **Encore Cloud**: Monitor logs and metrics in dashboard
- **Self-hosted**: Check container logs and database performance

## Contributing Guidelines

### Code Quality
- **Formatting**: Use `bun run lint` before committing
- **Types**: Ensure TypeScript passes: `bun run type-check`
- **Tests**: Add tests for new features and bug fixes
- **Documentation**: Update relevant docs with changes

### Git Workflow
1. Create feature branch from `main`
2. Make changes with clear commit messages
3. Ensure all tests pass locally
4. Submit pull request with description
5. Address review feedback

### Release Process
1. Update version in `package.json`
2. Update CHANGELOG.md
3. Create git tag: `git tag v1.0.0`
4. Deploy to Encore Cloud
5. Create GitHub release

This guide provides everything needed for productive development on the meh-trics codebase.
