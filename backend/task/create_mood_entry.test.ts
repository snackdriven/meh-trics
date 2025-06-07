import { beforeEach, describe, expect, it, vi } from "vitest";

// biome-ignore lint/suspicious/noExplicitAny: test helper
vi.mock("encore.dev/api", () => ({ api: (_opts: any, fn: any) => fn }));
vi.mock("./db", () => ({ taskDB: { queryRow: vi.fn() } }));

import { createMoodEntry } from "./create_mood_entry";
import { taskDB } from "./db";
import type { CreateMoodEntryRequest, MoodEntry } from "./types";

describe("createMoodEntry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates mood entry with color and tags", async () => {
    const now = new Date();
    // biome-ignore lint/suspicious/noExplicitAny: mocking
    (taskDB.queryRow as any).mockResolvedValueOnce({
      id: 1,
      date: now,
      tier: "uplifted",
      emoji: "😀",
      label: "Happy",
      color: "#ff0000",
      tags: ["work"],
      notes: null,
      created_at: now,
    });

    const req: CreateMoodEntryRequest = {
      date: now,
      tier: "uplifted",
      emoji: "😀",
      label: "Happy",
      color: "#ff0000",
      tags: ["work"],
    };

    const result = await createMoodEntry(req);

    expect(taskDB.queryRow).toHaveBeenCalled();
    expect(result).toEqual<MoodEntry>({
      id: 1,
      date: now,
      tier: "uplifted",
      emoji: "😀",
      label: "Happy",
      color: "#ff0000",
      tags: ["work"],
      notes: undefined,
      createdAt: now,
    });
  });
});
