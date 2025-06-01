import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar, History, Filter } from "lucide-react";
import { LoadingSpinner } from "./LoadingSpinner";
import { ErrorMessage } from "./ErrorMessage";
import { useAsyncOperation } from "../hooks/useAsyncOperation";
import { useToast } from "../hooks/useToast";
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
  const [selectedMoods, setSelectedMoods] = useState<{ emoji: string; label: string; tier: MoodTier }[]>([]);
  const [notes, setNotes] = useState("");
  const [todayEntry, setTodayEntry] = useState<MoodEntry | null>(null);
  const [historicalEntries, setHistoricalEntries] = useState<MoodEntry[]>([]);
  const [filterTier, setFilterTier] = useState<MoodTier | "">("");

  const { showSuccess, showError } = useToast();
  const today = new Date().toISOString().split('T')[0];

  const {
    loading: loadingToday,
    error: todayError,
    execute: loadTodayEntry,
  } = useAsyncOperation(
    async () => {
      const response = await backend.task.listMoodEntries({
        startDate: today,
        endDate: today,
      });
      
      if (response.entries.length > 0) {
        const entry = response.entries[0];
        setTodayEntry(entry);
        setSelectedMoods([{ emoji: entry.emoji, label: entry.label, tier: entry.tier }]);
        setNotes(entry.notes || "");
        return entry;
      }
      return null;
    },
    undefined,
    (error) => showError("Failed to load today's mood entry", "Loading Error")
  );

  const {
    loading: loadingHistory,
    error: historyError,
    execute: loadHistoricalEntries,
  } = useAsyncOperation(
    async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const response = await backend.task.listMoodEntries({
        startDate: thirtyDaysAgo.toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
      });
      
      setHistoricalEntries(response.entries);
      return response.entries;
    },
    undefined,
    (error) => showError("Failed to load mood history", "Loading Error")
  );

  const {
    loading: submitting,
    execute: submitMoodEntry,
  } = useAsyncOperation(
    async () => {
      if (selectedMoods.length === 0) {
        throw new Error("Please select at least one mood");
      }

      const primaryMood = selectedMoods[0];
      const entry = await backend.task.createMoodEntry({
        date: new Date(today),
        tier: primaryMood.tier,
        emoji: primaryMood.emoji,
        label: primaryMood.label,
        notes: notes.trim() || undefined,
      });
      
      setTodayEntry(entry);
      setSelectedMoods([]);
      setNotes("");
      
      // Reload historical entries to include the new one
      await loadHistoricalEntries();
      
      return entry;
    },
    () => showSuccess("Mood captured successfully! 💜"),
    (error) => showError(error, "Save Failed")
  );

  useEffect(() => {
    loadTodayEntry();
    loadHistoricalEntries();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitMoodEntry();
  };

  const toggleMood = (tier: MoodTier, mood: { emoji: string; label: string }) => {
    const moodWithTier = { ...mood, tier };
    const isSelected = selectedMoods.some(m => m.emoji === mood.emoji);
    
    if (isSelected) {
      setSelectedMoods(prev => prev.filter(m => m.emoji !== mood.emoji));
    } else if (selectedMoods.length < 2) {
      setSelectedMoods(prev => [...prev, moodWithTier]);
    }
  };

  const filteredHistoricalEntries = filterTier 
    ? historicalEntries.filter(entry => entry.tier === filterTier)
    : historicalEntries;

  if (loadingToday || loadingHistory) {
    return (
      <Card className="bg-white/70 backdrop-blur-sm">
        <CardContent className="p-8">
          <div className="flex items-center justify-center gap-2 text-gray-500">
            <LoadingSpinner />
            Loading your pulse...
          </div>
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
          <Tabs defaultValue="today" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="today" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Today's Pulse
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="today" className="space-y-6">
              {todayError && (
                <ErrorMessage 
                  message={todayError} 
                  onRetry={loadTodayEntry}
                />
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  {Object.entries(moodOptions).map(([tier, options]) => {
                    const tierData = tierInfo[tier as MoodTier];
                    return (
                      <div key={tier} className={`p-4 rounded-xl border-2 ${tierData.color}`}>
                        <div className="mb-3">
                          <h3 className="font-medium text-lg">{tierData.title}</h3>
                          <p className="text-sm text-gray-600">{tierData.subtitle}</p>
                          <p className="text-xs text-gray-500 mt-1">(Select up to 2 from any category):</p>
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                          {options.map((option) => {
                            const isSelected = selectedMoods.some(m => m.emoji === option.emoji);
                            const isDisabled = selectedMoods.length >= 2 && !isSelected;
                            
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
                  disabled={selectedMoods.length === 0 || submitting}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  size="lg"
                >
                  {submitting ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Saving your pulse...
                    </>
                  ) : (
                    "Capture Pulse"
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              {historyError && (
                <ErrorMessage 
                  message={historyError} 
                  onRetry={loadHistoricalEntries}
                />
              )}

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <span className="text-sm font-medium">Filter by tier:</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={filterTier === "" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterTier("")}
                  >
                    All
                  </Button>
                  {Object.entries(tierInfo).map(([tier, info]) => (
                    <Button
                      key={tier}
                      variant={filterTier === tier ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterTier(tier as MoodTier)}
                      className={filterTier === tier ? "bg-purple-600 hover:bg-purple-700" : ""}
                    >
                      {tier}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {filteredHistoricalEntries.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No mood entries found for the selected filter.</p>
                  </div>
                ) : (
                  filteredHistoricalEntries.map((entry) => (
                    <Card key={entry.id} className="p-4 bg-white/50">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{entry.emoji}</span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{entry.label}</span>
                              <Badge 
                                variant="outline" 
                                className={
                                  entry.tier === "uplifted" 
                                    ? "bg-green-50 text-green-700 border-green-200"
                                    : entry.tier === "neutral"
                                      ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                      : "bg-red-50 text-red-700 border-red-200"
                                }
                              >
                                {entry.tier}
                              </Badge>
                            </div>
                            {entry.notes && (
                              <p className="text-sm text-gray-600 mt-1">{entry.notes}</p>
                            )}
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(entry.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
