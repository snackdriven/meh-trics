# meh-trics

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)]()
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)]()

> A productivity and wellbeing companion for tracking moods, habits, tasks, and journal entries. Because being a chaotic goblin should still be a measurable lifestyle.

## Features

- 📊 **Mood Tracking** - Quick check-ins with emoji tags, intensity levels, and contextual notes
- 📝 **Journaling** - Rich markdown-supported entries with customizable templates and prompts
- ✅ **Task Management** - Full GTD-style system with priorities, due dates, contexts, and recurring tasks
- 🎯 **Habit Tracking** - Build streaks, track frequency, and monitor progress with visual indicators
- 📅 **Calendar View** - Unified timeline showing all entries, tasks, and habits in one place
- 🔍 **Global Search** - Find anything across all data types with `Ctrl/⌘+K` quick search
- 🏷️ **Smart Tagging** - Automatic context-aware tags and manual categorization
- 🔄 **Routine Templates** - Create and manage recurring task patterns and daily routines
- 📱 **PWA Support** - Installable progressive web app with offline capabilities
- 🌙 **Dark/Light Mode** - Automatic theme switching and user preference memory
- 📈 **Analytics & Insights** - Trend analysis, pattern recognition, and productivity insights
- 🎨 **Theme Customization** - Full color customization with live preview and export/import

## Tech Stack

- **Backend**: [Encore.dev](https://encore.dev/) with TypeScript
- **Frontend**: React + Vite + TypeScript
- **Database**: PostgreSQL
- **Package Manager**: Bun workspaces
- **Testing**: Vitest + Playwright

## Quick Start

### Prerequisites

- [Bun](https://bun.sh/) for package management
- [Encore CLI](https://encore.dev/) for backend development

```bash
# Install Encore CLI
brew install encoredev/tap/encore  # macOS
curl -L https://encore.dev/install.sh | bash  # Linux
iwr https://encore.dev/install.ps1 | iex  # Windows (PowerShell)
```

### Installation & Running

```bash
git clone https://github.com/yourusername/meh-trics.git
cd meh-trics
bun install

# Start both backend and frontend
bun run dev
```

The app will be available at `http://localhost:5173` with the API at `http://localhost:4000`.

## Essential Commands

```bash
# Development
bun run dev                     # Start both backend and frontend
bun run dev:backend            # Start Encore backend only
bun run dev:frontend           # Start Vite frontend only

# Testing
bun test                       # Run all unit tests
bun run test:e2e              # Run Playwright E2E tests
bun run test:e2e:ui           # Run E2E tests with UI

# Building & Deployment
bun run build                 # Build both packages
bun run preview               # Preview production build

# Code Quality
bun run lint                  # Format and lint all code
bun run type-check            # TypeScript validation
```

## Architecture

The backend uses **agent-based architecture** with modular services:

- **TaskAgent** – Task management and scheduling
- **HabitAgent** – Habit tracking and streaks
- **MoodAgent** – Mood check-ins with notes
- **JournalAgent** – Journal entries and templates
- **CalendarAgent** – Unified calendar view
- **InsightAgent** – Analytics and trends

## Documentation

📖 **[Complete Documentation](docs/)** - Organized guides for developers and users

**Quick Links:**
- 🚀 [Development Setup](docs/DEVELOPMENT.md) - Get started developing
- 🎨 [Theme Customization](docs/THEME.md) - Personalize your app  
- 🧪 [Testing Guide](docs/TESTING.md) - Run tests and quality checks
- 🏗️ [Architecture Overview](docs/ARCHITECTURE.md) - Understand the system
- 📊 [Database Schema](docs/DATABASE.md) - Data structure and migrations

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- 🐛 [Report Issues](https://github.com/yourusername/meh-trics/issues)
- 💬 [Discussions](https://github.com/yourusername/meh-trics/discussions)
- 📖 [Browse Documentation](docs/)

