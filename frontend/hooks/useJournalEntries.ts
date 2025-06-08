import { useEffect, useState } from "react";
import backend from "~backend/client";
import type { JournalEntry } from "~backend/task/types";
import { useAsyncOperation } from "./useAsyncOperation";
import { useToast } from "./useToast";

export function useJournalEntries() {
  const [todayEntry, setTodayEntry] = useState<JournalEntry | null>(null);
  const [historicalEntries, setHistoricalEntries] = useState<JournalEntry[]>(
    [],
  );
  const [entryDate, setEntryDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const { showSuccess, showError } = useToast();
  const today = new Date().toISOString().split("T")[0];

  const {
    loading: loadingToday,
    error: todayError,
    execute: loadTodayEntry,
  } = useAsyncOperation(
    async () => {
      try {
        const entry = await backend.task.getJournalEntry({ date: today });
        setTodayEntry(entry);
        setEntryDate(entry.date ?? today);
        return entry;
      } catch {
        setTodayEntry(null);
        setEntryDate(today);
        return null;
      }
    },
    undefined,
    (err) => {
      if (!err.includes("not found")) {
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
      const resp = await backend.task.listJournalEntries({
        startDate: thirtyDaysAgo.toISOString().split("T")[0],
        endDate: new Date().toISOString().split("T")[0],
        limit: 50,
      });
      setHistoricalEntries(resp.entries);
      return resp.entries;
    },
    undefined,
    () => showError("Failed to load journal history", "Loading Error"),
  );

  const { loading: submitting, execute: submitJournalEntry } =
    useAsyncOperation(
      async (data: { text: string; tags: string[]; date?: string }) => {
        if (!data.text.trim()) {
          throw new Error("Please write something to capture your moment");
        }
        const entry = await backend.task.createJournalEntry({
          date: data.date ? new Date(data.date) : undefined,
          text: data.text.trim(),
          tags: data.tags,
        });
        setTodayEntry(entry);
        setHistoricalEntries((prev) => {
          const filtered = prev.filter(
            (e) =>
              new Date(e.date).toISOString().split("T")[0] !==
              (data.date || today),
          );
          return [entry, ...filtered];
        });
        return entry;
      },
      () => showSuccess("Moment captured successfully! ✨"),
      (err) => showError(err, "Save Failed"),
    );

  const editEntry = async (
    entry: JournalEntry,
    text: string,
    tagsStr: string,
  ) => {
    const updated = await backend.task.updateJournalEntry({
      id: entry.id,
      text: text.trim(),
      tags: tagsStr
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    });
    setHistoricalEntries((prev) =>
      prev.map((e) => (e.id === updated.id ? updated : e)),
    );
    showSuccess("Entry updated");
  };

  const deleteEntry = async (entry: JournalEntry) => {
    await backend.task.deleteJournalEntry({ id: entry.id });
    setHistoricalEntries((prev) => prev.filter((e) => e.id !== entry.id));
    showSuccess("Entry deleted");
  };

  useEffect(() => {
    loadTodayEntry();
    loadHistoricalEntries();
  }, []);

  return {
    entryDate,
    setEntryDate,
    todayEntry,
    historicalEntries,
    loadTodayEntry,
    loadHistoricalEntries,
    submitJournalEntry,
    editEntry,
    deleteEntry,
    loadingToday,
    todayError,
    loadingHistory,
    historyError,
    submitting,
  };
}
