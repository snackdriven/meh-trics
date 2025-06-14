import { beforeEach, describe, expect, it, vi } from "vitest";

// biome-ignore lint/suspicious/noExplicitAny: test helper
vi.mock("encore.dev/api", () => ({ api: (_opts: any, fn: any) => fn }));
vi.mock("./db", () => ({ taskDB: { queryRow: vi.fn() } }));
vi.mock("./create_journal_entry", () => ({ createJournalEntry: vi.fn() }));

import { createJournalEntry } from "./create_journal_entry";
import { taskDB } from "./db";
import { getJournalEntry } from "./get_journal_entry";

import type { JournalEntry } from "./types";

describe("getJournalEntry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns existing journal entry", async () => {
    const now = new Date();
    // biome-ignore lint/suspicious/noExplicitAny: mocking
    (taskDB.queryRow as any).mockResolvedValueOnce({
      id: 1,
      date: now,
      text: "hi",
      tags: ["a"],
      mood_id: null,
      created_at: now,
      updated_at: now,
    });

    const entry = await getJournalEntry({ date: "2025-01-01" });

    expect(createJournalEntry).not.toHaveBeenCalled();
    expect(entry).toEqual<JournalEntry>({
      id: 1,
      date: now,
      text: "hi",
      tags: ["a"],
      createdAt: now,
      updatedAt: now,
    });
  });

  it("creates blank entry when missing", async () => {
    // biome-ignore lint/suspicious/noExplicitAny: mocking
    (taskDB.queryRow as any).mockResolvedValueOnce(undefined);
    const now = new Date();
    const dateOnly = new Date(now.toISOString().split("T")[0]!);
    // biome-ignore lint/suspicious/noExplicitAny: mocking
    (createJournalEntry as any).mockResolvedValueOnce({
      id: 2,
      date: dateOnly,
      text: "",
      tags: [],
      createdAt: now,
      updatedAt: now,
    });

    const entry = await getJournalEntry({
      date: now.toISOString().split("T")[0]!,
    });

    expect(createJournalEntry).toHaveBeenCalledWith({
      date: dateOnly,
      text: "",
      tags: [],
    });
    expect(entry).toEqual<JournalEntry>({
      id: 2,
      date: dateOnly,
      text: "",
      tags: [],
      createdAt: now,
      updatedAt: now,
    });
  });
});
