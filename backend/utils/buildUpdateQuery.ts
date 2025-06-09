export interface UpdateQuery {
  clause: string;
  values: import("../primitive").Primitive[];
}

/**
 * Builds a SQL SET clause for an UPDATE statement.
 * Any field with `undefined` is ignored. Use database column names as keys.
 *
 * @param fields - Key/value pairs of columns to update.
 * @param includeUpdatedAt - Whether to automatically add `updated_at = NOW()`.
 */
export function buildUpdateQuery(
  fields: Record<string, unknown>,
  includeUpdatedAt = true,
): UpdateQuery {
  const updates: string[] = [];
  const values: import("../primitive").Primitive[] = [];
  let index = 1;
  for (const [column, value] of Object.entries(fields)) {
    if (value !== undefined) {
      updates.push(`${column} = $${index++}`);
      values.push(value as import("../primitive").Primitive);
    }
  }
  if (includeUpdatedAt) {
    updates.push("updated_at = NOW()");
  }
  return { clause: updates.join(", "), values };
}
