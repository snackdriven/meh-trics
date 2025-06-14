import { SQLDatabase } from "encore.dev/storage/sqldb";

/**
 * Database handle for analytics-related queries.
 */
export const analyticsDB = new SQLDatabase("analytics", {
  migrations: "./migrations",
});
