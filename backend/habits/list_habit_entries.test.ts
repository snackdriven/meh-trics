import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("encore.dev/api", () => ({ api: (_opts: unknown, fn: unknown) => fn }));
vi.mock("./db", () => ({ habitDB: { rawQuery: vi.fn() } }));

import { habitDB } from "./db";
import { listHabitEntries } from "./list_habit_entries";

describe("listHabitEntries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("ignores invalid date params", async () => {
    (habitDB.rawQuery as ReturnType<typeof vi.fn>).mockReturnValueOnce(
      (async function* () {})(),
    );

    await listHabitEntries({ startDate: "nope", endDate: "bad" });

    expect(
      (habitDB.rawQuery as ReturnType<typeof vi.fn>).mock.calls[0].length,
    ).toBe(1);
  });
});
