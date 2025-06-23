Feature: Task Management
  As a user
  I want to manage tasks and journal entries
  So that I can track my productivity

  # === Phase 1: Core Task & Journal CRUD ===
  Scenario: Create a basic task
    Given the task service is running
    When I create a new task with title "Buy groceries"
    Then it should be saved and visible in my task list

  Scenario: Set task priority and due date
    Given I have a task "Buy groceries"
    When I set the priority to "High" and due date to tomorrow
    Then the task should show high priority and due date

  Scenario: Mark task as complete
    Given I have a task "Buy groceries"
    When I mark it as complete
    Then it should appear in my completed tasks

  Scenario: Create recurring task
    Given the task service is running
    When I create a recurring task "Water plants" with frequency "daily"
    Then it should automatically generate new instances each day

  Scenario: Create a basic journal entry
    Given the task service is running
    When I create a journal entry with subject "Daily Reflection" and body "Had a productive day"
    Then it should be saved and retrievable by date

  Scenario: Add journal entry with rich fields
    Given I want to create a detailed journal entry
    When I add subject "Morning Thoughts", body with rich text formatting, mood "Happy", and music "Classical playlist"
    Then all fields should be saved and displayed correctly

  Scenario: Edit an existing journal entry
    Given I have a journal entry from yesterday
    When I update the body text and change the mood
    Then the changes should be saved with updated timestamp

  Scenario: Delete a journal entry
    Given I have a journal entry I no longer want
    When I delete the entry
    Then it should be removed from my journal list

  # === Phase 2: Journal Entry Formatting & Tagging ===
  Scenario: Format journal entry text
    Given I'm writing a journal entry
    When I apply bold, italic, and bullet points to my text
    Then the formatting should be preserved when saved and displayed

  Scenario: Add tags to journal entry
    Given I'm creating a journal entry about work
    When I add tags "work", "meeting", "progress"
    Then the entry should be tagged and findable by those tags

  Scenario: Filter entries by tags
    Given I have journal entries with various tags
    When I filter by tag "work"
    Then I should only see entries tagged with "work"

  # === Phase 3: Journal Search & Filtering ===
  Scenario: Search journal entries by text
    Given I have multiple journal entries
    When I search for "productive"
    Then I should see all entries containing that word

  Scenario: Filter entries by date range
    Given I have journal entries from the past month
    When I filter entries from last week
    Then I should only see entries from that date range

  Scenario: Filter entries by mood
    Given I have journal entries with different moods
    When I filter by "Happy" mood
    Then I should only see entries where I was happy

  # === Phase 4: Journal Listing, Navigation & Calendar Integration ===
  Scenario: View journal entry list
    Given I have multiple journal entries
    When I navigate to the journal section
    Then I should see a chronological list of all my entries

  Scenario: Paginate through journal entries
    Given I have more than 20 journal entries
    When I view my journal list
    Then entries should be paginated with navigation controls

  Scenario: View entries in calendar format
    Given I have journal entries from different dates
    When I switch to calendar view
    Then I should see a calendar with indicators on days that have entries

  Scenario: Calendar entry indicators
    Given I have multiple entries on some days
    When I view the calendar
    Then days with entries should show visual indicators like dots or entry counts

  Scenario: Navigate to entry from calendar
    Given I'm viewing the journal calendar
    When I click on a day with entries
    Then I should see the entries for that specific day

  # === Phase 5: Journal Analytics & Export ===
  Scenario: View journal statistics
    Given I have been journaling for several weeks
    When I view journal statistics
    Then I should see entry count, mood trends, and writing frequency

  Scenario: Track mood patterns in journal
    Given I consistently log moods in journal entries
    When I view mood statistics
    Then I should see patterns and trends over time

  Scenario: Export journal entries
    Given I want to backup my journal data
    When I export my journal entries
    Then I should receive a file (CSV or JSON) with all my entries

  Scenario: Export filtered journal entries
    Given I want to export only work-related entries
    When I filter by "work" tag and export
    Then the exported file should only contain work-tagged entries

  # === Phase 6: Journal-Task Integration ===
  Scenario: Link journal entry to task
    Given I have a task "Buy groceries" and completed it
    When I create a journal entry about completing the task
    Then the journal entry should reference the task

  Scenario: View task-linked journal entries
    Given I have journal entries linked to various tasks
    When I view a task's details
    Then I should see related journal entries
