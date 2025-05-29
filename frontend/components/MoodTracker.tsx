import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Heart, Smile, Meh, Frown, Angry } from "lucide-react";
import backend from "~backend/client";
import type { MoodEntry } from "~backend/task/types";

const moodOptions = [
  { value: 1, label: "Very Bad", icon: Angry, color: "text-red-500" },
  { value: 2, label: "Bad", icon: Frown, color: "text-orange-500" },
  { value: 3, label: "Okay", icon: Meh, color: "text-yellow-500" },
  { value: 4, label: "Good", icon: Smile, color: "text-green-500" },
  { value: 5, label: "Great", icon: Heart, color: "text-pink-500" },
];

export function MoodTracker() {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [todayEntry, setTodayEntry] = useState<MoodEntry | null>(null);
  const [recentEntries, setRecentEntries] = useState<MoodEntry[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];

  const loadMoodEntries = async () => {
    try {
      // Get last 7 days of entries
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 6);

      const response = await backend.task.listMoodEntries({
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      });

      setRecentEntries(response.entries);
      
      // Find today's entry
      const todayEntryFound = response.entries.find(
        entry => new Date(entry.date).toISOString().split('T')[0] === today
      );
      
      if (todayEntryFound) {
        setTodayEntry(todayEntryFound);
        setSelectedMood(todayEntryFound.moodScore);
        setNotes(todayEntryFound.notes || "");
      }
    } catch (error) {
      console.error("Failed to load mood entries:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMoodEntries();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMood === null) return;

    setIsSubmitting(true);
    try {
      const entry = await backend.task.createMoodEntry({
        date: new Date(today),
        moodScore: selectedMood,
        notes: notes.trim() || undefined,
      });
      
      setTodayEntry(entry);
      
      // Update recent entries
      setRecentEntries(prev => {
        const filtered = prev.filter(e => 
          new Date(e.date).toISOString().split('T')[0] !== today
        );
        return [entry, ...filtered].slice(0, 7);
      });
    } catch (error) {
      console.error("Failed to save mood entry:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMoodOption = (score: number) => {
    return moodOptions.find(option => option.value === score);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center text-gray-500">Loading mood data...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>How are you feeling today?</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label>Mood</Label>
              <div className="grid grid-cols-5 gap-2 mt-2">
                {moodOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = selectedMood === option.value;
                  
                  return (
                    <Button
                      key={option.value}
                      type="button"
                      variant={isSelected ? "default" : "outline"}
                      className={`flex flex-col items-center gap-2 h-auto py-4 ${
                        isSelected ? "" : "hover:bg-gray-50"
                      }`}
                      onClick={() => setSelectedMood(option.value)}
                    >
                      <Icon className={`h-6 w-6 ${isSelected ? "text-white" : option.color}`} />
                      <span className="text-xs">{option.label}</span>
                    </Button>
                  );
                })}
              </div>
            </div>
            
            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="How was your day? What affected your mood?"
                rows={3}
                className="mt-1"
              />
            </div>
            
            <Button 
              type="submit" 
              disabled={selectedMood === null || isSubmitting}
              className="w-full"
            >
              {isSubmitting ? "Saving..." : todayEntry ? "Update Mood" : "Save Mood"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {recentEntries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Mood History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentEntries.map((entry) => {
                const moodOption = getMoodOption(entry.moodScore);
                const Icon = moodOption?.icon || Heart;
                
                return (
                  <div key={entry.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <Icon className={`h-5 w-5 mt-0.5 ${moodOption?.color || "text-gray-500"}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{moodOption?.label}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(entry.date).toLocaleDateString()}
                        </span>
                      </div>
                      {entry.notes && (
                        <p className="text-sm text-gray-600">{entry.notes}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
