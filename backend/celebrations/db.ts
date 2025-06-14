import { SQLDatabase } from "encore.dev/storage/sqldb";

export const celebrationsDB = new SQLDatabase("celebrations", {
  migrations: "./migrations",
});