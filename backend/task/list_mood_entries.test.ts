import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("encore.dev/api", () => ({ api: (_opts: unknown, fn: unknown) => fn }));
vi.mock("./db", () => ({ taskDB: { rawQuery: vi.fn(), queryRow: vi.fn() } }));

import { taskDB } from "./db";
import { listMoodEntries } from "./list_mood_entries";

describe("listMoodEntries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("ignores invalid date params", async () => {
    (taskDB.queryRow as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      exists: true,
    });
    (taskDB.rawQuery as ReturnType<typeof vi.fn>).mockReturnValueOnce(
      (async function* () {})(),
    );

    await listMoodEntries({ startDate: "nope", endDate: "bad" });

    expect(
      (taskDB.rawQuery as ReturnType<typeof vi.fn>).mock.calls[0].length,
    ).toBe(1);
  });
});
