Feature: Calendar Integration
  As a user
  I want a comprehensive calendar system that integrates with my productivity tracking
  So that I can manage schedules while visualizing my habits, tasks, and mood patterns

  # PHASE 1: Core Calendar Functionality
  Scenario: Create a basic timed event
    Given the calendar service is running
    When I create an event "Team meeting" on tomorrow from 2:00 PM to 3:00 PM
    Then it should appear in my calendar at the correct time with duration

  Scenario: Create all-day event
    Given I want to track special days or multi-day events
    When I create an all-day event "Conference" spanning 3 days
    Then it should appear as a banner across all affected days

  Scenario: Create event with rich details
    Given I want comprehensive event information
    When I create "Doctor appointment" with location "123 Main St", notes "Annual checkup", and color "blue"
    Then all details should be saved and displayed in event views

  Scenario: Edit existing event
    Given I have an event "Team meeting" scheduled for 2 PM
    When I change it to 3 PM and update the location
    Then the changes should be reflected across all calendar views

  Scenario: Delete single vs recurring events
    Given I have a recurring "Weekly standup" event
    When I delete next Tuesday's instance vs the entire series
    Then I should have options for single deletion or series deletion

  Scenario: Duplicate event for similar meetings
    Given I have a detailed project meeting event
    When I duplicate it for next week with minor changes
    Then I should be able to copy all details and modify as needed

  # PHASE 2: Recurrence & Patterns
  Scenario: Set daily recurrence
    Given I have daily commitments like "Morning standup"
    When I set it to repeat daily for 30 days
    Then it should create instances every day with end date option

  Scenario: Set weekly recurrence with specific days
    Given I have "Gym class" every Monday, Wednesday, Friday
    When I set custom weekly recurrence for specific days
    Then it should only appear on selected weekdays

  Scenario: Set monthly recurrence by date vs day
    Given I have "Board meeting" monthly
    When I choose "3rd Tuesday" vs "15th of month" recurrence
    Then it should handle both date-based and day-based monthly patterns

  Scenario: Set yearly recurrence for anniversaries
    Given I want to track "Birthday" and "Anniversary" events
    When I set yearly recurrence
    Then they should appear annually with age/year counters

  Scenario: Handle recurrence exceptions
    Given I have recurring "Weekly meeting" but need to skip holiday week
    When I mark specific dates as exceptions
    Then those instances should be skipped while maintaining the pattern

  # PHASE 3: Calendar Views & Navigation
  Scenario: Month view with event density
    Given I have varying event loads throughout the month
    When I view month calendar
    Then I should see event counts, overflow indicators, and density visualization

  Scenario: Week view with hourly time slots
    Given I want detailed weekly planning
    When I switch to week view
    Then I should see hourly time slots with events positioned by duration

  Scenario: Day view for detailed scheduling
    Given I have a busy day with many events
    When I view single day detail
    Then I should see timeline with precise timing and event conflicts

  Scenario: Agenda view for upcoming events
    Given I want to see upcoming events in list format
    When I switch to agenda view
    Then I should see chronological list with dates, times, and details

  Scenario: Custom date range views
    Given I want to view specific time periods
    When I select "Next 14 days" or "This quarter" views
    Then the calendar should adapt to show the selected range

  # PHASE 4: Import, Export, and Sync
  Scenario: Import .ics calendar file
    Given I have external calendar data
    When I upload .ics file from Google Calendar, Outlook, or Apple Calendar
    Then all events should be imported with proper categorization and conflict detection

  Scenario: Selective calendar import
    Given I want to import only work events from external calendar
    When I choose selective import with filters
    Then I should be able to preview and choose which events to import

  Scenario: Export calendar to .ics format
    Given I want to share my calendar or backup data
    When I export selected date range to .ics format
    Then I should receive compatible file for other calendar applications

  Scenario: Sync with external calendars
    Given I want ongoing synchronization
    When I connect to Google/Outlook calendar APIs
    Then changes should sync bidirectionally with conflict resolution

  # PHASE 5: Productivity Data Integration
  Scenario: Overlay task deadlines on calendar
    Given I have tasks with due dates
    When I view calendar with task overlay enabled
    Then I should see task indicators on their due dates with priority colors

  Scenario: Display habit tracking on calendar
    Given I track daily habits like exercise and meditation
    When I enable habit overlay on calendar
    Then I should see completion indicators for each day's habit progress

  Scenario: Show mood patterns on calendar
    Given I log mood entries consistently
    When I view calendar with mood overlay
    Then I should see color-coded mood indicators showing emotional patterns

  Scenario: Integrate journal entries with calendar
    Given I write journal entries regularly
    When I view calendar with journal overlay
    Then I should see indicators for days with journal entries and entry counts

  Scenario: Combined productivity dashboard view
    Given I track tasks, habits, moods, and calendar events
    When I view integrated dashboard calendar
    Then I should see comprehensive daily productivity summaries

  # PHASE 6: Customization & User Settings
  Scenario: Customize calendar appearance
    Given I want personalized calendar display
    When I adjust colors, fonts, density, and layout preferences
    Then my calendar should reflect my visual preferences across all views

  Scenario: Set working hours and availability
    Given I want to show my availability patterns
    When I set working hours, break times, and unavailable periods
    Then the calendar should highlight available time slots for scheduling

  Scenario: Create event categories with colors
    Given I have different types of events (work, personal, health)
    When I create categories with specific colors and icons
    Then events should be visually distinguished by category

  Scenario: Configure notification preferences
    Given I want timely event reminders
    When I set notification preferences (5 min, 1 hour, 1 day before)
    Then I should receive notifications according to my preferences

  # PHASE 7: Advanced Features
  Scenario: Event conflict detection and resolution
    Given I schedule overlapping events
    When I create "Dentist appointment" during existing "Team meeting"
    Then I should see conflict warnings and resolution suggestions

  Scenario: Travel time calculation
    Given I have events at different locations
    When I enable travel time calculation between venues
    Then the calendar should suggest buffer time and show travel duration

  Scenario: Meeting room and resource booking
    Given I need to reserve conference rooms or equipment
    When I add resource requirements to events
    Then I should see availability and be able to book resources

  Scenario: Attendee management and invitations
    Given I organize meetings with multiple people
    When I add attendees to events
    Then I should be able to send invitations and track responses

  Scenario: Time zone handling for travel
    Given I travel across time zones frequently
    When I create events in different time zones
    Then the calendar should handle time zone conversions automatically

  # PHASE 8: Analytics & Insights
  Scenario: Time allocation analysis
    Given I categorize my calendar events
    When I view time allocation reports
    Then I should see how I spend time across work, personal, health categories

  Scenario: Meeting patterns and optimization
    Given I have regular meeting schedules
    When I analyze meeting patterns
    Then I should see insights about meeting load, duration trends, and optimization suggestions

  Scenario: Productivity correlation with calendar
    Given I track productivity metrics alongside calendar events
    When I view correlation analysis
    Then I should see how different event types affect my mood, habit completion, and task productivity

  # PHASE 9: Sharing & Collaboration
  Scenario: Share calendar with family/team
    Given I want to coordinate with others
    When I share specific calendar categories or date ranges
    Then recipients should see shared events with appropriate permission levels

  Scenario: Subscribe to external calendars
    Given I want to see holidays, sports schedules, or team calendars
    When I subscribe to public calendar feeds
    Then external events should appear in my calendar with clear source identification
