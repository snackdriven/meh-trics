import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAsyncOperation } from "@/hooks/useAsyncOperation";
import { Brain, CheckSquare, ChevronDown, ChevronRight, Heart, Link2, Target } from "lucide-react";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import backend from "~backend/client";
import type { JournalEntry } from "~backend/task/types";
import { useCollapse } from "../hooks/useCollapse";
import { useToast } from "../hooks/useToast";

interface JournalEntryFormProps {
  date: Date;
  moodId?: number;
  taskId?: number;
  habitEntryId?: number;
  autoTags?: string[];
  onEntryCreated?: (entry: JournalEntry) => void;
}

export function JournalEntryForm({
  date,
  moodId,
  taskId,
  habitEntryId,
  autoTags = [],
  onEntryCreated,
}: JournalEntryFormProps) {
  const today = date.toISOString().split("T")[0];
  const [entryDate, setEntryDate] = useState(today);
  const [text, setText] = useState("");
  const [tags, setTags] = useState("");
  const [latestEntry, setLatestEntry] = useState<JournalEntry | null>(null);
  const { showSuccess, showError } = useToast();
  const { collapsed, toggle } = useCollapse("today_journal");

  useEffect(() => {
    if (autoTags.length > 0 && tags === "") {
      setTags(autoTags.join(", "));
    }
  }, [autoTags]);

  const { loading, execute } = useAsyncOperation(
    async () => {
      if (!text.trim()) {
        throw new Error("Please write something");
      }
      const entry = await backend.task.createJournalEntry({
        date: entryDate ? new Date(entryDate) : undefined,
        text: text.trim(),
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        moodId,
        taskId,
        habitEntryId,
      });
      setText("");
      setTags("");
      setEntryDate(today);
      setLatestEntry(entry);
      onEntryCreated?.(entry);
      return entry;
    },
    () => showSuccess("Journal saved!"),
    (err) => showError(err, "Save Error")
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    execute();
  };

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-4 w-4" /> Journal Entry
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={toggle}>
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </CardHeader>
      {!collapsed && (
        <CardContent className="space-y-4">
          {latestEntry && (
            <div className="space-y-2">
              <div className="text-sm text-gray-500">
                Saved {new Date(latestEntry.createdAt).toLocaleString()}
              </div>
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>{latestEntry.text}</ReactMarkdown>
              </div>
              {latestEntry.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {latestEntry.tags.map((tag) => (
                    <span key={tag} className="text-xs border rounded px-1">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              {(latestEntry.moodId || latestEntry.taskId || latestEntry.habitEntryId) && (
                <div className="text-xs text-gray-500 flex items-center gap-2">
                  <Link2 className="h-3 w-3" />
                  <span>
                    Linked to:{" "}
                    {latestEntry.moodId && (
                      <span className="inline-flex items-center gap-1">
                        <Heart className="h-2 w-2" />
                        Mood
                      </span>
                    )}
                    {latestEntry.taskId && (
                      <span className="inline-flex items-center gap-1">
                        <CheckSquare className="h-2 w-2" />
                        Task
                      </span>
                    )}
                    {latestEntry.habitEntryId && (
                      <span className="inline-flex items-center gap-1">
                        <Target className="h-2 w-2" />
                        Habit
                      </span>
                    )}
                  </span>
                </div>
              )}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="journalDate">Date (optional)</Label>
              <Input
                id="journalDate"
                type="date"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="journalText">Entry</Label>
              <Textarea
                id="journalText"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="journalTags">Tags (comma separated)</Label>
              <Input id="journalTags" value={tags} onChange={(e) => setTags(e.target.value)} />
            </div>
            {(moodId || taskId || habitEntryId) && (
              <div className="text-sm text-gray-600 flex items-center gap-2">
                <Link2 className="h-4 w-4" />
                <span>
                  Linked to:{" "}
                  {moodId && (
                    <span className="inline-flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      Mood
                    </span>
                  )}
                  {taskId && (
                    <span className="inline-flex items-center gap-1">
                      <CheckSquare className="h-3 w-3" />
                      Task
                    </span>
                  )}
                  {habitEntryId && (
                    <span className="inline-flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      Habit
                    </span>
                  )}
                </span>
              </div>
            )}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Saving..." : "Save Entry"}
            </Button>
          </form>
        </CardContent>
      )}
    </Card>
  );
}
