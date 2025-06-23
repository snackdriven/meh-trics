Feature: Frontend Bootstrap
  As a developer
  I want a Vite + React + TypeScript frontend
  So that I can build a modern, fast UI

  Scenario: Initialize frontend
    Given a new Vite project
    When I add React 18 and TypeScript
    Then the frontend should build and run

  Scenario: Add UI and state libraries
    Given the frontend
    When I add Tailwind CSS, Radix UI, Lucide React, and TanStack Query
    Then I should see a styled, interactive app shell
