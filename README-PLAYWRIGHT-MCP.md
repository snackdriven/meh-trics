# Playwright MCP Integration

This document describes the Playwright MCP (Model Context Protocol) setup for end-to-end testing in the meh-trics application.

## Overview

Playwright MCP allows you to use natural language commands to drive browser automation and testing through Claude or other AI assistants. This integration provides:

- End-to-end testing of the fullstack application
- Natural language test scripting capabilities
- Automated browser interactions
- Cross-browser testing support

## Setup

### Prerequisites

1. Ensure you have Node.js installed
2. Install Playwright dependencies: `npm run playwright:install`
3. Install browser binaries: `npm run playwright:install-deps`

### Configuration Files

- `playwright.config.ts` - Main Playwright configuration
- `mcp-playwright.config.json` - MCP server configuration
- `e2e/` - Directory containing E2E test files

## Running Tests

### Standard Playwright Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run tests with UI mode
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Debug tests step by step
npm run test:e2e:debug
```

### MCP Integration

The MCP server can be configured to work with Claude Code or other MCP-compatible clients:

1. Start the MCP server with the configuration in `mcp-playwright.config.json`
2. Use natural language commands to drive browser automation
3. Tests can be written and executed through conversational interfaces

## Test Structure

### Basic App Tests (`e2e/app.spec.ts`)

- Homepage loading
- Task creation
- Navigation between sections
- Mood tracking
- Today view functionality

### MCP Integration Tests (`e2e/mcp-integration.spec.ts`)

- Demonstrates MCP-driven testing capabilities
- Complex user workflow automation
- Accessibility validation
- Natural language test scenarios

## Application-Specific Testing

The tests are configured for the meh-trics wellbeing/productivity app:

- **Backend**: Encore.dev framework running on port 4000
- **Frontend**: React + Vite running on port 5173
- **Features**: Tasks, Habits, Mood tracking, Journal, Calendar, Insights

## MCP Commands Example

When using MCP with Claude or other AI assistants, you can use natural language like:

- "Navigate to the task management section"
- "Create a high priority task"
- "Record a positive mood entry"
- "Check today's analytics"
- "Verify the app is accessible"

## Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 4000 and 5173 are available
2. **Browser installation**: Run `npm run playwright:install` if browsers aren't found
3. **MCP server**: Verify the MCP server configuration in `mcp-playwright.config.json`

### Debugging

- Use `npm run test:e2e:debug` for step-by-step debugging
- Check browser console logs in headed mode
- Review Playwright HTML reports after test runs

## Architecture Notes

The tests are designed to work with the agent-based backend architecture:

- **TaskAgent**: Task management testing
- **HabitAgent**: Habit tracking validation
- **MoodAgent**: Mood entry verification
- **JournalAgent**: Journal functionality testing
- **CalendarAgent**: Calendar integration testing
- **InsightAgent**: Analytics and insights validation

This setup enables comprehensive E2E testing of the entire application stack while leveraging MCP for natural language test automation.