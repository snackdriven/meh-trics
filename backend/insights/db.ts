import { SQLDatabase } from "encore.dev/storage/sqldb";

export const insightsDB = new SQLDatabase("insights", {
  migrations: "./migrations",
});
