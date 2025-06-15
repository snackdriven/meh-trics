# Testing Guide

Comprehensive testing strategy for the meh-trics wellbeing application, including unit tests, E2E tests, and AI-driven testing with MCP integration.

## Testing Stack

- **Unit Tests**: Vitest + jsdom for component and utility testing
- **E2E Tests**: Playwright for cross-browser automation
- **AI Testing**: Model Context Protocol (MCP) for natural language test generation

## Quick Start

### Setup
```bash
# Install Playwright and browsers (run once)
bunx playwright install --with-deps

# Start the application stack
bun run dev  # Starts both backend (port 4000) and frontend (port 5173)

# Run tests
bun test                      # Unit tests
bun run test:e2e              # E2E headless mode
bun run test:e2e:ui           # Interactive Playwright UI
bun run test:e2e:headed       # See browser during tests
bun run test:e2e:debug        # Step-by-step debugging
```

### Configuration Files
- `vitest.config.ts` - Unit test configuration
- `playwright.config.ts` - E2E test configuration
- `e2e/` - E2E test files directory

## Unit Testing Strategy

### Backend Testing
Test agent logic and API endpoints:
```typescript
// backend/task/task.test.ts
import { describe, test, expect } from 'vitest';
import { createTask, listTasks } from './task';

describe('TaskAgent', () => {
  test('creates task with correct defaults', async () => {
    const task = await createTask({ title: 'Test task' });
    expect(task.status).toBe('todo');
    expect(task.priority).toBe(2);
  });
});
```

### Frontend Testing
Test components and hooks with jsdom:
```typescript
// frontend/src/components/TaskList.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import TaskList from './TaskList';

describe('TaskList', () => {
  test('renders empty state', () => {
    render(<TaskList tasks={[]} />);
    expect(screen.getByText('No tasks yet')).toBeInTheDocument();
  });
});
```

## E2E Testing with Playwright

### Application Context

#### Ports & Services
- **Frontend**: React app at `http://localhost:5173`
- **Backend**: Encore.dev API at `http://localhost:4000`
- **Architecture**: Agent-based services (Task, Mood, Habits, Calendar, Insights)

#### Key Features to Test
- **Task Management**: Creation, editing, priorities, due dates, drag-to-reorder
- **Habit Tracking**: Streak counting, frequency tracking, bulk actions
- **Mood Tracking**: Dual emotions, contextual notes, visual indicators
- **Journal Entries**: Markdown support, templates, mood linking
- **Calendar Integration**: Unified view, Today page, event display
- **Theme System**: Live color customization, light/dark mode, export/import
- **PWA Features**: Offline support, installability, responsive design

### Test Structure

#### Core App Tests (`e2e/app.spec.ts`)
```typescript
import { test, expect } from '@playwright/test';

test('user completes morning routine workflow', async ({ page }) => {
  // Navigate to Today view
  await page.goto('/');
  await page.click('[data-testid="today-tab"]');
  
  // Create a priority task
  await page.fill('[data-testid="quick-add-input"]', 'Review team standup notes');
  await page.selectOption('[data-testid="priority-select"]', 'high');
  await page.click('[data-testid="add-task-button"]');
  
  // Log morning mood
  await page.click('[data-testid="mood-check-in"]');
  await page.click('[data-testid="mood-positive"]');
  await page.fill('[data-testid="mood-note"]', 'Energized after morning coffee');
  await page.click('[data-testid="save-mood"]');
  
  // Verify Today view shows both entries
  await expect(page.locator('[data-testid="today-tasks"]')).toContainText('Review team standup notes');
  await expect(page.locator('[data-testid="today-moods"]')).toContainText('Energized after morning coffee');
});
```

## Natural Language Testing with MCP

When using with Claude Code or MCP-compatible clients, you can use conversational commands:

### Navigation & Basic Actions
```
"Navigate to the task management section"
"Go to the Today view"
"Open the mood tracking page"
"Click the settings tab"
```

### Task Management Testing
```
"Create a high priority task called 'Review quarterly goals'"
"Mark the first task as complete"
"Drag the second task to the top of the list"
"Create a recurring task for weekdays"
"Bulk select three tasks and mark them done"
```

### Mood & Wellbeing Testing
```
"Record a positive mood entry with the note 'Great morning routine'"
"Log a mood with both primary and secondary emotions"
"Add a journal entry about today's achievements"
"Check that mood history shows the last 7 days"
```

### Theme & Customization Testing
```
"Open the theme customizer"
"Change the primary color to purple"
"Switch to dark mode and verify colors"
"Export the current theme configuration"
"Test accessibility with high contrast mode"
```

### Complex Workflow Testing
```
"Complete a full daily routine: create tasks, log mood, write journal entry"
"Test the full habit tracking workflow from creation to completion"
"Verify the calendar shows all types of entries correctly"
"Check that analytics update after completing activities"
```

## Accessibility Testing

MCP can drive comprehensive accessibility validation:
```
"Check that all buttons have proper ARIA labels"
"Verify keyboard navigation works throughout the app"
"Test screen reader compatibility for form inputs"
"Validate color contrast ratios meet WCAG standards"
"Ensure focus indicators are visible in all themes"
```

## Performance Testing

```
"Measure page load times for the main dashboard"
"Test responsiveness on mobile viewport sizes"
"Verify smooth animations during theme switching"
"Check that large task lists render without lag"
```

## Best Practices

### For Unit Tests
1. **Test behavior, not implementation** - Focus on what the component does
2. **Use meaningful test names** - Describe the expected behavior
3. **Mock external dependencies** - Keep tests isolated and fast
4. **Test edge cases** - Empty states, error conditions, boundary values

### For E2E Tests
1. **Use `data-testid` attributes** for stable selectors
2. **Wait for API responses** before assertions
3. **Test both light and dark themes**
4. **Include mobile viewport testing**
5. **Verify offline functionality** where applicable

### For MCP Natural Language Commands
1. **Be specific**: "Create a high priority task" vs "Create a task"
2. **Include context**: "In the task section, mark the first item as complete"
3. **Verify results**: "Check that the task appears in Today view"
4. **Test edge cases**: "Try creating a task with special characters in the title"

## Debugging & Troubleshooting

### Common Issues
```bash
# Browser installation issues
bunx playwright install --force

# Port conflicts
lsof -ti:5173 | xargs kill -9  # Kill frontend
lsof -ti:4000 | xargs kill -9  # Kill backend

# Test failures
bun run test:e2e:debug         # Step through failing tests
```

### MCP Debugging
- Use `bun run test:e2e:headed` to see browser interactions
- Check browser console logs for JavaScript errors  
- Verify API responses at `http://localhost:4000/metrics`
- Review Playwright HTML reports after test runs

### Unit Test Debugging
- Use `bun test --reporter=verbose` for detailed output
- Add `console.log` statements in test files
- Use `test.only()` to run specific tests
- Check test coverage with `bun test --coverage`

## Continuous Integration

### GitHub Actions Example
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun test
      - run: bunx playwright install --with-deps
      - run: bun run test:e2e
```

This comprehensive testing approach ensures reliability across the entire application while supporting both traditional testing workflows and AI-assisted test generation.
