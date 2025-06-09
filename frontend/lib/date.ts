export function reviveDates(key: string, value: unknown): unknown {
  if (
    typeof value === "string" &&
    value.length >= 10 &&
    value[4] === "-" &&
    value[7] === "-"
  ) {
    const d = new Date(value);
    if (!isNaN(d.getTime())) return d;
  }
  return value;
}

export const ROLLOVER_HOUR = 3;

/**
 * Returns the current app date adjusted for the rollover hour.
 * If called before 3am, the date is considered part of the previous day.
 */
export function getAppDate(now = new Date()): Date {
  const adjusted = new Date(now);
  if (adjusted.getHours() < ROLLOVER_HOUR) {
    adjusted.setDate(adjusted.getDate() - 1);
  }
  adjusted.setHours(0, 0, 0, 0);
  return adjusted;
}

/** Returns ISO `YYYY-MM-DD` string for the current app date. */
export function getAppDateString(now = new Date()): string {
  return getAppDate(now).toISOString().split("T")[0];
}
