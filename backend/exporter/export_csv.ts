import { api } from "encore.dev/api";
import { habitDB } from "../habits/db";
import { taskDB } from "../task/db";

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value).replace(/"/g, '""');
  return /[",\n]/.test(str) ? `"${str}"` : str;
}

function row(values: unknown[]): string {
  return values.map(csvEscape).join(",") + "\n";
}

export const exportCSV = api.raw(
  { expose: true, method: "GET", path: "/export.csv" },
  async (_req, res) => {
    let csv = "";

    // Tasks
    csv += "tasks\n";
    csv += row([
      "id",
      "title",
      "description",
      "status",
      "priority",
      "due_date",
      "tags",
      "energy_level",
      "is_hard_deadline",
      "created_at",
      "updated_at",
    ]);
    for await (const t of taskDB.queryAll<{
      id: number;
      title: string;
      description: string | null;
      status: string;
      priority: number;
      due_date: Date | null;
      tags: string[];
      energy_level: string | null;
      is_hard_deadline: boolean;
      created_at: Date;
      updated_at: Date;
    }>`
      SELECT id, title, description, status, priority, due_date, tags, energy_level, is_hard_deadline, created_at, updated_at
      FROM tasks
      ORDER BY id
    `) {
      csv += row([
        t.id,
        t.title,
        t.description,
        t.status,
        t.priority,
        t.due_date?.toISOString(),
        t.tags.join("|"),
        t.energy_level,
        t.is_hard_deadline,
        t.created_at.toISOString(),
        t.updated_at.toISOString(),
      ]);
    }
    csv += "\n";

    // Habits
    csv += "habits\n";
    csv += row([
      "id",
      "name",
      "emoji",
      "description",
      "frequency",
      "target_count",
      "start_date",
      "end_date",
      "created_at",
    ]);
    for await (const h of habitDB.queryAll<{
      id: number;
      name: string;
      emoji: string;
      description: string | null;
      frequency: string;
      target_count: number;
      start_date: Date;
      end_date: Date | null;
      created_at: Date;
    }>`
      SELECT id, name, emoji, description, frequency, target_count, start_date, end_date, created_at
      FROM habits
      ORDER BY id
    `) {
      csv += row([
        h.id,
        h.name,
        h.emoji,
        h.description,
        h.frequency,
        h.target_count,
        h.start_date.toISOString(),
        h.end_date?.toISOString(),
        h.created_at.toISOString(),
      ]);
    }
    csv += "\n";

    // Mood entries
    csv += "mood_entries\n";
    csv += row([
      "id",
      "date",
      "tier",
      "emoji",
      "label",
      "tags",
      "notes",
      "created_at",
    ]);
    for await (const m of taskDB.queryAll<{
      id: number;
      date: Date;
      tier: string;
      emoji: string;
      label: string;
      tags: string[] | null;
      notes: string | null;
      created_at: Date;
    }>`
      SELECT id, date, tier, emoji, label, tags, notes, created_at
      FROM mood_entries
      ORDER BY date
    `) {
      csv += row([
        m.id,
        m.date.toISOString(),
        m.tier,
        m.emoji,
        m.label,
        (m.tags || []).join("|"),
        m.notes,
        m.created_at.toISOString(),
      ]);
    }
    csv += "\n";

    // Journal entries
    csv += "journal_entries\n";
    csv += row([
      "id",
      "date",
      "text",
      "tags",
      "mood_id",
      "created_at",
      "updated_at",
    ]);
    for await (const j of taskDB.queryAll<{
      id: number;
      date: Date | null;
      text: string;
      tags: string[];
      mood_id: number | null;
      created_at: Date;
      updated_at: Date;
    }>`
      SELECT id, date, text, tags, mood_id, created_at, updated_at
      FROM journal_entries
      ORDER BY date
    `) {
      csv += row([
        j.id,
        j.date?.toISOString(),
        j.text,
        j.tags.join("|"),
        j.mood_id,
        j.created_at.toISOString(),
        j.updated_at.toISOString(),
      ]);
    }
    csv += "\n";

    res.statusCode = 200;
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=meh-trics-export.csv",
    );
    res.end(csv);
  },
);
