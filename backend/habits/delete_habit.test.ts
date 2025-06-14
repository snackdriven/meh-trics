import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("encore.dev/api", () => ({ api: (_opts: unknown, fn: unknown) => fn }));
vi.mock("./db", () => ({
  habitDB: {
    exec: vi.fn(),
  },
}));

import { habitDB } from "./db";
import { deleteHabit } from "./delete_habit";

describe("deleteHabit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("successfully deletes a habit", async () => {
    (habitDB.exec as ReturnType<typeof vi.fn>).mockResolvedValueOnce(undefined);

    const req = { id: 1 };
    const result = await deleteHabit(req);

    expect(habitDB.exec).toHaveBeenCalledWith(
      expect.stringContaining("DELETE FROM habits WHERE id = ${req.id}")
    );
    expect(result).toBeUndefined();
  });

  it("executes delete with correct habit id", async () => {
    (habitDB.exec as ReturnType<typeof vi.fn>).mockResolvedValueOnce(undefined);

    const req = { id: 42 };
    await deleteHabit(req);

    expect(habitDB.exec).toHaveBeenCalledWith(
      expect.stringContaining("DELETE FROM habits WHERE id = ${req.id}")
    );
  });

  it("handles database errors", async () => {
    const dbError = new Error("Database connection failed");
    (habitDB.exec as ReturnType<typeof vi.fn>).mockRejectedValueOnce(dbError);

    const req = { id: 1 };

    await expect(deleteHabit(req)).rejects.toThrow("Database connection failed");
  });

  it("works with different habit ids", async () => {
    (habitDB.exec as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    const testIds = [1, 999, 12345];
    
    for (const id of testIds) {
      await deleteHabit({ id });
      expect(habitDB.exec).toHaveBeenCalledWith(
        expect.stringContaining("DELETE FROM habits WHERE id = ${req.id}")
      );
    }

    expect(habitDB.exec).toHaveBeenCalledTimes(testIds.length);
  });
});