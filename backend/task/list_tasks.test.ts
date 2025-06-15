import { beforeEach, describe, expect, it, vi, afterEach } from "vitest";

// biome-ignore lint/suspicious/noExplicitAny: test helper
vi.mock("encore.dev/api", () => ({ api: (_opts: any, fn: any) => fn }));
vi.mock("./db", () => ({ taskDB: { rawQuery: vi.fn() } }));

import { taskDB } from "./db";
import { listTasks } from "./list_tasks";
import { testDB, createTestTask, cleanupTestData } from "../test-utils/database";

describe("listTasks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("parses valid date params", async () => {
    const now = new Date();
    const row = {
      id: 1,
      title: "Task",
      description: null,
      status: "todo",
      priority: 3,
      due_date: now,
      tags: ["a"],
      energy_level: "high",
      is_hard_deadline: false,
      sort_order: 1,
      archived_at: null,
      created_at: now,
      updated_at: now,
    };
    // biome-ignore lint/suspicious/noExplicitAny: mocking
    (taskDB.rawQuery as any).mockReturnValueOnce(
      (async function* () {
        yield row;
      })(),
    );

    const start = now.toISOString();
    const res = await listTasks({ startDate: start, endDate: start });

    expect(taskDB.rawQuery).toHaveBeenCalledWith(
      expect.any(String),
      new Date(start),
      new Date(start),
    );
    expect(res.tasks[0]!.archivedAt).toBeUndefined();
  });

  it("ignores invalid dates", async () => {
    // biome-ignore lint/suspicious/noExplicitAny: mocking
    (taskDB.rawQuery as any).mockReturnValueOnce((async function* () {})());

    await listTasks({ startDate: "bad-date" });

    // biome-ignore lint/suspicious/noExplicitAny: mocking
    expect((taskDB.rawQuery as any).mock.calls[0]!.length).toBe(1);
  });
});

describe("listTasks Integration Tests", () => {
  beforeEach(async () => {
    await cleanupTestData();
  });

  afterEach(async () => {
    await cleanupTestData();
  });

  describe("filtering functionality", () => {
    it("filters tasks by status correctly", async () => {
      // Create test tasks with different statuses
      await createTestTask({ title: "Todo Task", status: "todo" });
      await createTestTask({ title: "In Progress Task", status: "in_progress" });
      await createTestTask({ title: "Done Task", status: "done" });

      const todoTasks = await listTasks({ status: "todo" });
      const doneTasks = await listTasks({ status: "done" });

      expect(todoTasks.tasks).toHaveLength(1);
      expect(todoTasks.tasks[0].title).toBe("Todo Task");
      expect(doneTasks.tasks).toHaveLength(1);
      expect(doneTasks.tasks[0].title).toBe("Done Task");
    });

    it("filters tasks by energy level", async () => {
      await createTestTask({ title: "High Energy", energyLevel: "high" });
      await createTestTask({ title: "Low Energy", energyLevel: "low" });

      const highEnergyTasks = await listTasks({ energyLevel: "high" });
      
      expect(highEnergyTasks.tasks).toHaveLength(1);
      expect(highEnergyTasks.tasks[0].title).toBe("High Energy");
    });

    it("filters tasks by tags using array contains", async () => {
      await createTestTask({ title: "Work Task", tags: ["work", "important"] });
      await createTestTask({ title: "Personal Task", tags: ["personal"] });

      const workTasks = await listTasks({ tags: "work" });
      
      expect(workTasks.tasks).toHaveLength(1);
      expect(workTasks.tasks[0].title).toBe("Work Task");
    });

    it("filters tasks by date range", async () => {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);

      await createTestTask({ title: "Due Today", dueDate: today });
      await createTestTask({ title: "Due Tomorrow", dueDate: tomorrow });
      await createTestTask({ title: "Due Next Week", dueDate: nextWeek });

      const thisWeekTasks = await listTasks({
        startDate: today.toISOString(),
        endDate: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString()
      });

      expect(thisWeekTasks.tasks).toHaveLength(2);
      expect(thisWeekTasks.tasks.map(t => t.title)).toContain("Due Today");
      expect(thisWeekTasks.tasks.map(t => t.title)).toContain("Due Tomorrow");
    });
  });

  describe("sorting and ordering", () => {
    it("orders tasks by sort_order then created_at", async () => {
      const baseTime = new Date();
      
      await createTestTask({ 
        title: "Third Task", 
        sortOrder: 3,
        createdAt: new Date(baseTime.getTime() + 1000)
      });
      await createTestTask({ 
        title: "First Task", 
        sortOrder: 1,
        createdAt: new Date(baseTime.getTime() + 2000) 
      });
      await createTestTask({ 
        title: "Second Task", 
        sortOrder: 2,
        createdAt: new Date(baseTime.getTime() + 3000)
      });

      const result = await listTasks({});

      expect(result.tasks).toHaveLength(3);
      expect(result.tasks[0].title).toBe("First Task");
      expect(result.tasks[1].title).toBe("Second Task");
      expect(result.tasks[2].title).toBe("Third Task");
    });

    it("handles null sort_order correctly", async () => {
      const baseTime = new Date();
      
      await createTestTask({ 
        title: "With Sort Order", 
        sortOrder: 1,
        createdAt: new Date(baseTime.getTime())
      });
      await createTestTask({ 
        title: "Without Sort Order", 
        sortOrder: null,
        createdAt: new Date(baseTime.getTime() + 1000)
      });

      const result = await listTasks({});

      expect(result.tasks[0].title).toBe("With Sort Order");
      expect(result.tasks[1].title).toBe("Without Sort Order");
    });
  });

  describe("archive functionality", () => {
    it("excludes archived tasks by default", async () => {
      await createTestTask({ title: "Active Task", archivedAt: null });
      await createTestTask({ title: "Archived Task", archivedAt: new Date() });

      const result = await listTasks({});

      expect(result.tasks).toHaveLength(1);
      expect(result.tasks[0].title).toBe("Active Task");
    });

    it("includes only archived tasks when requested", async () => {
      await createTestTask({ title: "Active Task", archivedAt: null });
      await createTestTask({ title: "Archived Task", archivedAt: new Date() });

      const result = await listTasks({ archived: "true" });

      expect(result.tasks).toHaveLength(1);
      expect(result.tasks[0].title).toBe("Archived Task");
    });
  });

  describe("performance and limits", () => {
    it("respects the 1000 task limit", async () => {
      // Create more than 1000 tasks
      const tasks = Array.from({ length: 1200 }, (_, i) => ({
        title: `Task ${i + 1}`,
        status: "todo" as const
      }));
      
      for (const task of tasks) {
        await createTestTask(task);
      }

      const result = await listTasks({});

      expect(result.tasks.length).toBeLessThanOrEqual(1000);
    });

    it("handles complex filter combinations efficiently", async () => {
      // Create tasks with various combinations
      await createTestTask({ 
        title: "Complex Task",
        status: "in_progress",
        energyLevel: "high",
        tags: ["work", "urgent"],
        dueDate: new Date()
      });
      await createTestTask({ 
        title: "Other Task",
        status: "todo",
        energyLevel: "low",
        tags: ["personal"],
        dueDate: new Date()
      });

      const startTime = Date.now();
      const result = await listTasks({
        status: "in_progress",
        energyLevel: "high",
        tags: "work",
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      });
      const duration = Date.now() - startTime;

      expect(result.tasks).toHaveLength(1);
      expect(result.tasks[0].title).toBe("Complex Task");
      expect(duration).toBeLessThan(100); // Should complete within 100ms
    });
  });
});
