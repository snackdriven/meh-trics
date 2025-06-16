import { api } from "encore.dev/api";
import { taskDB } from "./db";
import type { CreateJournalTemplateRequest, JournalTemplate } from "./types";

/**
 * Creates a new journal entry template.
 *
 * @param req - Template contents.
 * @returns The created journal template.
 */
export const createJournalTemplate = api<CreateJournalTemplateRequest, JournalTemplate>(
  { expose: true, method: "POST", path: "/journal-templates" },
  async (req) => {
    const row = await taskDB.queryRow<{
      id: number;
      title: string;
      text: string;
      tags: string[];
      created_at: Date;
      updated_at: Date;
    }>`
      INSERT INTO journal_templates (title, text, tags)
      VALUES (${req.title}, ${req.text}, ${req.tags || []})
      RETURNING id, title, text, tags, created_at, updated_at
    `;

    if (!row) {
      throw new Error("Failed to create journal template");
    }

    return {
      id: row.id,
      title: row.title,
      text: row.text,
      tags: row.tags,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
);
