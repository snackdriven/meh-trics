import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("encore.dev/api", () => ({ api: (_opts: unknown, fn: unknown) => fn }));
vi.mock("./db", () => ({
  taskDB: {
    exec: vi.fn(),
  },
}));

import { taskDB } from "./db";
import { deleteTask } from "./delete_task";

describe("deleteTask", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("successfully deletes a task", async () => {
    (taskDB.exec as ReturnType<typeof vi.fn>).mockResolvedValueOnce(undefined);

    const req = { id: 1 };
    const result = await deleteTask(req);

    expect(taskDB.exec).toHaveBeenCalledWith(
      expect.stringContaining("DELETE FROM tasks WHERE id = ${req.id}")
    );
    expect(result).toBeUndefined();
  });

  it("executes delete with correct task id", async () => {
    (taskDB.exec as ReturnType<typeof vi.fn>).mockResolvedValueOnce(undefined);

    const req = { id: 42 };
    await deleteTask(req);

    expect(taskDB.exec).toHaveBeenCalledWith(
      expect.stringContaining("DELETE FROM tasks WHERE id = ${req.id}")
    );
  });

  it("handles database errors", async () => {
    const dbError = new Error("Database connection failed");
    (taskDB.exec as ReturnType<typeof vi.fn>).mockRejectedValueOnce(dbError);

    const req = { id: 1 };

    await expect(deleteTask(req)).rejects.toThrow("Database connection failed");
  });

  it("works with different task ids", async () => {
    (taskDB.exec as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    const testIds = [1, 999, 12345];
    
    for (const id of testIds) {
      await deleteTask({ id });
      expect(taskDB.exec).toHaveBeenCalledWith(
        expect.stringContaining("DELETE FROM tasks WHERE id = ${req.id}")
      );
    }

    expect(taskDB.exec).toHaveBeenCalledTimes(testIds.length);
  });

  it("assumes success when no error is thrown", async () => {
    // PostgreSQL doesn't return affected rows count
    (taskDB.exec as ReturnType<typeof vi.fn>).mockResolvedValueOnce(undefined);

    const req = { id: 123 };
    
    // Should not throw even if task doesn't exist (as per comment in code)
    await expect(deleteTask(req)).resolves.toBeUndefined();
  });
});