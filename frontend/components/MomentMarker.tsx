import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Calendar, History, Search, Filter } from "lucide-react";
import { LoadingSpinner } from "./LoadingSpinner";
import { ErrorMessage } from "./ErrorMessage";
import { useAsyncOperation } from "../hooks/useAsyncOperation";
import { useToast } from "../hooks/useToast";
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
    icon: Calendar,
    placeholder: "Rest? Connection? A snack? Permission to feel?",
  },
  {
    key: "smallWin",
    label: "💡 What's one small win?",
    description: "A tiny success, effort you showed up for, or a moment that mattered — even if no one else noticed",
    icon: Calendar,
    placeholder: "Got out of bed? Sent that text? Survived the meeting?",
  },
  {
    key: "whatFeltHard",
    label: "☁️ What felt hard?",
    description: "No shame. Just surfacing the weight so you're not carrying it invisibly",
    icon: Calendar,
    placeholder: "It's okay to name the difficult stuff...",
  },
  {
    key: "thoughtToRelease",
    label: "🍃 Any thought I want to release:",
    description: "Emotional declutter — like hitting \"clear cache\" for the brain.",
    icon: Calendar,
    placeholder: "Let it go, let it flow...",
  },
];

export function MomentMarker() {
  const [entries, setEntries] = useState<Record<string, string>>({
    whatHappened: "",
    whatINeed: "",
    smallWin: "",
    whatFeltHard: "",
    thoughtToRelease: "",
  });
  const [todayEntry, setTodayEntry] = useState<JournalEntry | null>(null);
  const [historicalEntries, setHistoricalEntries] = useState<JournalEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPromptFilter, setSelectedPromptFilter] = useState<string>("");

  const { showSuccess, showError } = useToast();
  const today = new Date().toISOString().split('T')[0];

  const {
    loading: loadingToday,
    error: todayError,
    execute: loadTodayEntry,
  } = useAsyncOperation(
    async () => {
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
        return entry;
      } catch (error) {
        // Entry doesn't exist yet, that's fine
        setTodayEntry(null);
        setEntries({
          whatHappened: "",
          whatINeed: "",
          smallWin: "",
          whatFeltHard: "",
          thoughtToRelease: "",
        });
        return null;
      }
    },
    undefined,
    (error) => {
      // Don't show error for missing journal entry
      if (!error.includes("not found")) {
        showError("Failed to load today's journal entry", "Loading Error");
      }
    }
  );

  const {
    loading: loadingHistory,
    error: historyError,
    execute: loadHistoricalEntries,
  } = useAsyncOperation(
    async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const response = await backend.task.listJournalEntries({
        startDate: thirtyDaysAgo.toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        limit: 50,
      });
      
      setHistoricalEntries(response.entries);
      return response.entries;
    },
    undefined,
    (error) => showError("Failed to load journal history", "Loading Error")
  );

  const {
    loading: submitting,
    execute: submitJournalEntry,
  } = useAsyncOperation(
    async () => {
      const hasContent = Object.values(entries).some(value => value.trim());
      if (!hasContent) {
        throw new Error("Please write something in at least one field");
      }

      const entry = await backend.task.createJournalEntry({
        date: new Date(today),
        whatHappened: entries.whatHappened.trim() || undefined,
        whatINeed: entries.whatINeed.trim() || undefined,
        smallWin: entries.smallWin.trim() || undefined,
        whatFeltHard: entries.whatFeltHard.trim() || undefined,
        thoughtToRelease: entries.thoughtToRelease.trim() || undefined,
      });
      
      setTodayEntry(entry);
      
      // Update historical entries optimistically
      setHistoricalEntries(prev => {
        const filtered = prev.filter(e => new Date(e.date).toISOString().split('T')[0] !== today);
        return [entry, ...filtered];
      });
      
      return entry;
    },
    () => showSuccess("Moment captured successfully! ✨"),
    (error) => showError(error, "Save Failed")
  );

  useEffect(() => {
    loadTodayEntry();
  }, []);

  useEffect(() => {
    loadHistoricalEntries();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitJournalEntry();
  };

  const updateEntry = (key: string, value: string) => {
    setEntries(prev => ({ ...prev, [key]: value }));
  };

  const filteredHistoricalEntries = historicalEntries.filter(entry => {
    const matchesSearch = searchTerm === "" || 
      Object.values(entry).some(value => 
        value && typeof value === 'string' && 
        value.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    const matchesPromptFilter = selectedPromptFilter === "" ||
      (selectedPromptFilter === "whatHappened" && entry.whatHappened) ||
      (selectedPromptFilter === "whatINeed" && entry.whatINeed) ||
      (selectedPromptFilter === "smallWin" && entry.smallWin) ||
      (selectedPromptFilter === "whatFeltHard" && entry.whatFeltHard) ||
      (selectedPromptFilter === "thoughtToRelease" && entry.thoughtToRelease);
    
    return matchesSearch && matchesPromptFilter;
  });

  const getEntryTags = (entry: JournalEntry) => {
    const tags: string[] = [];
    if (entry.whatHappened) tags.push("happened");
    if (entry.whatINeed) tags.push("need");
    if (entry.smallWin) tags.push("win");
    if (entry.whatFeltHard) tags.push("hard");
    if (entry.thoughtToRelease) tags.push("release");
    return tags;
  };

  if (loadingToday) {
    return (
      <Card className="bg-white/70 backdrop-blur-sm">
        <CardContent className="p-8">
          <div className="flex items-center justify-center gap-2 text-gray-500">
            <LoadingSpinner />
            Loading your moment...
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
            Short-form journaling to contextualize the day.
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="today" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="today" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Today's Moment
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
                {prompts.map((prompt) => (
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
                ))}
                
                <Button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  size="lg"
                >
                  {submitting ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Saving your moment...
                    </>
                  ) : (
                    "Capture Moment"
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

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search your moments..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-white/50"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <span className="text-sm font-medium">Filter:</span>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant={selectedPromptFilter === "" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedPromptFilter("")}
                  >
                    All
                  </Button>
                  {prompts.map((prompt) => (
                    <Button
                      key={prompt.key}
                      variant={selectedPromptFilter === prompt.key ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedPromptFilter(prompt.key)}
                      className={selectedPromptFilter === prompt.key ? "bg-purple-600 hover:bg-purple-700" : ""}
                    >
                      {prompt.label.split(' ')[0]} {/* Show just the emoji */}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {loadingHistory ? (
                  <div className="flex items-center justify-center gap-2 text-gray-500 py-8">
                    <LoadingSpinner />
                    Loading history...
                  </div>
                ) : filteredHistoricalEntries.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No journal entries found for the selected filter.</p>
                  </div>
                ) : (
                  filteredHistoricalEntries.map((entry) => (
                    <Card key={entry.id} className="p-4 bg-white/50">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex gap-2">
                            {getEntryTags(entry).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(entry.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>

                        <div className="space-y-2">
                          {entry.whatHappened && (
                            <div>
                              <span className="text-sm font-medium text-gray-700">🗓 What happened:</span>
                              <p className="text-sm text-gray-600 mt-1">{entry.whatHappened}</p>
                            </div>
                          )}
                          {entry.whatINeed && (
                            <div>
                              <span className="text-sm font-medium text-gray-700">🧃 What I need:</span>
                              <p className="text-sm text-gray-600 mt-1">{entry.whatINeed}</p>
                            </div>
                          )}
                          {entry.smallWin && (
                            <div>
                              <span className="text-sm font-medium text-gray-700">💡 Small win:</span>
                              <p className="text-sm text-gray-600 mt-1">{entry.smallWin}</p>
                            </div>
                          )}
                          {entry.whatFeltHard && (
                            <div>
                              <span className="text-sm font-medium text-gray-700">☁️ What felt hard:</span>
                              <p className="text-sm text-gray-600 mt-1">{entry.whatFeltHard}</p>
                            </div>
                          )}
                          {entry.thoughtToRelease && (
                            <div>
                              <span className="text-sm font-medium text-gray-700">🍃 Thought to release:</span>
                              <p className="text-sm text-gray-600 mt-1">{entry.thoughtToRelease}</p>
                            </div>
                          )}
                        </div>
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
