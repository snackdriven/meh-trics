import { SQLDatabase } from "encore.dev/storage/sqldb";

/**
 * Database handle for all mood related queries.
 *
 * Migrations live in the `migrations` directory relative to this file.
 */
export const moodDB = new SQLDatabase("mood", {
  migrations: "./migrations",
});