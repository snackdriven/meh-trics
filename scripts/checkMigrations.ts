import { readdir } from "fs/promises";
import path from "path";

async function check() {
  const backendDir = path.join(process.cwd(), "backend");
  const services = await readdir(backendDir, { withFileTypes: true });
  let hasDuplicates = false;

  for (const service of services) {
    if (!service.isDirectory()) continue;
    const migrationsDir = path.join(backendDir, service.name, "migrations");
    let files: string[];
    try {
      files = await readdir(migrationsDir);
    } catch {
      continue; // no migrations folder
    }

    const numbers = new Map<string, string[]>();
    for (const file of files) {
      if (!file.endsWith(".sql")) continue;
      const match = file.match(/^(\d+)/);
      if (!match) continue;
      const n = match[1];
      const arr = numbers.get(n) ?? [];
      arr.push(file);
      numbers.set(n, arr);
    }

    const dups = [...numbers.entries()].filter(([, arr]) => arr.length > 1);
    if (dups.length > 0) {
      hasDuplicates = true;
      console.error(`Duplicate migrations in ${service.name}:`);
      for (const [num, files] of dups) {
        console.error(`  ${num}: ${files.join(", ")}`);
      }
    }
  }

  if (hasDuplicates) {
    process.exit(1);
  }
}

check();
