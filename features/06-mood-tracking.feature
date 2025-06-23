Feature: Mood Tracking
  As a user
  I want to comprehensively track my emotional well-being
  So that I can understand patterns, triggers, and improve my mental health

  # PHASE 1: Core Mood Logging (MVP)
  Scenario: Log a basic mood entry
    Given the mood service is running
    When I select "Happy" from the mood options
    Then it should be saved with today's date, current time, and appear in my mood history

  Scenario: Log mood with detailed context
    Given I want to track my mood comprehensively
    When I select "Anxious", add notes "Big presentation today", and tag it with "work"
    Then the entry should include emotion, context, and tags for future analysis

  Scenario: Quick mood check-in
    Given I want to quickly log my current state
    When I use the one-tap mood check-in widget
    Then I should be able to select and save a mood in under 3 seconds

  Scenario: Voice mood logging
    Given I want hands-free mood tracking
    When I use voice input to say "I'm feeling stressed about deadlines"
    Then the system should parse emotion and context automatically

  Scenario: Log multiple moods throughout day
    Given I want to track mood changes
    When I log "Excited" at 9 AM, "Focused" at 2 PM, and "Tired" at 7 PM
    Then all entries should be saved with timestamps for daily analysis

  Scenario: Update current mood entry
    Given I logged "Neutral" but my mood changed
    When I update the current entry to "Happy" within the same hour
    Then it should update the existing entry rather than create duplicate

  Scenario: Backdate mood entries
    Given I forgot to log yesterday's mood
    When I go back and add "Stressed" for yesterday evening
    Then it should be saved with the correct historical timestamp

  # PHASE 2: Categories, Customization, Context & Triggers
  Scenario: Browse mood categories
    Given the app supports comprehensive mood tracking
    When I browse available mood options
    Then I should see organized categories: Uplifted (13 options), Neutral (12 options), Heavy (14 options)

  Scenario: Select primary and secondary moods
    Given I have complex emotions
    When I select "Happy" as primary and "Nervous" as secondary mood
    Then both should be tracked and displayed together

  Scenario: Custom mood options
    Given I have specific moods not in the defaults
    When I create custom mood "Determined" with custom emoji
    Then it should be available for future mood logging

  Scenario: Associate mood with activities
    Given I want to track what affects my mood
    When I log "Energized" and associate it with "Morning workout"
    Then the system should track activity-mood correlations

  Scenario: Track mood triggers
    Given I experience regular mood patterns
    When I log moods with triggers like "caffeine", "sleep", "social interaction"
    Then I should be able to identify trigger patterns over time

  Scenario: Location-based mood tracking
    Given location affects my mood
    When I enable location tracking and log moods
    Then I should see mood patterns by location (home, office, gym, etc.)

  Scenario: Weather correlation tracking
    Given weather may affect my mood
    When I log moods and the system tracks weather data
    Then I should see correlations between weather patterns and mood

  # PHASE 3: Mood History, Analysis, Filtering & Search
  Scenario: View daily mood timeline
    Given I have multiple mood entries for today
    When I view today's mood summary
    Then I should see a timeline with all moods, times, and context

  Scenario: Weekly mood overview
    Given I have been logging moods consistently
    When I view my weekly mood report
    Then I should see mood distribution, dominant emotions, and patterns

  Scenario: Monthly mood trends
    Given I have 30+ days of mood data
    When I view monthly analytics
    Then I should see trends, improvements, and concerning patterns

  Scenario: Mood streak tracking
    Given I want to track positive mood consistency
    When I maintain positive moods for consecutive days
    Then I should see streak counts and celebration milestones

  Scenario: Filter moods by category
    Given I have diverse mood entries
    When I filter by "Heavy" category moods
    Then I should only see entries with negative emotional states

  Scenario: Search mood entries by notes
    Given I add descriptive notes to mood entries
    When I search for "work stress"
    Then I should see all mood entries containing those keywords

  Scenario: Filter moods by date range
    Given I want to analyze a specific period
    When I filter moods from "last week" or "past month"
    Then I should see only entries from that time period

  Scenario: Filter by mood triggers
    Given I tag moods with triggers
    When I filter by trigger "caffeine" or "lack of sleep"
    Then I should see all related mood entries

  # PHASE 4: Insights, Reminders, Export & Sharing
  Scenario: Identify mood patterns by time of day
    Given I consistently log moods throughout days
    When I view time-based analysis
    Then I should see patterns like "mornings tend to be positive, afternoons neutral"

  Scenario: Mood correlation with other activities
    Given I track tasks, habits, and moods
    When I view correlation analysis
    Then I should see how completing habits affects mood patterns

  Scenario: Mood stability metrics
    Given I want to understand emotional consistency
    When I view mood stability analysis
    Then I should see variance metrics and stability trends

  Scenario: Trigger impact analysis
    Given I consistently track mood triggers
    When I view trigger analysis
    Then I should see which factors most positively/negatively impact my mood

  Scenario: Set mood check-in reminders
    Given I want consistent mood tracking
    When I set reminders for mood check-ins at 10 AM, 3 PM, 8 PM
    Then I should receive gentle notifications to log my current mood

  Scenario: Smart reminder timing
    Given I have established mood logging patterns
    When I enable adaptive reminders
    Then reminder times should adjust based on when I typically log moods

  Scenario: Mood milestone notifications
    Given I reach positive mood milestones
    When I maintain good moods for a week
    Then I should receive encouraging notifications about my progress

  Scenario: Export mood data
    Given I want to share data with healthcare providers
    When I export my mood tracking data
    Then I should receive comprehensive CSV/PDF with all entries and analysis

  Scenario: Anonymous mood sharing
    Given I want to contribute to mood research
    When I opt into anonymous data sharing
    Then my aggregated mood patterns should contribute to population studies

  # PHASE 5: Emergency & Advanced Features (Defer until later)
  Scenario: Crisis mood detection
    Given I log consistently negative moods
    When the system detects concerning patterns
    Then I should receive gentle suggestions for support resources

  Scenario: Rapid mood decline alerts
    Given I experience sudden mood changes
    When my mood drops significantly from previous patterns
    Then the system should offer coping resources and check-in prompts

  Scenario: Mood prediction modeling
    Given I have extensive mood history and pattern data
    When I view predictive insights
    Then the system should suggest likely mood outcomes based on current patterns

  Scenario: Mood-based recommendations
    Given my mood patterns and successful coping strategies
    When I'm experiencing low moods
    Then the system should recommend activities that historically improve my mood

  Scenario: Integration with wearable devices
    Given I wear fitness trackers that monitor stress/heart rate
    When I sync wearable data with mood logs
    Then I should see correlations between physiological and emotional states
