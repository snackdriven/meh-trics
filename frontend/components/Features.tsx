import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditableCopy } from "./EditableCopy";

const features = [
  { title: "Pulse Check", desc: "quick mood check-ins with emoji tags and notes" },
  { title: "Moment Marker", desc: "daily journal prompts for recording events and reflections" },
  { title: "Routine Tracker", desc: "log recurring routine activities" },
  { title: "Habit Tracker", desc: "create habits and log individual entries" },
  { title: "Task Tracker", desc: "manage tasks with priorities, due dates and drag-to-reorder" },
  { title: "Bulk Actions", desc: "select multiple tasks or habits to complete, delete or reschedule" },
  { title: "Recurring Tasks", desc: "automatically generate tasks on a schedule" },
  { title: "Calendar View", desc: "see events and entries on a calendar" },
  { title: "Global Search", desc: "press Ctrl/Cmd+K to search across tasks, habits and entries" },
  { title: "Dark Mode", desc: "toggle between light and dark themes" },
  { title: "Customizable Layout", desc: "drag and drop dashboard widgets and navigation items" },
  { title: "Editable Mood Options", desc: "manage your own set of moods and routine items" },
  { title: "Recurring Task Quotas", desc: "limit how often recurring tasks are generated" },
  { title: "Analytics Dashboard", desc: "view aggregate stats on your productivity" },
];

export function Features() {
  return (
    <div className="space-y-4 p-4">
      <EditableCopy
        storageKey="featuresCopy"
        defaultText="Feature Highlights"
        as="h2"
        className="text-2xl font-bold text-center"
      />
      {features.map((f) => (
        <Card key={f.title} className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle>{f.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{f.desc}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
