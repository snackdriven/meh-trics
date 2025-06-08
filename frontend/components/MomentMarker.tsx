import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Filter, History, Plus, Search } from "lucide-react";
import { useState } from "react";
import { useJournalEntries } from "../hooks/useJournalEntries";
import { CreateJournalTemplateDialog } from "./CreateJournalTemplateDialog";
import { EditableCopy } from "./EditableCopy";
import { ErrorMessage } from "./ErrorMessage";
import { HistoryList } from "./HistoryList";
import { JournalForm } from "./JournalForm";
import { LoadingSpinner } from "./LoadingSpinner";

export function MomentMarker() {
  const [searchTerm, setSearchTerm] = useState("");
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);

  const {
    entryDate,
    setEntryDate,
    todayEntry,
    historicalEntries,
    submitJournalEntry,
    editEntry,
    deleteEntry,
    loadTodayEntry,
    loadHistoricalEntries,
    loadingToday,
    todayError,
    loadingHistory,
    historyError,
    submitting,
  } = useJournalEntries();

  const filteredHistoricalEntries = historicalEntries.filter((entry) => {
    const term = searchTerm.toLowerCase();
    const matchesText = entry.text.toLowerCase().includes(term);
    const matchesTags = entry.tags.some((t) => t.toLowerCase().includes(term));
    return term === "" || matchesText || matchesTags;
  });

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
              <JournalForm
                initialText={todayEntry?.text}
                initialTags={todayEntry?.tags || []}
                initialDate={entryDate}
                submitting={submitting}
                onSubmit={submitJournalEntry}
              />
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

              <HistoryList
                entries={filteredHistoricalEntries}
                loading={loadingHistory}
                onEdit={(entry) => {
                  const newText = window.prompt("Edit entry", entry.text);
                  if (newText === null) return;
                  const tagsStr = window.prompt(
                    "Edit tags (comma separated)",
                    entry.tags.join(", "),
                  );
                  if (tagsStr === null) return;
                  void editEntry(entry, newText, tagsStr);
                }}
                onDelete={(entry) => void deleteEntry(entry)}
              />
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
