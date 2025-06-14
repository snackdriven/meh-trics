import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("encore.dev/api", () => ({ api: (_opts: unknown, fn: unknown) => fn }));
vi.mock("./db", () => ({ taskDB: { exec: vi.fn() } }));

import { taskDB } from "./db";
import { deleteMoodEntry } from "./delete_mood_entry";

describe("deleteMoodEntry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes mood entry", async () => {
    await deleteMoodEntry({ id: 1 });
    expect(taskDB.exec).toHaveBeenCalled();
  });
});
