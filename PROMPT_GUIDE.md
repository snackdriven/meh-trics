# Prompt Guide for High-Quality, Context-Preserving Code

This guide provides a comprehensive checklist of features, enhancements, and UI/UX improvements for the project, along with prompt templates to ensure high-quality, context-preserving code generation in future conversations.

---

## 📝 Feature & Enhancement Checklist

### Core Features
- [ ] User authentication (sign up, login, logout, session management)
- [ ] User profile management (view, edit, avatar upload)
- [ ] Journal entry CRUD (create, read, update, delete)
- [ ] Tagging and categorization of entries
- [ ] Site monitoring (add/remove sites, view status)
- [ ] Uptime history and analytics
- [ ] Real-time notifications for site status changes
- [ ] Dashboard with summary widgets (recent entries, stats, etc.)

### UI/UX Enhancements
- [ ] Responsive layout for mobile, tablet, desktop
- [ ] Dark mode toggle and theme persistence
- [ ] Accessible navigation (keyboard, ARIA, focus management)
- [ ] Loading skeletons and spinners for async data
- [ ] Modals for entry creation, confirmation dialogs, and alerts
- [ ] Animated dropdowns, menus, and notifications
- [ ] Optimistic UI updates for mutations
- [ ] Error boundaries and user-friendly error messages
- [ ] Customizable dashboard widgets (drag, hide, resize)
- [ ] Search and filter for journal entries and sites
- [ ] Infinite scrolling or pagination for long lists

### Developer Experience & Quality
- [ ] All components documented in Storybook with usage examples
- [ ] Unit, integration, and end-to-end tests for all features
- [ ] Linting and formatting enforced (Biome, Prettier, ESLint)
- [ ] TypeScript types for all API responses and component props
- [ ] Code splitting and lazy loading for large pages/components
- [ ] Custom hooks for form state, API calls, and mutations
- [ ] Context providers for global state (theme, auth, notifications)
- [ ] Environment variable and secret management (Encore, .env)
- [ ] Automated client code generation for Encore APIs

### Backend/Service Enhancements
- [ ] Pub/Sub event handling for site status and notifications
- [ ] Database migrations tracked and versioned per service
- [ ] Health checks and monitoring endpoints
- [ ] Rate limiting and abuse prevention
- [ ] Audit logging for critical actions
- [ ] API versioning and deprecation strategy

---

## 🧑‍💻 Prompt Templates for High-Quality, Context-Preserving Code

### General Prompt Structure
```
You are an expert Encore/Next.js/TypeScript developer. 
When you generate code, always:
- Use clear, modern, idiomatic TypeScript and React patterns
- Add or update all necessary imports
- Ensure all types/interfaces are defined and exported as needed
- Use context providers and hooks for global state
- Add ARIA and accessibility features to UI
- Use CSS variables and utility classes for styling
- Add comments for non-obvious logic
- If modifying multiple files, list all changes and their purpose
- If creating a new feature, update Storybook and add a usage example
- If the change affects data or API, update types and client code
- Never remove or break existing features unless explicitly told
- Always explain how your change preserves or improves context and data integrity
```

### Example: Add a Feature
```
Add a "favorite" button to each journal entry.
- Update the backend to support marking entries as favorite (API, DB, types)
- Update the frontend to show a star icon, toggle state, and update optimistically
- Add a Storybook story for the new button
- Ensure accessibility (keyboard, ARIA)
- Update tests to cover the new feature
- List all files changed and why
```

### Example: Refactor for Reusability
```
Refactor the entry form to use a custom useForm hook.
- Move all form state and validation logic to the hook
- Ensure the form works for both create and edit flows
- Add a Storybook story for the form component
- Update all usages to use the new hook
- Explain how this improves maintainability and prevents data/context loss
```

### Example: UI/UX Enhancement
```
Improve the mobile navigation experience.
- Make the navigation bar sticky on mobile
- Add a hamburger menu for small screens
- Ensure all navigation is keyboard accessible
- Add ARIA roles and labels
- Update Storybook with a mobile viewport example
- Explain how this improves accessibility and user experience
```

### Example: Data Integrity/Context Preservation
```
When adding or changing features, always:
- Update all affected types/interfaces
- Ensure all API changes are reflected in the client code
- Add migration scripts if the database schema changes
- Add tests to verify data is not lost or corrupted
- Document any breaking changes or required manual steps
```

---

## 🛡️ Methods to Ensure Data & Context Are Not Lost

- Always update TypeScript types and interfaces when changing data models or APIs
- Use context providers for global state (theme, auth, notifications)
- Add tests for all data mutations and context changes
- Use optimistic updates and rollbacks for UI state
- Document all changes in code comments and commit messages
- Regenerate API clients after backend changes
- Use Storybook to document and visually test all UI states
- Add error boundaries and fallback UI for critical components 

## Implementation Guidelines

To ensure context and data persistence between conversations:

1. **State Management**
```typescript
// Create a persistent state file
interface AppState {
  currentFeatures: string[];
  completedTasks: string[];
  userPreferences: Record<string, unknown>;
}

// Use Encore.ts's storage system for persistence
const stateStorage = new SQLDatabase("app_state", {
  migrations: "./migrations",
});
```

2. **Feature Flags**
```typescript
// Implement feature flags for gradual rollout
interface FeatureFlags {
  enabledFeatures: Set<string>;
  userOverrides: Map<string, Set<string>>;
}

// Store in database for persistence
const featureFlags = new SQLDatabase("feature_flags", {
  migrations: "./migrations",
});
```

3. **Documentation Generation**
```markdown
- Maintain a DEVELOPMENT_NOTES.md file
- Document all architectural decisions
- Keep a changelog of implemented features
- Document all environment variables and configurations
```

4. **Progress Tracking**
```typescript
// Create a progress tracking system
interface ProgressTracker {
  completedFeatures: string[];
  inProgressFeatures: string[];
  blockers: string[];
  dependencies: Record<string, string[]>;
}

// Store in database for persistence
const progressTracker = new SQLDatabase("progress_tracker", {
  migrations: "./migrations",
});
```

For each feature implementation:

1. Create a feature branch
2. Document requirements and acceptance criteria
3. Implement database migrations first
4. Add TypeScript interfaces and types
5. Implement backend endpoints
6. Create frontend components
7. Add tests
8. Document the implementation

This structured approach ensures:
- Clear feature tracking
- Persistent state between conversations
- Type safety throughout the application
- Proper documentation
- Testable implementations

Would you like me to elaborate on any specific section or create more detailed prompts for particular features?





