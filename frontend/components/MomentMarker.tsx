import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar, Droplets, Lightbulb, Cloud, Leaf } from "lucide-react";
import backend from "~backend/client";
import type { JournalEntry } from "~backend/task/types";

const prompts = [
  {
    key: "whatHappened",
    label: "🗓 What happened today (or is about to)?",
    description: "Gives your brain a place to timestamp the day",
    icon: Calendar,
    placeholder: "The big stuff, the tiny stuff, the weird stuff...",
  },
  {
    key: "whatINeed",
    label: "🧃 What do I need right now?",
    description: "Hydration, validation, a snack, a scream — all valid",
    icon: Droplets,
    placeholder: "Rest? Connection? A snack? Permission to feel?",
  },
  {
    key: "smallWin",
    label: "💡 What's one small win?",
    description: "A tiny success, effort you showed up for, or a moment that mattered — even if no one else noticed",
    icon: Lightbulb,
    placeholder: "Got out of bed? Sent that text? Survived the meeting?",
  },
  {
    key: "whatFeltHard",
    label: "☁️ What felt hard?",
    description: "No shame. Just surfacing the weight so you're not carrying it invisibly",
    icon: Cloud,
    placeholder: "It's okay to name the difficult stuff...",
  },
  {
    key: "thoughtToRelease",
    label: "🍃 Any thought I want to release:",
    description: "Emotional declutter — like hitting \"clear cache\" for the brain.",
    icon: Leaf,
    placeholder: "Let it go, let it flow...",
  },
];

export function MomentMarker() {
  const [entries, setEntries] = useState<Record<string, string>>({});
  const [todayEntry, setTodayEntry] = useState<JournalEntry | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];

  const loadTodayEntry = async () => {
    try {
      const entry = await backend.task.getJournalEntry({ date: today });
      setTodayEntry(entry);
      setEntries({
        whatHappened: entry.whatHappened || "",
        whatINeed: entry.whatINeed || "",
        smallWin: entry.smallWin || "",
        whatFeltHard: entry.whatFeltHard || "",
        thoughtToRelease: entry.thoughtToRelease || "",
      });
    } catch (error) {
      // Entry doesn't exist yet, that's fine
      setEntries({
        whatHappened: "",
        whatINeed: "",
        smallWin: "",
        whatFeltHard: "",
        thoughtToRelease: "",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTodayEntry();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    try {
      const entry = await backend.task.createJournalEntry({
        date: new Date(today),
        whatHappened: entries.whatHappened.trim() || undefined,
        whatINeed: entries.whatINeed.trim() || undefined,
        smallWin: entries.smallWin.trim() || undefined,
        whatFeltHard: entries.whatFeltHard.trim() || undefined,
        thoughtToRelease: entries.thoughtToRelease.trim() || undefined,
      });
      
      setTodayEntry(entry);
    } catch (error) {
      console.error("Failed to save journal entry:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateEntry = (key: string, value: string) => {
    setEntries(prev => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <Card className="bg-white/70 backdrop-blur-sm">
        <CardContent className="p-8">
          <div className="text-center text-gray-500">Loading your moment...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Short-form journaling to contextualize the day.
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {prompts.map((prompt) => {
              const Icon = prompt.icon;
              return (
                <div key={prompt.key} className="space-y-2">
                  <Label htmlFor={prompt.key} className="flex flex-col gap-1">
                    <span className="text-base font-medium">{prompt.label}</span>
                    <span className="text-sm text-gray-600 font-normal">{prompt.description}</span>
                  </Label>
                  <Textarea
                    id={prompt.key}
                    value={entries[prompt.key] || ""}
                    onChange={(e) => updateEntry(prompt.key, e.target.value)}
                    placeholder={prompt.placeholder}
                    rows={3}
                    className="bg-white/50 border-purple-200 focus:border-purple-400"
                  />
                </div>
              );
            })}
            
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              size="lg"
            >
              {isSubmitting ? "Saving your moment..." : todayEntry ? "Update Moment" : "Capture Moment"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
