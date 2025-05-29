import { SQLDatabase } from "encore.dev/storage/sqldb";

export const taskDB = new SQLDatabase("task", {
  migrations: "./migrations",
});
