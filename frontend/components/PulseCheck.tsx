import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import backend from "~backend/client";
import type { MoodEntry, MoodTier } from "~backend/task/types";

const moodOptions = {
  uplifted: [
    { emoji: "😄", label: "Happy" },
    { emoji: "🙏", label: "Grateful" },
    { emoji: "🎈", label: "Playful" },
    { emoji: "💖", label: "Loving" },
    { emoji: "🥰", label: "Affectionate" },
    { emoji: "📘", label: "Optimistic" },
    { emoji: "🌞", label: "Hopeful" },
    { emoji: "⚡", label: "Motivated" },
    { emoji: "🤓", label: "Curious" },
    { emoji: "🧃", label: "Excited" },
    { emoji: "🌿", label: "Content" },
    { emoji: "✨", label: "Inspired" },
    { emoji: "🔗", label: "Connected" },
  ],
  neutral: [
    { emoji: "😟", label: "Confused" },
    { emoji: "😰", label: "Anxious" },
    { emoji: "😔", label: "Insecure" },
    { emoji: "😟", label: "Worried" },
    { emoji: "😲", label: "Startled" },
    { emoji: "🌀", label: "Restless" },
    { emoji: "😳", label: "Embarrassed" },
    { emoji: "💤", label: "Tired" },
    { emoji: "😵", label: "Disoriented" },
    { emoji: "🤨", label: "Judgmental" },
    { emoji: "😵‍💫", label: "Overstimulated" },
    { emoji: "🔍", label: "Disconnected" },
  ],
  heavy: [
    { emoji: "😞", label: "Sad" },
    { emoji: "😠", label: "Frustrated" },
    { emoji: "💔", label: "Hopeless" },
    { emoji: "😔", label: "Guilty" },
    { emoji: "😔", label: "Lonely" },
    { emoji: "😡", label: "Angry" },
    { emoji: "❌", label: "Hurt" },
    { emoji: "🙇‍♀️", label: "Helpless" },
    { emoji: "🤢", label: "Repulsed" },
    { emoji: "🔥", label: "Furious" },
    { emoji: "😒", label: "Jealous" },
    { emoji: "🤢", label: "Nauseated" },
    { emoji: "😠", label: "Hostile" },
    { emoji: "😔", label: "Depressed" },
  ],
};

const tierInfo = {
  uplifted: {
    title: "🟢 Uplifted / Energized",
    subtitle: "(positive, connected, curious, hopeful)",
    color: "bg-gradient-to-r from-green-100 to-emerald-100 border-green-300",
  },
  neutral: {
    title: "🟡 Neutral / Mixed / Alert",
    subtitle: "(uncertain, tense, overstimulated, reflective)",
    color: "bg-gradient-to-r from-yellow-100 to-orange-100 border-yellow-300",
  },
  heavy: {
    title: "🔴 Heavy / Drained / Distressed",
    subtitle: "(hurt, angry, overwhelmed, low energy)",
    color: "bg-gradient-to-r from-red-100 to-pink-100 border-red-300",
  },
};

export function PulseCheck() {
  const [selectedTier, setSelectedTier] = useState<MoodTier | null>(null);
  const [selectedMoods, setSelectedMoods] = useState<{ emoji: string; label: string }[]>([]);
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
        setSelectedMoods([{ emoji: entry.emoji, label: entry.label }]);
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
    if (!selectedTier || selectedMoods.length === 0) return;

    setIsSubmitting(true);
    try {
      // For now, we'll save the first selected mood (since backend only supports one)
      const primaryMood = selectedMoods[0];
      const entry = await backend.task.createMoodEntry({
        date: new Date(today),
        tier: selectedTier,
        emoji: primaryMood.emoji,
        label: primaryMood.label,
        notes: notes.trim() || undefined,
      });
      
      setTodayEntry(entry);
    } catch (error) {
      console.error("Failed to save mood entry:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMood = (tier: MoodTier, mood: { emoji: string; label: string }) => {
    if (selectedTier !== tier) {
      setSelectedTier(tier);
      setSelectedMoods([mood]);
    } else {
      const isSelected = selectedMoods.some(m => m.emoji === mood.emoji);
      if (isSelected) {
        setSelectedMoods(prev => prev.filter(m => m.emoji !== mood.emoji));
        if (selectedMoods.length === 1) {
          setSelectedTier(null);
        }
      } else if (selectedMoods.length < 2) {
        setSelectedMoods(prev => [...prev, mood]);
      }
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
            Pick what fits. No overthinking — just notice and log.
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {Object.entries(moodOptions).map(([tier, options]) => {
                const tierData = tierInfo[tier as MoodTier];
                return (
                  <div key={tier} className={`p-4 rounded-xl border-2 ${tierData.color}`}>
                    <div className="mb-3">
                      <h3 className="font-medium text-lg">{tierData.title}</h3>
                      <p className="text-sm text-gray-600">{tierData.subtitle}</p>
                      <p className="text-xs text-gray-500 mt-1">(Select up to 2):</p>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                      {options.map((option) => {
                        const isSelected = selectedMoods.some(m => m.emoji === option.emoji);
                        const canSelect = selectedTier === tier || selectedTier === null;
                        const isDisabled = !canSelect || (selectedMoods.length >= 2 && !isSelected);
                        
                        return (
                          <Button
                            key={option.emoji}
                            type="button"
                            variant={isSelected ? "default" : "outline"}
                            className={`flex flex-col items-center gap-1 h-auto py-2 px-1 text-xs ${
                              isSelected 
                                ? "bg-purple-600 hover:bg-purple-700" 
                                : isDisabled
                                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                  : "bg-white/50 hover:bg-white/80"
                            }`}
                            onClick={() => !isDisabled && toggleMood(tier as MoodTier, option)}
                            disabled={isDisabled}
                          >
                            <span className="text-lg">{option.emoji}</span>
                            <span className="leading-tight text-center">{option.label}</span>
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
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
              disabled={!selectedTier || selectedMoods.length === 0 || isSubmitting}
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
