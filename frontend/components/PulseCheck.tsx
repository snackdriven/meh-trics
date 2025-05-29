import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import backend from "~backend/client";
import type { MoodEntry, MoodTier } from "~backend/task/types";

const moodOptions = {
  uplifted: [
    { emoji: "🌟", label: "Radiant" },
    { emoji: "🎉", label: "Excited" },
    { emoji: "😊", label: "Content" },
    { emoji: "🧃", label: "Peaceful" },
    { emoji: "💫", label: "Inspired" },
    { emoji: "🌈", label: "Hopeful" },
  ],
  neutral: [
    { emoji: "😐", label: "Meh" },
    { emoji: "🤔", label: "Thinking" },
    { emoji: "😴", label: "Tired" },
    { emoji: "🙃", label: "Weird" },
    { emoji: "🤷", label: "Unsure" },
    { emoji: "😶", label: "Numb" },
  ],
  heavy: [
    { emoji: "😞", label: "Sad" },
    { emoji: "😰", label: "Anxious" },
    { emoji: "😤", label: "Frustrated" },
    { emoji: "😢", label: "Crying" },
    { emoji: "🌧️", label: "Stormy" },
    { emoji: "🥺", label: "Overwhelmed" },
  ],
};

const tierColors = {
  uplifted: "bg-gradient-to-r from-yellow-100 to-pink-100 border-yellow-300",
  neutral: "bg-gradient-to-r from-blue-100 to-purple-100 border-blue-300",
  heavy: "bg-gradient-to-r from-gray-100 to-indigo-100 border-gray-300",
};

export function PulseCheck() {
  const [selectedTier, setSelectedTier] = useState<MoodTier | null>(null);
  const [selectedMood, setSelectedMood] = useState<{ emoji: string; label: string } | null>(null);
  const [notes, setNotes] = useState("");
  const [todayEntry, setTodayEntry] = useState<MoodEntry | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];

  const loadTodayEntry = async () => {
    try {
      const response = await backend.task.listMoodEntries({
        startDate: today,
        endDate: today,
      });
      
      if (response.entries.length > 0) {
        const entry = response.entries[0];
        setTodayEntry(entry);
        setSelectedTier(entry.tier);
        setSelectedMood({ emoji: entry.emoji, label: entry.label });
        setNotes(entry.notes || "");
      }
    } catch (error) {
      console.error("Failed to load mood entry:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTodayEntry();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTier || !selectedMood) return;

    setIsSubmitting(true);
    try {
      const entry = await backend.task.createMoodEntry({
        date: new Date(today),
        tier: selectedTier,
        emoji: selectedMood.emoji,
        label: selectedMood.label,
        notes: notes.trim() || undefined,
      });
      
      setTodayEntry(entry);
    } catch (error) {
      console.error("Failed to save mood entry:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-white/70 backdrop-blur-sm">
        <CardContent className="p-8">
          <div className="text-center text-gray-500">Loading your pulse...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            How's your energy flowing today? 🌊
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {Object.entries(moodOptions).map(([tier, options]) => (
                <div key={tier} className={`p-4 rounded-xl border-2 ${tierColors[tier as MoodTier]}`}>
                  <h3 className="font-medium text-lg mb-3 capitalize">{tier}</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {options.map((option) => {
                      const isSelected = selectedTier === tier && selectedMood?.emoji === option.emoji;
                      
                      return (
                        <Button
                          key={option.emoji}
                          type="button"
                          variant={isSelected ? "default" : "outline"}
                          className={`flex flex-col items-center gap-2 h-auto py-3 ${
                            isSelected ? "bg-purple-600 hover:bg-purple-700" : "bg-white/50 hover:bg-white/80"
                          }`}
                          onClick={() => {
                            setSelectedTier(tier as MoodTier);
                            setSelectedMood(option);
                          }}
                        >
                          <span className="text-2xl">{option.emoji}</span>
                          <span className="text-xs">{option.label}</span>
                        </Button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            
            <div>
              <Label htmlFor="notes" className="text-base">
                Anything you want to capture about this feeling? ✨
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What's behind this mood? What's your body telling you?"
                rows={3}
                className="mt-2 bg-white/50"
              />
            </div>
            
            <Button 
              type="submit" 
              disabled={!selectedTier || !selectedMood || isSubmitting}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              size="lg"
            >
              {isSubmitting ? "Saving your pulse..." : todayEntry ? "Update Pulse" : "Capture Pulse"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
