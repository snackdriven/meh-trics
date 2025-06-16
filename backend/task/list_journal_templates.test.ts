import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("encore.dev/api", () => ({ api: (_opts: unknown, fn: unknown) => fn }));
vi.mock("./db", () => ({ taskDB: { query: vi.fn() } }));

import { taskDB } from "./db";
import { listJournalTemplates } from "./list_journal_templates";

describe("listJournalTemplates", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns templates", async () => {
    const now = new Date();
    (taskDB.query as ReturnType<typeof vi.fn>).mockReturnValueOnce(
      (async function* () {
        yield {
          id: 1,
          title: "Daily",
          text: "How was your day?",
          tags: ["daily"],
          created_at: now,
          updated_at: now,
        };
      })()
    );

    const res = await listJournalTemplates();

    expect(taskDB.query).toHaveBeenCalled();
    expect(res.templates[0]!.id).toBe(1);
    expect(res.templates[0]!.createdAt).toBe(now);
  });
});
