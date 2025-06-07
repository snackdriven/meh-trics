// Simple seed script to populate local database with sample data
// Run with: bun run backend/seed.ts

const API_URL = process.env.API_URL ?? "http://localhost:4000";

async function post(path: string, body: unknown) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    console.error(`Failed POST ${path}:`, await res.text());
  } else {
    console.log(`Seeded ${path}`);
  }
}

async function main() {
  // Sample tasks
  await post("/tasks", {
    title: "Buy groceries",
    priority: 3,
    dueDate: new Date().toISOString(),
  });
  await post("/tasks", {
    title: "Walk the dog",
    priority: 2,
  });

  // Sample habits
  const today = new Date().toISOString().split("T")[0];
  await post("/habits", {
    name: "Drink Water",
    emoji: "💧",
    frequency: "daily",
    startDate: today,
  });
  await post("/habits", {
    name: "Meditate",
    emoji: "🧘",
    frequency: "daily",
    startDate: today,
  });

  // Sample mood entry
  await post("/mood-entries", {
    date: today,
    tier: "neutral",
    emoji: "😐",
    label: "Okay",
  });

  // Sample calendar event
  const start = new Date();
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  await post("/calendar-events", {
    title: "Demo Event",
    startTime: start.toISOString(),
    endTime: end.toISOString(),
    isAllDay: false,
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
