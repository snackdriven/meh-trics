import { api } from "encore.dev/api";
import type { Query } from "encore.dev/api";
import { taskDB } from "./db";
import { rowToTask } from "./mappers";
import type { Task } from "./types";

/**
 * Query parameters for filtering tasks in the list endpoint.
 * All parameters are optional and can be combined for complex filtering.
 */
interface ListTasksParams {
  /** Filter by task status: 'todo', 'in_progress', 'done', or 'archived' */
  status?: Query<string>;
  
  /** Filter by a specific tag - returns tasks containing this tag */
  tags?: Query<string>;
  
  /** Filter by energy level: 'high', 'medium', or 'low' */
  energyLevel?: Query<string>;
  
  /** Start date for due date range filter (ISO 8601 format) */
  startDate?: Query<string>;
  
  /** End date for due date range filter (ISO 8601 format) */
  endDate?: Query<string>;
  
  /** Whether to include archived tasks: 'true' for archived, any other value for active */
  archived?: Query<string>;
}

/**
 * Response structure for the list tasks endpoint.
 */
interface ListTasksResponse {
  /** Array of tasks matching the filter criteria, sorted by sort_order then created_at */
  tasks: Task[];
}

/**
 * Retrieves tasks with comprehensive filtering capabilities.
 * 
 * This endpoint supports multiple filter combinations:
 * - Status filtering (todo, in_progress, done, archived)
 * - Tag-based filtering (exact tag match using PostgreSQL ANY operator)
 * - Energy level filtering (high, medium, low)
 * - Date range filtering on due_date field
 * - Archive status filtering
 * 
 * Performance optimizations:
 * - Uses indexes on status, energy_level, tags (GIN), and due_date
 * - Parameterized queries prevent SQL injection
 * - Results ordered by user-defined sort_order, then creation time
 * 
 * @param req - Filter parameters (all optional)
 * @returns Promise resolving to filtered task list
 * 
 * @example
 * ```typescript
 * // Get all high-energy tasks due this week
 * const response = await listTasks({
 *   energyLevel: 'high',
 *   startDate: '2024-01-01T00:00:00Z',
 *   endDate: '2024-01-07T23:59:59Z'
 * });
 * ```
 */
export const listTasks = api<ListTasksParams, ListTasksResponse>(
  { expose: true, method: "GET", path: "/tasks" },
  async (req) => {
    // Use prepared statement with conditional WHERE clauses
    const conditions: string[] = ["archived_at IS NULL"]; // Default filter
    const params: Array<string | Date> = [];
    let paramIndex = 1;

    // Build WHERE conditions more efficiently
    const filters = [
      { field: "status", param: req.status, operator: "=" },
      { field: "energy_level", param: req.energyLevel, operator: "=" },
    ];

    for (const filter of filters) {
      if (filter.param) {
        conditions.push(`${filter.field} ${filter.operator} $${paramIndex++}`);
        params.push(filter.param);
      }
    }

    // Handle array and date filters
    if (req.tags) {
      conditions.push(`$${paramIndex++} = ANY(tags)`);
      params.push(req.tags);
    }

    // Use date range optimization with single query
    if (req.startDate || req.endDate) {
      const dateConditions: string[] = [];
      if (req.startDate) {
        const parsed = new Date(req.startDate);
        if (!Number.isNaN(parsed.getTime())) {
          dateConditions.push(`due_date >= $${paramIndex++}`);
          params.push(parsed);
        }
      }
      if (req.endDate) {
        const parsed = new Date(req.endDate);
        if (!Number.isNaN(parsed.getTime())) {
          dateConditions.push(`due_date <= $${paramIndex++}`);
          params.push(parsed);
        }
      }
      if (dateConditions.length > 0) {
        conditions.push(`(${dateConditions.join(" AND ")})`);
      }
    }

    // Handle archive filter
    if (req.archived === "true") {
      conditions[0] = "archived_at IS NOT NULL"; // Replace default condition
    }

    const query = `
      SELECT id, title, description, status, priority, due_date, tags, energy_level, 
             is_hard_deadline, sort_order, archived_at, created_at, updated_at
      FROM tasks
      WHERE ${conditions.join(" AND ")}
      ORDER BY sort_order ASC NULLS LAST, created_at DESC
      LIMIT 1000  -- Add reasonable limit for performance
    `;

    // Execute query and transform results
    const tasks: Task[] = [];

    // Use async iteration for memory efficiency with large result sets
    // rowToTask mapper converts database row format to API response format
    for await (const row of taskDB.rawQuery<Parameters<typeof rowToTask>[0]>(
      query,
      ...params,
    )) {
      tasks.push(rowToTask(row));
    }

    return { tasks };
  },
);
      tasks.push(rowToTask(row));
    }

    return { tasks };
  },
);
