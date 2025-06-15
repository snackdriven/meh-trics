import path from "path";
import { readdir, readFile } from "fs/promises";

async function lint() {
  const backendDir = path.join(process.cwd(), "backend");
  const services = await readdir(backendDir, { withFileTypes: true });
  let hasError = false;

  for (const service of services) {
    if (!service.isDirectory()) continue;
    const migrationsDir = path.join(backendDir, service.name, "migrations");
    let files: string[];
    try {
      files = await readdir(migrationsDir);
    } catch {
      continue;
    }

    for (const file of files) {
      if (!file.endsWith(".sql")) continue;
      const filePath = path.join(migrationsDir, file);
      const content = await readFile(filePath, "utf8");
      const lines = content.trim().split(/\n/);
      const last = lines[lines.length - 1];
      if (!last.trim().endsWith(";")) {
        console.error(`Missing semicolon in ${path.join(service.name, "migrations", file)}`);
        hasError = true;
      }
    }
  }

  if (hasError) {
    process.exit(1);
  }
}

lint();
