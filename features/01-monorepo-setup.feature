Feature: Project Setup
  As a developer
  I want a simple project structure
  So that I can iterate quickly and add complexity only when needed

  Scenario: Initialize project
    Given a new repository
    When I set up backend and frontend folders
    Then I should be able to run install and scripts from the root
