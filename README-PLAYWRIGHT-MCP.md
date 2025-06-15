# Playwright MCP Integration

Natural language E2E testing for the meh-trics wellbeing app using Model Context Protocol.

## Quick Start

### Setup
```bash
# Install Playwright and browsers (run once)
bunx playwright install --with-deps

# Start the application stack
bun run dev  # Starts both backend (port 4000) and frontend (port 5173)

# Run tests
bun run test:e2e              # Headless mode
bun run test:e2e:ui           # Interactive Playwright UI
bun run test:e2e:headed       # See browser during tests
bun run test:e2e:debug        # Step-by-step debugging
```

### Configuration Files
- `playwright.config.ts` - Main Playwright configuration
- `e2e/` - Test files directory

## Natural Language Commands

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

## Application Context

### Ports & Services
- **Frontend**: React app at `http://localhost:5173`
- **Backend**: Encore.dev API at `http://localhost:4000`
- **Architecture**: Agent-based services (Task, Mood, Habits, Calendar, Insights)

### Key Features to Test
- **Task Management**: Creation, editing, priorities, due dates, drag-to-reorder
- **Habit Tracking**: Streak counting, frequency tracking, bulk actions
- **Mood Tracking**: Dual emotions, contextual notes, visual indicators
- **Journal Entries**: Markdown support, templates, mood linking
- **Calendar Integration**: Unified view, Today page, event display
- **Theme System**: Live color customization, light/dark mode, export/import
- **PWA Features**: Offline support, installability, responsive design

## Test Structure

### Core App Tests (`e2e/app.spec.ts`)
- Homepage loading and navigation
- Task creation and management
- Mood tracking functionality
- Today view aggregation
- Settings and customization

### MCP Integration Examples
```typescript
// Example of natural language test that MCP can generate
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

## Best Practices

### For MCP Natural Language Commands
1. **Be specific**: "Create a high priority task" vs "Create a task"
2. **Include context**: "In the task section, mark the first item as complete"
3. **Verify results**: "Check that the task appears in Today view"
4. **Test edge cases**: "Try creating a task with special characters in the title"

### For Test Reliability
1. Use `data-testid` attributes for stable selectors
2. Wait for API responses before assertions
3. Test both light and dark themes
4. Include mobile viewport testing
5. Verify offline functionality where applicable

This setup enables comprehensive testing through natural language while maintaining the technical depth needed for a complex wellbeing application.