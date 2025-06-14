import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("encore.dev/api", () => ({ api: (_opts: unknown, fn: unknown) => fn }));
vi.mock("./db", () => ({
  taskDB: { rawQueryAll: vi.fn(), queryRow: vi.fn() },
}));

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
    (taskDB.rawQueryAll as ReturnType<typeof vi.fn>).mockResolvedValueOnce([]);

    await listMoodEntries({ startDate: "nope", endDate: "bad" });

    expect(
      (taskDB.rawQueryAll as ReturnType<typeof vi.fn>).mock.calls[0].length,
    ).toBe(1);
  });

  it("applies limit when provided", async () => {
    (taskDB.queryRow as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      exists: true,
    });
    (taskDB.rawQueryAll as ReturnType<typeof vi.fn>).mockResolvedValueOnce([]);

    await listMoodEntries({ limit: 5 });

    const call = (taskDB.rawQueryAll as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(call[0]).toContain("LIMIT $1");
    expect(call[1]).toBe(5);
  });
});
