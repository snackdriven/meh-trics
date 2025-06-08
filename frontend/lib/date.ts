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
