import { SQLDatabase } from "encore.dev/storage/sqldb";

/**
 * Database handle for all task related queries.
 *
 * Migrations live in the `migrations` directory relative to this file.
 */
export const taskDB = new SQLDatabase("task", {
  migrations: "./migrations",
});
