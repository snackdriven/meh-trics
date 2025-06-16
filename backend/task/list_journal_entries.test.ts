import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("encore.dev/api", () => ({ api: (_opts: unknown, fn: unknown) => fn }));
vi.mock("./db", () => ({ taskDB: { rawQuery: vi.fn() } }));

import { taskDB } from "./db";
import { listJournalEntries } from "./list_journal_entries";

describe("listJournalEntries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("ignores invalid date params", async () => {
    (taskDB.rawQuery as ReturnType<typeof vi.fn>).mockReturnValueOnce((async function* () {})());

    await listJournalEntries({ startDate: "nope", endDate: "bad" });

    expect((taskDB.rawQuery as ReturnType<typeof vi.fn>).mock.calls[0]!.length).toBe(1);
  });
});
