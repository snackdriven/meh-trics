Feature: Backend Bootstrap
  As a developer
  I want to scaffold Encore backend with agent-based microservices
  So that each domain is isolated and testable

  Scenario: Initialize Encore backend
    Given a new Encore project
    When I set up TypeScript with ES2022 target
    Then the backend should compile and run

  Scenario: Add core services
    Given the backend
    When I add services for tasks, habits, mood, calendar, analytics
    Then each service should have its own directory and migration setup

  Scenario: Use a single migration folder
    Given the backend is in early development
    When I create migrations
    Then all migrations are stored in one folder until the project grows
