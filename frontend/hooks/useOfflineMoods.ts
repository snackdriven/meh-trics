import backend from "~backend/client";
import type { CreateMoodEntryRequest, MoodEntry } from "~backend/mood/types";
import { createOfflineQueue } from "./useOfflineQueue";

interface MoodQueueItem {
  type: "create";
  data: CreateMoodEntryRequest;
}

const useMoodQueue = createOfflineQueue<MoodQueueItem>("offlineMoods", async (item) => {
  if (item.type === "create") {
    await backend.mood.createMoodEntry(item.data);
  }
});

export function useOfflineMoods() {
  const { enqueue, pending, syncing, syncQueue } = useMoodQueue();

  const createEntry = async (data: CreateMoodEntryRequest): Promise<MoodEntry | undefined> => {
    if (navigator.onLine) {
      try {
        const entry = await backend.mood.createMoodEntry(data);
        return entry;
      } catch {
        // fall back to queue
      }
    }
    await enqueue({ type: "create", data });
    return undefined;
  };

  return { createEntry, pending, syncing, syncQueue };
}
