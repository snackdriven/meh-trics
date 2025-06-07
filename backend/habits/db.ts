import { SQLDatabase } from "encore.dev/storage/sqldb";

export const habitDB = new SQLDatabase("habits", {
  migrations: "./migrations",
});
