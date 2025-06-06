
# agents.md

Defines modular agents in the current system. Each agent is responsible for a key area of functionality, designed to be composable, override-friendly, and automation-ready.

---

## TaskAgent

```yaml
agent: TaskAgent
description: Handles task creation, editing, tagging, and rescheduling. Supports recurring templates and calendar logic.
inputs:
  - user_input
  - due_date
  - tags
  - routine_template_spawn
outputs:
  - updated_task_list
  - calendar_refresh
triggers:
  - manual_entry
  - daily_routine_trigger
  - bulk_action (complete, delete, tag, reschedule)
```

---

## HabitAgent

```yaml
agent: HabitAgent
description: Tracks recurring habits across daily/weekly/monthly intervals. Updates frequency counters, streaks, and reset logic.
inputs:
  - user_check_in
  - frequency_config
outputs:
  - habit_log
  - completion_streak
  - next_due_reset
triggers:
  - user_action
  - time_boundary (day/week/month)
```

---

## MoodAgent

```yaml
agent: MoodAgent
description: Captures up to two moods per entry with optional notes and visual indicators. Stores history and context.
inputs:
  - mood_selection
  - optional_note
  - time_stamp
outputs:
  - mood_entry
  - visual_mood_tag
  - mood_history_log
triggers:
  - manual_check_in
  - contextual_prompts (optional)
```

---

## JournalAgent

```yaml
agent: JournalAgent
description: Allows users to log 5-minute or freeform text entries. Can be standalone or tied to moods/tasks. Supports end-of-day reflection prompts.
inputs:
  - text_input (plain or markdown)
  - entry_context (linked mood or day)
  - prompt_trigger (e.g., EOD config)
outputs:
  - journal_entry_log
  - mood_link (optional)
  - reflection_archive
triggers:
  - user_start
  - post-mood submission
  - end_of_day (optional prompt)
```

---

## TaggingAgent

```yaml
agent: TaggingAgent
description: Applies smart auto-tags based on context (e.g. time of day, calendar events, habit/task proximity).
inputs:
  - timestamp
  - calendar_context
  - task_habit_metadata
outputs:
  - auto_tags
  - contextual_labels
triggers:
  - mood_submission
  - habit_completion
  - journal_entry
```

---

## RoutineAgent

```yaml
agent: RoutineAgent
description: Manages recurring task templates, their scheduling, and lifecycle (pause, edit, resume).
inputs:
  - active_templates
  - user_state (paused/resumed)
outputs:
  - task_spawn
  - metadata_update
triggers:
  - daily_reset
  - user_interaction
```

---

## CalendarAgent

```yaml
agent: CalendarAgent
description: Aggregates all entries (tasks, habits, moods, events) into a visual, scrollable calendar view. Powers Today View and reflection prompts.
inputs:
  - task_log
  - habit_log
  - mood_log
  - event_log
outputs:
  - calendar_view
  - interactive_overlays
  - today_entries
triggers:
  - app_load
  - date_navigation
  - entry_creation
```

---

## InsightAgent

```yaml
agent: InsightAgent
description: Analyzes mood, habit, and task data to surface trends, correlations, and emotional patterns. Can flag anomalies or suggest behavior adjustments.
inputs:
  - mood_log
  - task_history
  - habit_completion_data
  - journal_metadata (tags, timestamps)
outputs:
  - trend_insights (weekly/monthly summaries)
  - anomaly_alerts (e.g. mood dips, skipped routines)
  - habit-impact correlations (e.g. better mood on days you journal)
  - smart_suggestions (e.g. "reduce workload on Mondays")
  - micro_win_summary
triggers:
  - weekly_cadence (summary generation)
  - user_query ("how was this week?")
  - data_threshold_events (e.g. 3+ days of low mood)
```
