Feature: Habits Tracking
  As a user
  I want to track habits and build streaks
  So that I can develop better routines and achieve long-term goals

# PHASE 1: Core Habit CRUD & Completion
# --------------------------------------
  # Habit CRUD Operations
  Scenario: Create a basic habit
    Given the habits service is running
    When I create a habit "Drink water" with frequency "daily" and target count 8
    Then it should appear in my habits list with correct settings

  Scenario: Create habit with emoji and description
    Given I want to create a detailed habit
    When I add habit "Exercise" with emoji "💪", description "30 minutes cardio", frequency "daily", target 1
    Then the habit should display with emoji and description

  Scenario: Edit an existing habit
    Given I have a habit "Drink water" with target 8
    When I update the target to 10 and change the description
    Then the changes should be saved and reflected in the habit display

  Scenario: Delete a habit
    Given I have a habit I no longer want to track
    When I delete the habit
    Then it should be removed from my habits list and all associated data

  Scenario: Archive completed habit
    Given I have achieved a long-term habit goal
    When I archive the habit instead of deleting it
    Then it should be moved to archived habits but retain all history

  # Habit Frequency and Targets
  Scenario: Set different frequency types
    Given the habits service supports multiple frequencies
    When I create habits with "daily", "weekly", and "monthly" frequencies
    Then each should have appropriate completion requirements

  Scenario: Custom target counts
    Given I want flexible habit targets
    When I set a habit "Read pages" with target count 20
    Then I should be able to log any number up to and beyond the target

  Scenario: Multiple targets per habit
    Given I have a complex habit like "Workout"
    When I set targets for duration (30 min) and type (cardio/strength)
    Then I should be able to track both aspects

  # Habit Completion and Progress
  Scenario: Log simple completion
    Given I have a habit "Meditation" with target 1
    When I mark it as complete for today
    Then it should show 1/1 completed with visual confirmation

  Scenario: Log partial completion
    Given I have a habit "Drink water" with target 8
    When I log 6 glasses completed today
    Then it should show 6/8 progress with visual progress bar

  Scenario: Log over-completion
    Given I have a habit "Exercise" with target 30 minutes
    When I log 45 minutes today
    Then it should show 45/30 (150%) and give bonus recognition

  Scenario: Update completion throughout day
    Given I logged 3 glasses of water this morning
    When I add 2 more glasses in the afternoon
    Then my total should update to 5 glasses for today

  Scenario: Backdate habit completion
    Given I forgot to log yesterday's meditation
    When I go back and mark yesterday as complete
    Then it should update my streak and history correctly

# PHASE 2: Streaks & Analytics
# ----------------------------
# Streak Tracking and Analytics
  Scenario: Build initial streak
    Given I have a new habit "Exercise"
    When I complete it for 3 consecutive days
    Then I should see a 3-day streak display

  Scenario: Track current vs longest streak
    Given I had a 10-day streak but broke it and now have 5 days
    When I view my habit statistics
    Then I should see current streak: 5, longest streak: 10

  Scenario: Break streak with grace period
    Given I have a 7-day streak but miss one day
    When I complete the habit the next day
    Then I should have option for "grace day" or start new streak

  Scenario: Weekly streak for weekly habits
    Given I have a weekly habit "Clean house"
    When I complete it each week for 4 weeks
    Then I should see a 4-week streak

  Scenario: Milestone streak celebrations
    Given I reach significant streak milestones (7, 30, 100 days)
    When I complete the habit
    Then I should see special celebration and milestone recognition

# Habit Statistics and Insights
  Scenario: View completion percentage
    Given I have been tracking a habit for 30 days
    When I view habit statistics
    Then I should see completion rate (e.g., 83% - 25/30 days)

  Scenario: Track habit trends
    Given I have 3 months of habit data
    When I view trend analysis
    Then I should see weekly/monthly completion patterns

  Scenario: Compare multiple habits
    Given I track several different habits
    When I view my habits dashboard
    Then I should see comparative performance across all habits

  Scenario: Habit difficulty scoring
    Given I track different habits with varying success rates
    When I view difficulty analysis
    Then habits should be scored/categorized by difficulty level

# PHASE 3: Organization & Routines
# --------------------------------
# Habit Categories and Organization
  Scenario: Group habits by category
    Given I have many habits
    When I organize them into categories like "Health", "Work", "Personal"
    Then they should be displayed in organized groups

  Scenario: Set habit priorities
    Given I want to focus on specific habits
    When I mark habits as "high priority" or "focus habit"
    Then they should be prominently displayed

  Scenario: Create habit routines
    Given I have related habits that go together
    When I group "Morning routine" habits (exercise, meditation, journaling)
    Then I can track them as a routine bundle

# PHASE 4: Reminders, Export, Sharing
# -----------------------------------
# Habit Reminders and Notifications
  Scenario: Set habit reminders
    Given I want to be reminded to complete habits
    When I set reminder times for "Take vitamins" at 8 AM
    Then I should receive notifications at the specified time

  Scenario: Smart reminder timing
    Given I have habits with optimal timing
    When I enable smart reminders based on my completion patterns
    Then reminders should adapt to when I usually complete the habit

# Habit Export and Sharing
  Scenario: Export habit data
    Given I want to analyze my habit data externally
    When I export my habit tracking data
    Then I should receive CSV/JSON with all completion history and statistics

  Scenario: Share habit achievements
    Given I reach a significant milestone
    When I choose to share my achievement
    Then I should be able to share streak/completion data

# PHASE 5: Templates & Advanced Features
# --------------------------------------
# Habit Templates and Presets
  Scenario: Use habit templates
    Given I want to start common habits quickly
    When I browse habit templates (drink water, exercise, read, etc.)
    Then I should be able to create habits from proven templates

  Scenario: Create custom habit templates
    Given I have successful habit configurations
    When I save a habit as a template
    Then I should be able to reuse it for future similar habits

# Advanced Habit Features
  Scenario: Flexible success criteria
    Given I want nuanced habit tracking
    When I set "minimum" (3/8 glasses = partial success) and "target" (8/8 = full success)
    Then I should be able to track partial vs complete success

  Scenario: Habit dependencies
    Given I have habits that build on each other
    When I set "Read" as dependent on completing "Morning routine"
    Then the system should track these relationships

  Scenario: Seasonal habit adjustments
    Given I have outdoor exercise habits
    When I set seasonal adjustments for winter vs summer
    Then targets and expectations should adapt to the season
