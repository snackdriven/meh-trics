import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("encore.dev/api", () => ({ api: (_opts: unknown, fn: unknown) => fn }));
vi.mock("./db", () => ({ taskDB: { exec: vi.fn() } }));

import { deleteMoodEntry } from "./delete_mood_entry";
import { taskDB } from "./db";

describe("deleteMoodEntry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes mood entry", async () => {
    await deleteMoodEntry({ id: 1 });
    expect(taskDB.exec).toHaveBeenCalled();
  });
});
