import { SQLDatabase } from "encore.dev/storage/sqldb";

/**
 * Database handle for celebrations or milestone events.
 */
export const celebrationsDB = new SQLDatabase("celebrations", {
  migrations: "./migrations",
});
