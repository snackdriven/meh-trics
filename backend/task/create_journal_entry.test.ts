import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("encore.dev/api", () => ({ api: (_opts: unknown, fn: unknown) => fn }));
vi.mock("./db", () => ({ taskDB: { queryRow: vi.fn() } }));

import { createJournalEntry } from "./create_journal_entry";
import { taskDB } from "./db";
import type { CreateJournalEntryRequest, JournalEntry } from "./types";

describe("createJournalEntry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates journal entry with optional date", async () => {
    const now = new Date();
    (taskDB.queryRow as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      id: 1,
      date: now,
      text: "hello",
      tags: ["a"],
      mood_id: 2,
      created_at: now,
      updated_at: now,
    });

    const req: CreateJournalEntryRequest = {
      date: now,
      text: "hello",
      tags: ["a"],
      moodId: 2,
    };

    const result = await createJournalEntry(req);

    expect(taskDB.queryRow).toHaveBeenCalled();
    expect(result).toEqual<JournalEntry>({
      id: 1,
      date: now,
      text: "hello",
      tags: ["a"],
      moodId: 2,
      createdAt: now,
      updatedAt: now,
    });
  });

  it("creates journal entry without date", async () => {
    const now = new Date();
    (taskDB.queryRow as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      id: 2,
      date: null,
      text: "hi",
      tags: [],
      mood_id: null,
      created_at: now,
      updated_at: now,
    });

    const req: CreateJournalEntryRequest = {
      text: "hi",
    };

    const result = await createJournalEntry(req);

    expect(taskDB.queryRow).toHaveBeenCalled();
    expect(result.date).toBeUndefined();
  });
});
