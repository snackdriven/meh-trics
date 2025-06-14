export let secondaryColumnsPromise: Promise<boolean> | null = null;

import { taskDB } from "./db";

export async function hasSecondaryMoodColumns(): Promise<boolean> {
  if (!secondaryColumnsPromise) {
    secondaryColumnsPromise = taskDB
      .queryRow<{ exists: boolean }>(`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'mood_entries'
            AND column_name = 'secondary_tier'
        ) AS exists
      `)
      .then((row) => row?.exists ?? false)
      .catch(() => false);
  }
  return secondaryColumnsPromise;
}
