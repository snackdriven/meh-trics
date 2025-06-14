import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("encore.dev/api", () => ({ api: (_opts: unknown, fn: unknown) => fn }));
vi.mock("../task/db", () => ({ taskDB: { rawQuery: vi.fn() } }));
vi.mock("../calendar/db", () => ({ calendarDB: { rawQuery: vi.fn() } }));
vi.mock("../habits/db", () => ({ habitDB: { rawQuery: vi.fn() } }));

import { calendarDB } from "../calendar/db";
import { habitDB } from "../habits/db";
import { taskDB } from "../task/db";
import { getAutoTags } from "./apply_tags";

describe("getAutoTags", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("gathers tags from tasks and events", async () => {
    (taskDB.rawQuery as ReturnType<typeof vi.fn>).mockReturnValueOnce(
      (async function* () {
        yield { tags: ["work"] };
      })(),
    );
    (calendarDB.rawQuery as ReturnType<typeof vi.fn>).mockReturnValueOnce(
      (async function* () {
        yield { tags: ["meeting"] };
      })(),
    );
    (habitDB.rawQuery as ReturnType<typeof vi.fn>).mockReturnValueOnce(
      (async function* () {
        yield { name: "Meditate" };
      })(),
    );

    const result = await getAutoTags();

    expect(result.tags).toContain("work");
    expect(result.tags).toContain("meeting");
    expect(result.tags).toContain("meditate");
  });

  it("always includes time of day", async () => {
    (taskDB.rawQuery as ReturnType<typeof vi.fn>).mockReturnValueOnce(
      (async function* () {})(),
    );
    (calendarDB.rawQuery as ReturnType<typeof vi.fn>).mockReturnValueOnce(
      (async function* () {})(),
    );
    (habitDB.rawQuery as ReturnType<typeof vi.fn>).mockReturnValueOnce(
      (async function* () {})(),
    );

    const result = await getAutoTags();

    expect(result.tags.length).toBeGreaterThan(0);
  });
});
