import { beforeEach, describe, expect, it, vi } from "vitest";

// biome-ignore lint/suspicious/noExplicitAny: test helper
vi.mock("encore.dev/api", () => ({ api: (_opts: any, fn: any) => fn }));
vi.mock("./db", () => ({ taskDB: { queryRow: vi.fn() } }));
vi.mock("./create_journal_entry", () => ({ createJournalEntry: vi.fn() }));

import { taskDB } from "./db";
import { createJournalEntry } from "./create_journal_entry";
import { getJournalEntry } from "./get_journal_entry";

describe("getJournalEntry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns existing journal entry", async () => {
    const now = new Date();
    const mockEntry = {
      id: 1,
      date: now,
      text: "Test entry",
      tags: ["test"],
      mood_id: null,
      task_id: null,
      habit_entry_id: null,
      created_at: now,
      updated_at: now,
    };

    (taskDB.queryRow as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockEntry);

    const result = await getJournalEntry({ date: now });

    expect(taskDB.queryRow).toHaveBeenCalledWith(
      expect.stringContaining("SELECT")
    );
    expect(result).toEqual({
      id: 1,
      date: now,
      text: "Test entry",
      tags: ["test"],
      moodId: undefined,
      taskId: undefined,
      habitEntryId: undefined,
      createdAt: now,
      updatedAt: now,
    });
  });

  it("creates blank entry when missing", async () => {
    const now = new Date();
    const blankEntry = {
      id: 2,
      date: now,
      text: "",
      tags: [],
      mood_id: null,
      task_id: null,
      habit_entry_id: null,
      created_at: now,
      updated_at: now,
    };

    (taskDB.queryRow as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);
    (createJournalEntry as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      id: 2,
      date: now,
      text: "",
      tags: [],
      createdAt: now,
      updatedAt: now,
    });

    const result = await getJournalEntry({ date: now });

    expect(createJournalEntry).toHaveBeenCalledWith({
      date: now,
      text: "",
      tags: [],
    });
    expect(result.text).toBe("");
  });

  it("handles date-only queries", async () => {
    const date = new Date("2023-12-25");
    const mockEntry = {
      id: 1,
      date,
      text: "Christmas entry",
      tags: ["holiday"],
      mood_id: null,
      task_id: null,
      habit_entry_id: null,
      created_at: date,
      updated_at: date,
    };

    (taskDB.queryRow as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockEntry);

    await getJournalEntry({ date });

    expect(taskDB.queryRow).toHaveBeenCalledWith(
      expect.stringContaining("WHERE date = ${req.date}")
    );
  });
});
