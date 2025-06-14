export type Cycle = "daily" | "weekly" | "monthly";

/**
 * Calculates the start of a recurring cycle based on the provided date.
 *
 * @param date - Arbitrary date within the cycle.
 * @param cycle - Cycle type to calculate for.
 * @returns The first moment of the cycle.
 */
export function getCycleStart(date: Date, cycle: Cycle): Date {
  const d = new Date(date);
  switch (cycle) {
    case "daily":
      d.setHours(0, 0, 0, 0);
      break;
    case "weekly": {
      const day = d.getDay();
      const diff = (day + 6) % 7; // Monday as start
      d.setDate(d.getDate() - diff);
      d.setHours(0, 0, 0, 0);
      break;
    }
    case "monthly":
      d.setDate(1);
      d.setHours(0, 0, 0, 0);
      break;
  }
  return d;
}

/**
 * Calculates the start of the cycle immediately following the provided date.
 *
 * @param date - Arbitrary date within the current cycle.
 * @param cycle - Cycle type to calculate for.
 * @returns The first moment of the next cycle.
 */
export function getNextCycleStart(date: Date, cycle: Cycle): Date {
  const start = getCycleStart(date, cycle);
  switch (cycle) {
    case "daily":
      start.setDate(start.getDate() + 1);
      break;
    case "weekly":
      start.setDate(start.getDate() + 7);
      break;
    case "monthly":
      start.setMonth(start.getMonth() + 1);
      break;
  }
  return start;
}

/**
 * Returns the end of the current cycle which is the start
 * of the next cycle.
 */
export function getCycleEnd(date: Date, cycle: Cycle): Date {
  const end = getNextCycleStart(date, cycle);
  return end;
}
