import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { defaultTierInfo } from "@/constants/moods";
import {
  Calendar,
  Edit,
  Filter,
  History,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import backend from "~backend/client";
import type { JournalEntry, MoodEntry, MoodTier } from "~backend/task/types";
import { useAsyncOperation } from "../hooks/useAsyncOperation";
import { useMoodOptions } from "../hooks/useMoodOptions";
import { useOfflineMoods } from "../hooks/useOfflineMoods";
import { useToast } from "../hooks/useToast";
import { EditMoodOptionsDialog } from "./EditMoodOptionsDialog";
import { EditableCopy } from "./EditableCopy";
import { ErrorMessage } from "./ErrorMessage";
import { LoadingSpinner } from "./LoadingSpinner";

export function PulseCheck() {
  const { moodOptions } = useMoodOptions();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedMoods, setSelectedMoods] = useState<
    { emoji: string; label: string; tier: MoodTier }[]
  >([]);
  const [notes, setNotes] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [todayEntry, setTodayEntry] = useState<MoodEntry | null>(null);
  const [historicalEntries, setHistoricalEntries] = useState<MoodEntry[]>([]);
  const [journalHistory, setJournalHistory] = useState<
    Record<string, JournalEntry[]>
  >({});
  const [filterTier, setFilterTier] = useState<MoodTier | "">("");
  const [selectedEntryIds, setSelectedEntryIds] = useState<number[]>([]);

  const {
    createEntry: createOfflineMood,
    pending,
    syncing,
    syncQueue,
  } = useOfflineMoods();

  const moodMap = useMemo(() => {
    const map: Record<number, MoodEntry> = {};
    if (todayEntry) {
      map[todayEntry.id] = todayEntry;
    }
    // biome-ignore lint/complexity/noForEach: small array
    historicalEntries.forEach((m) => {
      map[m.id] = m;
    });
    return map;
  }, [historicalEntries, todayEntry]);

  const { showSuccess, showError } = useToast();
  const today = new Date().toISOString().split("T")[0];

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
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )[0];
        setTodayEntry(entry);
        setSelectedMoods([
          { emoji: entry.emoji, label: entry.label, tier: entry.tier },
        ]);
        setNotes(entry.notes || "");
        setTagInput(entry.tags ? entry.tags.join(", ") : "");
        return entry;
      }
      return null;
    },
    undefined,
    (error) => showError("Failed to load today's mood entry", "Loading Error"),
  );

  const {
    loading: loadingHistory,
    error: historyError,
    execute: loadHistoricalEntries,
  } = useAsyncOperation(
    async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const start = thirtyDaysAgo.toISOString().split("T")[0];
      const end = new Date().toISOString().split("T")[0];

      const [moodsRes, journalsRes] = await Promise.all([
        backend.task.listMoodEntries({ startDate: start, endDate: end }),
        backend.task.listJournalEntries({ startDate: start, endDate: end }),
      ]);

      setHistoricalEntries(moodsRes.entries);
      const map: Record<string, JournalEntry[]> = {};
      // biome-ignore lint/complexity/noForEach: small array
      journalsRes.entries.forEach((e) => {
        const d = e.date ? new Date(e.date).toISOString().split("T")[0] : "";
        if (!map[d]) map[d] = [];
        map[d].push(e);
      });
      setJournalHistory(map);
      return moodsRes.entries;
    },
    undefined,
    (error) => showError("Failed to load mood history", "Loading Error"),
  );

  const { loading: submitting, execute: submitMoodEntry } = useAsyncOperation(
    async () => {
      if (selectedMoods.length === 0) {
        throw new Error("Please select at least one mood");
      }

      let lastEntry: MoodEntry | null = null;
      for (const mood of selectedMoods) {
        const entry = await createOfflineMood({
          date: new Date(today),
          tier: mood.tier,
          emoji: mood.emoji,
          label: mood.label,
          tags: tagInput
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          notes: notes.trim() || undefined,
        });
        if (entry) lastEntry = entry;
      }

      if (lastEntry) {
        setTodayEntry(null);
        setHistoricalEntries([]);
      }
      setSelectedMoods([]);
      setNotes("");
      setTagInput("");

      return lastEntry;
    },
    () =>
      showSuccess(
        navigator.onLine
          ? "Mood captured successfully! 💜"
          : "Mood queued for sync",
      ),
    (error) => showError(error, "Save Failed"),
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: run once on mount
  useEffect(() => {
    loadTodayEntry();
    loadHistoricalEntries();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitMoodEntry();
  };

  const toggleMood = (
    tier: MoodTier,
    mood: { emoji: string; label: string },
  ) => {
    const moodWithTier = { ...mood, tier };
    const isSelected = selectedMoods.some((m) => m.label === mood.label);

    if (isSelected) {
      setSelectedMoods((prev) => prev.filter((m) => m.label !== mood.label));
    } else if (selectedMoods.length < 2) {
      setSelectedMoods((prev) => [...prev, moodWithTier]);
    }
  };

  const handleEditJournalEntry = async (entry: JournalEntry) => {
    const text = window.prompt("Edit entry", entry.text);
    if (text === null) return;
    const tagsStr = window.prompt(
      "Edit tags (comma separated)",
      entry.tags.join(", "),
    );
    if (tagsStr === null) return;
    const moodStr = window.prompt(
      "Link mood id (blank for none)",
      entry.moodId ? String(entry.moodId) : "",
    );
    if (moodStr === null) return;
    try {
      const updated = await backend.task.updateJournalEntry({
        id: entry.id,
        text: text.trim(),
        tags: tagsStr
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        moodId: moodStr ? Number.parseInt(moodStr) : undefined,
      });
      const dateKey = entry.date
        ? new Date(entry.date).toISOString().split("T")[0]
        : "";
      setJournalHistory((prev) => ({
        ...prev,
        [dateKey]: prev[dateKey].map((e) =>
          e.id === updated.id ? updated : e,
        ),
      }));
      showSuccess("Entry updated");
    } catch (err) {
      console.error(err);
      showError("Failed to update entry", "Update Error");
    }
  };

  const handleDeleteJournalEntry = async (entry: JournalEntry) => {
    try {
      await backend.task.deleteJournalEntry({ id: entry.id });
      const dateKey = entry.date
        ? new Date(entry.date).toISOString().split("T")[0]
        : "";
      setJournalHistory((prev) => ({
        ...prev,
        [dateKey]: prev[dateKey].filter((e) => e.id !== entry.id),
      }));
      showSuccess("Entry deleted");
    } catch (err) {
      console.error(err);
      showError("Failed to delete entry", "Delete Error");
    }
  };

  const handleSelectEntry = (id: number, selected: boolean) => {
    setSelectedEntryIds((prev) =>
      selected ? [...prev, id] : prev.filter((eId) => eId !== id),
    );
  };

  const clearSelection = () => setSelectedEntryIds([]);

  const handleBulkDelete = async () => {
    for (const id of selectedEntryIds) {
      try {
        await backend.task.deleteMoodEntry({ id });
      } catch (err) {
        console.error(err);
        showError("Failed to delete entry", "Delete Error");
      }
    }
    setHistoricalEntries((prev) =>
      prev.filter((e) => !selectedEntryIds.includes(e.id)),
    );
    showSuccess("Entries deleted");
    clearSelection();
  };

  const handleDeleteEntry = async (id: number) => {
    try {
      await backend.task.deleteMoodEntry({ id });
      setHistoricalEntries((prev) => prev.filter((e) => e.id !== id));
      showSuccess("Entry deleted");
    } catch (err) {
      console.error(err);
      showError("Failed to delete entry", "Delete Error");
    }
  };

  const filteredHistoricalEntries = filterTier
    ? historicalEntries.filter((entry) => entry.tier === filterTier)
    : historicalEntries;

  if (loadingToday || loadingHistory) {
    return (
      <Card className="">
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
      <Card className="">
        <CardHeader className="flex items-center justify-between">
          <EditableCopy
            defaultText="Pick what fits. No overthinking — just notice and log."
            as={CardTitle}
            className="text-2xl"
          />
          <div className="flex items-center gap-2">
            {(pending > 0 || syncing) && (
              <>
                <Badge
                  variant="outline"
                  className="text-xs flex items-center gap-1"
                >
                  {syncing && <LoadingSpinner size="sm" className="mr-1" />}
                  {syncing ? "Syncing..." : `${pending} pending`}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={syncQueue}
                  disabled={syncing}
                  title="Sync now"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditOpen(true)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
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
                <ErrorMessage message={todayError} onRetry={loadTodayEntry} />
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  {Object.entries(moodOptions).map(([tier, options]) => {
                    const tierData = defaultTierInfo[tier as MoodTier];
                    return (
                      <div key={tier} className="p-4 rounded-xl border-2">
                        <div className="mb-3">
                          <h3 className="font-medium text-lg">
                            {tierData.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {tierData.subtitle}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            (Select up to 2 from any category):
                          </p>
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                          {options.map((option) => {
                            const isSelected = selectedMoods.some(
                              (m) => m.label === option.label,
                            );
                            const isDisabled =
                              selectedMoods.length >= 2 && !isSelected;

                            return (
                              <Button
                                key={option.label}
                                type="button"
                                variant={isSelected ? "default" : "outline"}
                                className={`flex flex-col items-center gap-1 h-auto py-2 px-1 text-xs ${
                                  isSelected
                                    ? "bg-purple-600 hover:bg-purple-700"
                                    : isDisabled
                                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                      : "bg-white/50 hover:bg-white/80"
                                }`}
                                onClick={() =>
                                  !isDisabled &&
                                  toggleMood(tier as MoodTier, option)
                                }
                                disabled={isDisabled}
                              >
                                <span className="text-lg">{option.emoji}</span>
                                <span className="leading-tight text-center">
                                  {option.label}
                                </span>
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

                <div>
                  <Label htmlFor="tags" className="text-base">
                    Tags
                  </Label>
                  <Input
                    id="tags"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="comma separated tags"
                    className="mt-2"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={selectedMoods.length === 0 || submitting}
                  className="w-full bg-[color:var(--color-primary)] hover:bg-[color:var(--color-primary)]/90 text-white"
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
                {(pending > 0 || syncing) && (
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-2">
                    {syncing && <LoadingSpinner size="sm" className="mr-1" />}
                    {syncing
                      ? "Syncing queued entries..."
                      : `${pending} entry${pending === 1 ? "" : "ies"} pending`}
                  </p>
                )}
              </form>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              {selectedEntryIds.length > 0 && (
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {selectedEntryIds.length} selected
                  </span>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleBulkDelete}
                  >
                    Delete
                  </Button>
                  <Button size="sm" variant="outline" onClick={clearSelection}>
                    Clear
                  </Button>
                </div>
              )}
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
                  {Object.entries(defaultTierInfo).map(([tier]) => (
                    <Button
                      key={tier}
                      variant={filterTier === tier ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterTier(tier as MoodTier)}
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
                    const dateKey = new Date(entry.date)
                      .toISOString()
                      .split("T")[0];
                    const journals = journalHistory[dateKey] || [];
                    return (
                      <Card
                        key={entry.id}
                        className="p-4 bg-white/50 space-y-2"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={selectedEntryIds.includes(entry.id)}
                              onCheckedChange={(checked) =>
                                handleSelectEntry(entry.id, !!checked)
                              }
                              className="mt-1"
                            />
                            <span className="text-2xl">{entry.emoji}</span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {entry.label}
                                </span>
                                <Badge variant="outline">{entry.tier}</Badge>
                              </div>
                              {entry.notes && (
                                <p className="text-sm text-gray-600 mt-1">
                                  {entry.notes}
                                </p>
                              )}
                              {entry.tags && entry.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {entry.tags.map((tag) => (
                                    <Badge
                                      key={tag}
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">
                              {new Date(entry.createdAt).toLocaleString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteEntry(entry.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        {journals.length > 0 && (
                          <div className="space-y-2 border-l pl-4">
                            {journals.map((j) => (
                              <div key={j.id} className="flex justify-between">
                                <div className="flex-1">
                                  <p className="text-sm whitespace-pre-line">
                                    {j.text}
                                  </p>
                                  {j.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {j.tags.map((tag) => (
                                        <Badge
                                          key={tag}
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          {tag}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                  {j.moodId && moodMap[j.moodId] && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        window.location.hash = "pulse";
                                      }}
                                      className="mt-1"
                                      title="View mood"
                                    >
                                      <span className="text-xl">
                                        {moodMap[j.moodId].emoji}
                                      </span>
                                    </button>
                                  )}
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                  <span className="text-xs text-gray-500">
                                    {new Date(j.createdAt).toLocaleTimeString(
                                      "en-US",
                                      { hour: "2-digit", minute: "2-digit" },
                                    )}
                                  </span>
                                  <div className="flex gap-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleEditJournalEntry(j)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() =>
                                        handleDeleteJournalEntry(j)
                                      }
                                    >
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
