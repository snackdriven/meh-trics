export interface FeatureGroup {
  name: string;
  items: string[];
}

export const features: FeatureGroup[] = [
  {
    name: "Mood Tracking",
    items: [
      "Pulse Check – quick mood check-ins with emoji tags and notes",
      "Editable Mood Options – manage your own set of moods and routine items",
      "Mood Entry Sort Index – faster `/mood-entries` queries via a composite index on date and creation time",
    ],
  },
  {
    name: "Journaling",
    items: [
      "Moment Marker – create journal entries with optional date and Markdown",
      "Journal Templates – save common prompts for new entries",
      "Journal Date Index – faster `/journal-entries` queries via an index on entry dates",
      "Add Template Buttons – create routine or journal templates from their respective trackers",
    ],
  },
  {
    name: "Habits & Routines",
    items: [
      "Routine Tracker – log recurring routine activities",
      "Habit Tracker – create habits and log individual entries",
      "Routine Templates – create reusable routine item sets",
    ],
  },
  {
    name: "Task Management",
    items: [
      "Task Tracker – manage tasks with priorities, due dates and drag‑to‑reorder",
      "Bulk Actions – select multiple tasks or habits to complete, delete or reschedule",
      "Recurring Tasks – automatically generate tasks on a schedule",
      "Recurring Task Quotas – limit how often recurring tasks are generated",
      "Due Date Index – faster `/tasks/due` queries via a database index on task due dates",
      "Task Filter Indexes – faster `/tasks` filtering via indexes on status, energy level and tags",
    ],
  },
  {
    name: "Calendar & Search",
    items: [
      "Calendar View – see events and entries on a calendar",
      "Global Search – press Ctrl/⌘+K to search across tasks, habits and entries",
    ],
  },
  {
    name: "General",
    items: [
      "Dark Mode – toggle between light and dark themes",
      "Customizable Layout – drag and drop dashboard widgets and navigation items",
      "Analytics Dashboard – view aggregate stats on your productivity",
      "Offline Support – installable PWA with cached assets for offline use",
      "Manual Offline Sync – trigger queued entries to sync when ready",
      "Data Export – download your entries as a CSV file",
    ],
  },
];
