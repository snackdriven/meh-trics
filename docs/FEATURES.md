# Features

## Mood Tracking
- **Pulse Check** – Quick mood check-ins with emoji tags and notes
- **Editable Mood Options** – Manage your own set of moods and routine items
- **Mood Entry Sort Index** – Faster `/mood-entries` queries via composite index

## Journaling
- **Moment Marker** – Create journal entries with optional date and Markdown
- **Journal Templates** – Save common prompts for new entries
- **Journal Date Index** – Faster `/journal-entries` queries via index on entry dates
- **Add Template Buttons** – Create routine or journal templates from trackers

## Habits & Routines
- **Routine Tracker** – Log recurring routine activities
- **Habit Tracker** – Create habits and log individual entries
- **Routine Templates** – Create reusable routine item sets

## Task Management
- **Task Tracker** – Manage tasks with priorities, due dates and drag-to-reorder
- **Quick Add** – Create tasks for today right from the Today page
- **Bulk Actions** – Select multiple tasks or habits to complete, delete or reschedule
- **Recurring Tasks** – Automatically generate tasks on a schedule
- **Recurring Task Quotas** – Limit how often recurring tasks are generated
- **Due Date Index** – Faster `/tasks/due` queries via database index
- **Task Filter Indexes** – Faster `/tasks` filtering via indexes

## Calendar & Search
- **Calendar View** – See events and entries on a calendar
- **Global Search** – Press `Ctrl/⌘+K` to search across tasks, habits and entries
- **Keyboard Navigation** – Press `Ctrl/⌘+1-9` to jump to tabs

## General
- **Dark Mode** – Toggle between light and dark themes
- **Customizable Layout** – Drag and drop dashboard widgets
- **Analytics Dashboard** – View aggregate stats on productivity
- **Offline Support** – Installable PWA with cached assets
- **Manual Offline Sync** – Trigger queued entries to sync when ready
- **Data Export** – Download your entries as a CSV file

## Importing Calendar Events

Upload an `.ics` file to import events:

```bash
curl -X POST \
  -H "Content-Type: text/calendar" \
  --data-binary @my-events.ics \
  http://localhost:4000/calendar-events/import
```
