import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown, ChevronRight, Minus, Plus, Target } from "lucide-react";
import { useAutoTags } from "../hooks/useAutoTags";
import { useCollapse } from "../hooks/useCollapse";
import { useTodayData } from "../hooks/useTodayData";
import { getAppDate, getAppDateString } from "../lib/date";
import { JournalEntryForm } from "./JournalEntryForm";
import { MoodSnapshot } from "./MoodSnapshot";
import { TodayTasks } from "./TodayTasks";

export function TodayView() {
  const date = getAppDate();
  const dateStr = getAppDateString();
  const habitsCollapse = useCollapse("today_habits");
  const { tags: autoTags } = useAutoTags();
  const {
    moodEntry,
    setMoodEntry,
    journalEntry,
    setJournalEntry,
    habits,
    habitCounts,
    habitNotes,
    setHabitNotes,
    handleHabitCountChange,
    updateHabitEntry,
    loading: isLoading,
  } = useTodayData(date);

  if (isLoading) {
    return <div className="text-center py-8 text-gray-500">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <MoodSnapshot onEntryChange={setMoodEntry} />
      <JournalEntryForm
        date={date}
        moodId={moodEntry?.id}
        autoTags={autoTags}
        onEntryCreated={setJournalEntry}
      />

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-4 w-4" /> Habits
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={habitsCollapse.toggle}>
            {habitsCollapse.collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </CardHeader>
        {!habitsCollapse.collapsed && (
          <CardContent className="space-y-4">
            {habits.map((habit) => {
              const count = habitCounts[habit.id] || 0;
              const notes = habitNotes[habit.id] || "";
              const isCompleted = count >= habit.targetCount;
              return (
                <div key={habit.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{habit.name}</h4>
                    <Badge variant={isCompleted ? "default" : "outline"}>{habit.frequency}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleHabitCountChange(habit.id, count - 1)}
                      disabled={count <= 0}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      min="0"
                      value={count}
                      onChange={(e) =>
                        handleHabitCountChange(habit.id, parseInt(e.target.value) || 0)
                      }
                      className="w-20 text-center"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleHabitCountChange(habit.id, count + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-gray-600">
                      / {habit.targetCount}
                      {isCompleted && "✓"}
                    </span>
                  </div>
                  <Textarea
                    value={notes}
                    onChange={(e) =>
                      setHabitNotes((prev) => ({
                        ...prev,
                        [habit.id]: e.target.value,
                      }))
                    }
                    onBlur={() => updateHabitEntry(habit.id, count, notes)}
                    rows={2}
                  />
                </div>
              );
            })}
          </CardContent>
        )}
      </Card>

      <TodayTasks date={dateStr} />
    </div>
  );
}
