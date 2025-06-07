import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("encore.dev/api", () => ({ api: (_opts: unknown, fn: unknown) => fn }));
vi.mock("./db", () => ({ taskDB: { queryRow: vi.fn() } }));

import { createJournalTemplate } from "./create_journal_template";
import { taskDB } from "./db";
import type { CreateJournalTemplateRequest, JournalTemplate } from "./types";

describe("createJournalTemplate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates journal template", async () => {
    const now = new Date();
    (taskDB.queryRow as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      id: 1,
      title: "Daily",
      text: "How was your day?",
      tags: ["daily"],
      created_at: now,
      updated_at: now,
    });

    const req: CreateJournalTemplateRequest = {
      title: "Daily",
      text: "How was your day?",
      tags: ["daily"],
    };

    const tmpl = await createJournalTemplate(req);

    expect(taskDB.queryRow).toHaveBeenCalled();
    expect(tmpl).toEqual<JournalTemplate>({
      id: 1,
      title: "Daily",
      text: "How was your day?",
      tags: ["daily"],
      createdAt: now,
      updatedAt: now,
    });
  });
});
