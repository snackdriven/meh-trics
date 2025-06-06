import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditableCopy } from "./EditableCopy";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar, History, Filter, Edit, Trash2 } from "lucide-react";
import { LoadingSpinner } from "./LoadingSpinner";
import { ErrorMessage } from "./ErrorMessage";
import { EditMoodOptionsDialog } from "./EditMoodOptionsDialog";
import { useAsyncOperation } from "../hooks/useAsyncOperation";
import { useToast } from "../hooks/useToast";
import { useMoodOptions } from "../hooks/useMoodOptions";
import backend from "~backend/client";
import type { MoodEntry, MoodTier, JournalEntry } from "~backend/task/types";


export function PulseCheck() {
  const { moodOptions, tierInfo } = useMoodOptions();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedMoods, setSelectedMoods] = useState<{ emoji: string; label: string; tier: MoodTier }[]>([]);
  const [notes, setNotes] = useState("");
  const [todayEntry, setTodayEntry] = useState<MoodEntry | null>(null);
  const [historicalEntries, setHistoricalEntries] = useState<MoodEntry[]>([]);
  const [journalHistory, setJournalHistory] = useState<Record<string, JournalEntry[]>>({});
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
        const entry = response.entries.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0];
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
      
      const start = thirtyDaysAgo.toISOString().split('T')[0];
      const end = new Date().toISOString().split('T')[0];

      const [moodsRes, journalsRes] = await Promise.all([
        backend.task.listMoodEntries({ startDate: start, endDate: end }),
        backend.task.listJournalEntries({ startDate: start, endDate: end }),
      ]);

      setHistoricalEntries(moodsRes.entries);
      const map: Record<string, JournalEntry[]> = {};
      journalsRes.entries.forEach(e => {
        const d = e.date ? new Date(e.date).toISOString().split('T')[0] : '';
        if (!map[d]) map[d] = [];
        map[d].push(e);
      });
      setJournalHistory(map);
      return moodsRes.entries;
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

      let lastEntry: MoodEntry | null = null;
      for (const mood of selectedMoods) {
        lastEntry = await backend.task.createMoodEntry({
          date: new Date(today),
          tier: mood.tier,
          emoji: mood.emoji,
          label: mood.label,
          notes: notes.trim() || undefined,
        });
      }

      setTodayEntry(lastEntry);
      setSelectedMoods([]);
      setNotes("");

      // Reload historical entries to include the new ones
      await loadHistoricalEntries();

      return lastEntry;
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

  const handleEditJournalEntry = async (entry: JournalEntry) => {
    const text = window.prompt("Edit entry", entry.text);
    if (text === null) return;
    const tagsStr = window.prompt("Edit tags (comma separated)", entry.tags.join(', '));
    if (tagsStr === null) return;
    try {
      const updated = await backend.task.updateJournalEntry({
        id: entry.id,
        text: text.trim(),
        tags: tagsStr.split(',').map(t => t.trim()).filter(Boolean),
      });
      const dateKey = entry.date ? new Date(entry.date).toISOString().split('T')[0] : '';
      setJournalHistory(prev => ({
        ...prev,
        [dateKey]: prev[dateKey].map(e => e.id === updated.id ? updated : e),
      }));
      showSuccess('Entry updated');
    } catch (err) {
      console.error(err);
      showError('Failed to update entry', 'Update Error');
    }
  };

  const handleDeleteJournalEntry = async (entry: JournalEntry) => {
    try {
      await backend.task.deleteJournalEntry({ id: entry.id });
      const dateKey = entry.date ? new Date(entry.date).toISOString().split('T')[0] : '';
      setJournalHistory(prev => ({
        ...prev,
        [dateKey]: prev[dateKey].filter(e => e.id !== entry.id),
      }));
      showSuccess('Entry deleted');
    } catch (err) {
      console.error(err);
      showError('Failed to delete entry', 'Delete Error');
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
        <CardHeader className="flex items-center justify-between">
          <EditableCopy
            defaultText="Pick what fits. No overthinking — just notice and log."
            as={CardTitle}
            className="text-2xl"
          />
          <Button variant="ghost" size="icon" onClick={() => setIsEditOpen(true)}>
            <Edit className="h-4 w-4" />
          </Button>
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
                      <div
                        key={tier}
                        className="p-4 rounded-xl border-2"
                        style={{ backgroundColor: tierData.color, borderColor: tierData.color }}
                      >
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
                  {Object.entries(tierInfo).map(([tier]) => (
                    <Button
                      key={tier}
                      variant={filterTier === tier ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterTier(tier as MoodTier)}
                      style={
                        filterTier === tier
                          ? { backgroundColor: tierInfo[tier as MoodTier].color, borderColor: tierInfo[tier as MoodTier].color }
                          : undefined
                      }
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
                  filteredHistoricalEntries.map((entry) => {
                    const dateKey = new Date(entry.date).toISOString().split('T')[0];
                    const journals = journalHistory[dateKey] || [];
                    return (
                      <Card key={entry.id} className="p-4 bg-white/50 space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{entry.emoji}</span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{entry.label}</span>
                                <Badge
                                  variant="outline"
                                  style={{
                                    backgroundColor: tierInfo[entry.tier as MoodTier].color,
                                    borderColor: tierInfo[entry.tier as MoodTier].color,
                                  }}
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
                            {new Date(entry.createdAt).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        {journals.length > 0 && (
                          <div className="space-y-2 border-l pl-4">
                            {journals.map(j => (
                              <div key={j.id} className="flex justify-between">
                                <div className="flex-1">
                                  <p className="text-sm whitespace-pre-line">{j.text}</p>
                                  {j.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {j.tags.map(tag => (
                                        <Badge key={tag} variant="outline" className="text-xs">
                                          {tag}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                  <span className="text-xs text-gray-500">
                                    {new Date(j.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                  <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" onClick={() => handleEditJournalEntry(j)}>
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteJournalEntry(j)}>
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </Card>
                    );
                  })
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      <EditMoodOptionsDialog open={isEditOpen} onOpenChange={setIsEditOpen} />
    </div>
  );
}
