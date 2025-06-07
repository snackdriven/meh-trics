import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Filter, History, Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import backend from "~backend/client";
import type { JournalEntry } from "~backend/task/types";
import { useAsyncOperation } from "../hooks/useAsyncOperation";
import { useToast } from "../hooks/useToast";
import { CreateJournalTemplateDialog } from "./CreateJournalTemplateDialog";
import { EditableCopy } from "./EditableCopy";
import { ErrorMessage } from "./ErrorMessage";
import { LoadingSpinner } from "./LoadingSpinner";

export function MomentMarker() {
  const [text, setText] = useState("");
  const [tags, setTags] = useState("");
  const today = new Date().toISOString().split("T")[0];
  const [entryDate, setEntryDate] = useState(today);
  const [todayEntry, setTodayEntry] = useState<JournalEntry | null>(null);
  const [historicalEntries, setHistoricalEntries] = useState<JournalEntry[]>(
    [],
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);

  const { showSuccess, showError } = useToast();

  const {
    loading: loadingToday,
    error: todayError,
    execute: loadTodayEntry,
  } = useAsyncOperation(
    async () => {
      try {
        const entry = await backend.task.getJournalEntry({ date: today });
        setTodayEntry(entry);
        setText(entry.text);
        setTags(entry.tags.join(", "));
        return entry;
      } catch (error) {
        // Entry doesn't exist yet, that's fine
        setTodayEntry(null);
        setText("");
        setTags("");
        return null;
      }
    },
    undefined,
    (error) => {
      // Don't show error for missing journal entry
      if (!error.includes("not found")) {
        showError("Failed to load today's journal entry", "Loading Error");
      }
    },
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
        startDate: thirtyDaysAgo.toISOString().split("T")[0],
        endDate: new Date().toISOString().split("T")[0],
        limit: 50,
      });

      setHistoricalEntries(response.entries);
      return response.entries;
    },
    undefined,
    (error) => showError("Failed to load journal history", "Loading Error"),
  );

  const { loading: submitting, execute: submitJournalEntry } =
    useAsyncOperation(
      async () => {
        if (!text.trim()) {
          throw new Error("Please write something to capture your moment");
        }

        const entry = await backend.task.createJournalEntry({
          date: entryDate ? new Date(entryDate) : undefined,
          text: text.trim(),
          tags: tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        });

        setTodayEntry(entry);

        // Update historical entries optimistically
        setHistoricalEntries((prev) => {
          const filtered = prev.filter(
            (e) =>
              new Date(e.date).toISOString().split("T")[0] !==
              (entryDate || today),
          );
          return [entry, ...filtered];
        });

        return entry;
      },
      () => showSuccess("Moment captured successfully! ✨"),
      (error) => showError(error, "Save Failed"),
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

  const filteredHistoricalEntries = historicalEntries.filter((entry) => {
    const term = searchTerm.toLowerCase();
    const matchesText = entry.text.toLowerCase().includes(term);
    const matchesTags = entry.tags.some((t) => t.toLowerCase().includes(term));
    return term === "" || matchesText || matchesTags;
  });

  const getEntryTags = (entry: JournalEntry) => entry.tags;

  if (loadingToday) {
    return (
      <Card className="">
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
      <Card className="">
        <CardHeader className="flex items-center justify-between">
          <EditableCopy
            defaultText="Short-form journaling to contextualize the day."
            as={CardTitle}
            className="text-2xl"
          />
          <Button
            onClick={() => setTemplateDialogOpen(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Template
          </Button>
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
                <ErrorMessage message={todayError} onRetry={loadTodayEntry} />
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="momentText" className="flex flex-col gap-1">
                    <span className="text-base font-medium">Journal Entry</span>
                  </Label>
                  <Textarea
                    id="momentText"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={4}
                    className="bg-white/50 border-purple-200 focus:border-purple-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="momentDate" className="flex flex-col gap-1">
                    <span className="text-base font-medium">
                      Date (optional)
                    </span>
                  </Label>
                  <Input
                    id="momentDate"
                    type="date"
                    value={entryDate}
                    onChange={(e) => setEntryDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="momentTags" className="flex flex-col gap-1">
                    <span className="text-base font-medium">
                      Tags (comma separated)
                    </span>
                  </Label>
                  <Input
                    id="momentTags"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                  />
                </div>

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
                    <span className="text-sm font-medium">Search:</span>
                  </div>
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
                    <p>No journal entries found.</p>
                  </div>
                ) : (
                  filteredHistoricalEntries.map((entry) => (
                    <Card key={entry.id} className="p-4 bg-white/50">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex gap-2">
                            {getEntryTags(entry).map((tag) => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className="text-xs bg-purple-50 text-purple-700 border-purple-200"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(entry.date).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>

                        <div className="prose prose-sm max-w-none text-gray-700">
                          <ReactMarkdown>{entry.text}</ReactMarkdown>
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
      <CreateJournalTemplateDialog
        open={templateDialogOpen}
        onOpenChange={setTemplateDialogOpen}
      />
    </div>
  );
}
