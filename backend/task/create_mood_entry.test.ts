import { beforeEach, describe, expect, it, vi } from "vitest";

// biome-ignore lint/suspicious/noExplicitAny: test helper
vi.mock("encore.dev/api", () => ({ api: (_opts: any, fn: any) => fn }));
vi.mock("./db", () => ({
  taskDB: { queryRow: vi.fn(), rawQueryRow: vi.fn() },
}));

import { createMoodEntry } from "./create_mood_entry";
import { taskDB } from "./db";
import type { CreateMoodEntryRequest, MoodEntry } from "./types";

describe("createMoodEntry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates mood entry with tags", async () => {
    const now = new Date();
    // biome-ignore lint/suspicious/noExplicitAny: mocking
    (taskDB.queryRow as any).mockResolvedValueOnce({ exists: true });
    // biome-ignore lint/suspicious/noExplicitAny: mocking
    (taskDB.rawQueryRow as any).mockResolvedValueOnce({
      id: 1,
      date: now,
      tier: "uplifted",
      emoji: "😀",
      label: "Happy",
      secondary_tier: "neutral",
      secondary_emoji: "😐",
      secondary_label: "Okay",
      tags: ["work"],
      notes: null,
      created_at: now,
    });

    const req: CreateMoodEntryRequest = {
      date: now,
      tier: "uplifted",
      emoji: "😀",
      label: "Happy",
      tags: ["work"],
    };

    const result = await createMoodEntry(req);

    expect(taskDB.rawQueryRow).toHaveBeenCalled();
    expect(result).toEqual<MoodEntry>({
      id: 1,
      date: now,
      tier: "uplifted",
      emoji: "😀",
      label: "Happy",
      secondaryTier: "neutral",
      secondaryEmoji: "😐",
      secondaryLabel: "Okay",
      tags: ["work"],
      notes: undefined,
      createdAt: now,
    });
  });
});
