import { api } from "encore.dev/api";
import { taskDB } from "./db";
import type { JournalTemplate } from "./types";

interface ListJournalTemplatesResponse {
  templates: JournalTemplate[];
}

/**
 * Retrieves all journal templates.
 *
 * @returns Saved journal templates.
 */
export const listJournalTemplates = api<void, ListJournalTemplatesResponse>(
  { expose: true, method: "GET", path: "/journal-templates" },
  async () => {
    const templates: JournalTemplate[] = [];

    for await (const row of taskDB.query<{
      id: number;
      title: string;
      text: string;
      tags: string[];
      created_at: Date;
      updated_at: Date;
    }>`
      SELECT id, title, text, tags, created_at, updated_at
      FROM journal_templates
      ORDER BY created_at DESC
    `) {
      templates.push({
        id: row.id,
        title: row.title,
        text: row.text,
        tags: row.tags,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      });
    }

    return { templates };
  }
);
