import { api } from "encore.dev/api";
import { taskDB } from "./db";
import { hasSecondaryMoodColumns } from "./mood_schema";
import type { CreateMoodEntryRequest, MoodEntry, MoodTier } from "./types";
import { createAppError, ErrorCode, validateRequiredFields, withErrorHandling } from "../utils/errors";

/**
 * Creates a mood entry for a specific date.
 *
 * @param req - Mood metadata including tier and notes.
 * @returns The saved mood entry.
 */
export const createMoodEntry = api<CreateMoodEntryRequest, MoodEntry>(
  { expose: true, method: "POST", path: "/mood-entries" },
  async (req) => {
    return withErrorHandling(async () => {
      // Validate required fields
      validateRequiredFields(req, ["date", "tier", "emoji", "label"]);

      // Validate tier
      const validTiers = ["uplifted", "neutral", "heavy"];
      if (!validTiers.includes(req.tier)) {
        throw createAppError(ErrorCode.INVALID_INPUT, "Mood tier must be uplifted, neutral, or heavy");
      }

      // Validate secondary tier if provided
      if (req.secondaryTier && !validTiers.includes(req.secondaryTier)) {
        throw createAppError(ErrorCode.INVALID_INPUT, "Secondary mood tier must be uplifted, neutral, or heavy");
      }

      // Validate emoji
      if (req.emoji.trim().length === 0) {
        throw createAppError(ErrorCode.INVALID_INPUT, "Mood emoji cannot be empty");
      }

      // Validate label
      if (req.label.trim().length === 0) {
        throw createAppError(ErrorCode.INVALID_INPUT, "Mood label cannot be empty");
      }
      if (req.label.length > 50) {
        throw createAppError(ErrorCode.INVALID_INPUT, "Mood label cannot exceed 50 characters");
      }

      // Validate date is not too far in the future
      const oneDayFromNow = new Date(Date.now() + 24 * 60 * 60 * 1000);
      if (req.date > oneDayFromNow) {
        throw createAppError(ErrorCode.INVALID_INPUT, "Mood entry date cannot be more than 1 day in the future");
      }

      // Validate notes length
      if (req.notes && req.notes.length > 1000) {
        throw createAppError(ErrorCode.INVALID_INPUT, "Mood notes cannot exceed 1000 characters");
      }

      const includeSecondary = await hasSecondaryMoodColumns();

      const columns = ["date", "tier", "emoji", "label", "tags", "notes"];
      const values: Array<unknown> = [
        req.date,
        req.tier,
        req.emoji.trim(),
        req.label.trim(),
        req.tags || [],
        req.notes?.trim() || null,
      ];

      if (includeSecondary) {
        columns.push("secondary_tier", "secondary_emoji", "secondary_label");
        values.push(
          req.secondaryTier || null,
          req.secondaryEmoji?.trim() || null,
          req.secondaryLabel?.trim() || null,
        );
      }

      const placeholders = columns.map((_, i) => `$${i + 1}`).join(", ");
      const query = `
        INSERT INTO mood_entries (${columns.join(", ")})
        VALUES (${placeholders})
        RETURNING id, date, tier, emoji, label${
          includeSecondary
            ? ", secondary_tier, secondary_emoji, secondary_label"
            : ""
        }, tags, notes, created_at
      `;

      const row = await taskDB.rawQueryRow<{
        id: number;
        date: Date;
        tier: string;
        emoji: string;
        label: string;
        secondary_tier?: string | null;
        secondary_emoji?: string | null;
        secondary_label?: string | null;
        tags: string[] | null;
        notes: string | null;
        created_at: Date;
      }>(query, ...values);

      if (!row) {
        throw createAppError(ErrorCode.DATABASE_TRANSACTION_FAILED, "Failed to insert mood entry record");
      }

      return {
        id: row.id,
        date: row.date,
        tier: row.tier as MoodTier,
        emoji: row.emoji,
        label: row.label,
        tags: row.tags || [],
        secondaryTier: (row.secondary_tier as MoodTier | null) ?? undefined,
        secondaryEmoji: row.secondary_emoji || undefined,
        secondaryLabel: row.secondary_label || undefined,
        notes: row.notes || undefined,
        createdAt: row.created_at,
      };
    }, "create mood entry");
  },
);
