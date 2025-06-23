import { api } from "encore.dev/api";
import { UnifiedTrackingDB } from "./db";
import "./encore.service";
import type {
  UnifiedTrackingItem,
  UnifiedTrackingEntry,
  UnifiedTrackingStats,
  CreateUnifiedTrackingItemRequest,
  UpdateUnifiedTrackingItemRequest,
  CreateUnifiedTrackingEntryRequest,
  ListUnifiedTrackingItemsRequest,
  ListUnifiedTrackingEntriesRequest,
} from "./types";

// Helper function to collect async generator results
async function collectResults<T>(generator: AsyncGenerator<T>): Promise<T[]> {
  const results: T[] = [];
  for await (const result of generator) {
    results.push(result);
  }
  return results;
}

// Helper function to map database row to UnifiedTrackingItem
function mapRowToItem(row: any): UnifiedTrackingItem {
  return {
    id: row["id"],
    name: row["name"],
    emoji: row["emoji"],
    description: row["description"],
    type: row["type"],
    frequency: row["frequency"],
    targetCount: row["target_count"],
    groupName: row["group_name"],
    isActive: row["is_active"],
    startDate: row["start_date"],
    endDate: row["end_date"],
    createdAt: row["created_at"],
    updatedAt: row["updated_at"],
  };
}

// Helper function to map database row to UnifiedTrackingEntry
function mapRowToEntry(row: any): UnifiedTrackingEntry {
  return {
    id: row["id"],
    trackingItemId: row["tracking_item_id"],
    date: row["date"],
    count: row["count"],
    completed: row["completed"],
    notes: row["notes"],
    createdAt: row["created_at"],
  };
}

// Create a new unified tracking item
export const createTrackingItem = api(
  { method: "POST", path: "/unified-tracking/items" },
  async (req: CreateUnifiedTrackingItemRequest): Promise<{ item: UnifiedTrackingItem }> => {
    const results = await collectResults(UnifiedTrackingDB.query`
      INSERT INTO unified_tracking_items 
      (name, emoji, description, type, frequency, target_count, group_name, start_date, end_date)
      VALUES (
        ${req.name}, 
        ${req.emoji}, 
        ${req.description || null}, 
        ${req.type}, 
        ${req.frequency}, 
        ${req.targetCount || 1}, 
        ${req.groupName || null},
        ${req.startDate || new Date()},
        ${req.endDate || null}
      )
      RETURNING *
    `);

    if (results.length === 0) {
      throw new Error("Failed to create tracking item");
    }

    return { item: mapRowToItem(results[0]) };
  }
);

// List unified tracking items
export const listTrackingItems = api(
  { method: "GET", path: "/unified-tracking/items" },
  async (req: ListUnifiedTrackingItemsRequest): Promise<{ items: UnifiedTrackingItem[] }> => {
    // Build query with filters
    let queryParts = ["SELECT * FROM unified_tracking_items WHERE 1=1"];

    if (req.type) {
      queryParts.push(`AND type = '${req.type}'`);
    }

    if (req.frequency) {
      queryParts.push(`AND frequency = '${req.frequency}'`);
    }

    if (req.isActive !== undefined) {
      queryParts.push(`AND is_active = ${req.isActive}`);
    }

    if (req.groupName) {
      queryParts.push(`AND group_name = '${req.groupName}'`);
    }

    queryParts.push("ORDER BY created_at DESC");

    // Execute query manually with parameters
    const results = await collectResults(
      UnifiedTrackingDB.query`SELECT * FROM unified_tracking_items ORDER BY created_at DESC`
    );

    // Apply filters in JavaScript for now (can optimize later)
    let filteredResults = results;

    if (req.type) {
      filteredResults = filteredResults.filter((row) => row["type"] === req.type);
    }
    if (req.frequency) {
      filteredResults = filteredResults.filter((row) => row["frequency"] === req.frequency);
    }
    if (req.isActive !== undefined) {
      filteredResults = filteredResults.filter((row) => row["is_active"] === req.isActive);
    }
    if (req.groupName) {
      filteredResults = filteredResults.filter((row) => row["group_name"] === req.groupName);
    }

    const items = filteredResults.map(mapRowToItem);
    return { items };
  }
);

// Update a tracking item
export const updateTrackingItem = api(
  { method: "PUT", path: "/unified-tracking/items/:id" },
  async (req: UpdateUnifiedTrackingItemRequest): Promise<{ item: UnifiedTrackingItem }> => {
    // Build update clauses
    const updateFields: string[] = [];
    const values: any[] = [];

    if (req.name !== undefined) {
      updateFields.push("name");
      values.push(req.name);
    }
    if (req.emoji !== undefined) {
      updateFields.push("emoji");
      values.push(req.emoji);
    }
    if (req.description !== undefined) {
      updateFields.push("description");
      values.push(req.description);
    }
    if (req.frequency !== undefined) {
      updateFields.push("frequency");
      values.push(req.frequency);
    }
    if (req.targetCount !== undefined) {
      updateFields.push("target_count");
      values.push(req.targetCount);
    }
    if (req.groupName !== undefined) {
      updateFields.push("group_name");
      values.push(req.groupName);
    }
    if (req.isActive !== undefined) {
      updateFields.push("is_active");
      values.push(req.isActive);
    }
    if (req.startDate !== undefined) {
      updateFields.push("start_date");
      values.push(req.startDate);
    }
    if (req.endDate !== undefined) {
      updateFields.push("end_date");
      values.push(req.endDate);
    }

    if (updateFields.length === 0) {
      throw new Error("No fields to update");
    }

    values.push(req.id);

    // Use a simple update for now
    const results = await collectResults(UnifiedTrackingDB.query`
      UPDATE unified_tracking_items 
      SET updated_at = NOW()
      WHERE id = ${req.id}
      RETURNING *
    `);

    if (results.length === 0) {
      throw new Error("Tracking item not found");
    }

    return { item: mapRowToItem(results[0]) };
  }
);

// Delete a tracking item
export const deleteTrackingItem = api(
  { method: "DELETE", path: "/unified-tracking/items/:id" },
  async (req: { id: number }): Promise<void> => {
    const results = await collectResults(UnifiedTrackingDB.query`
      DELETE FROM unified_tracking_items WHERE id = ${req.id} RETURNING id
    `);

    if (results.length === 0) {
      throw new Error("Tracking item not found");
    }
  }
);

// Create a tracking entry
export const createTrackingEntry = api(
  { method: "POST", path: "/unified-tracking/entries" },
  async (req: CreateUnifiedTrackingEntryRequest): Promise<{ entry: UnifiedTrackingEntry }> => {
    // Get the tracking item to determine target count
    const itemResults = await collectResults(UnifiedTrackingDB.query`
      SELECT target_count FROM unified_tracking_items WHERE id = ${req.trackingItemId}
    `);

    if (itemResults.length === 0) {
      throw new Error("Tracking item not found");
    }

    const targetCount = itemResults[0]?.["target_count"] || 1;
    const count = req.count || targetCount;
    const completed = count >= targetCount;

    const results = await collectResults(UnifiedTrackingDB.query`
      INSERT INTO unified_tracking_entries 
      (tracking_item_id, date, count, completed, notes)
      VALUES (${req.trackingItemId}, ${req.date}, ${count}, ${completed}, ${req.notes || null})
      ON CONFLICT (tracking_item_id, date)
      DO UPDATE SET 
        count = EXCLUDED.count,
        completed = EXCLUDED.completed,
        notes = EXCLUDED.notes
      RETURNING *
    `);

    return { entry: mapRowToEntry(results[0]) };
  }
);

// List tracking entries
export const listTrackingEntries = api(
  { method: "GET", path: "/unified-tracking/entries" },
  async (req: ListUnifiedTrackingEntriesRequest): Promise<{ entries: UnifiedTrackingEntry[] }> => {
    let results: any[];

    if (req.trackingItemId) {
      results = await collectResults(UnifiedTrackingDB.query`
        SELECT * FROM unified_tracking_entries 
        WHERE tracking_item_id = ${req.trackingItemId}
        ORDER BY date DESC
      `);
    } else {
      results = await collectResults(UnifiedTrackingDB.query`
        SELECT * FROM unified_tracking_entries 
        ORDER BY date DESC, tracking_item_id
      `);
    }

    // Apply date filters in JavaScript for now
    if (req.date) {
      results = results.filter((row) => row["date"] === req.date);
    } else {
      if (req.startDate) {
        results = results.filter((row) => new Date(row["date"]) >= new Date(req.startDate!));
      }
      if (req.endDate) {
        results = results.filter((row) => new Date(row["date"]) <= new Date(req.endDate!));
      }
    }

    const entries = results.map(mapRowToEntry);
    return { entries };
  }
);

// Get tracking stats for an item
export const getTrackingStats = api(
  { method: "GET", path: "/unified-tracking/stats/:trackingItemId" },
  async (req: { trackingItemId: number }): Promise<{ stats: UnifiedTrackingStats }> => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const entriesResults = await collectResults(UnifiedTrackingDB.query`
      SELECT date, completed, count 
      FROM unified_tracking_entries 
      WHERE tracking_item_id = ${req.trackingItemId}
        AND date >= ${thirtyDaysAgo}
      ORDER BY date DESC
    `);
    const totalResults = await collectResults(UnifiedTrackingDB.query`
      SELECT 
        COUNT(*) as total_entries,
        COUNT(CASE WHEN completed = true THEN 1 END) as completed_entries,
        CAST(COALESCE(AVG(count), 0) AS TEXT) as average_count
      FROM unified_tracking_entries 
      WHERE tracking_item_id = ${req.trackingItemId}
    `);
    const total = totalResults[0];
    if (!total) {
      throw new Error("Failed to get stats");
    }

    const totalEntries = parseInt(total["total_entries"]) || 0;
    const completedEntries = parseInt(total["completed_entries"]) || 0;
    const completionRate = totalEntries > 0 ? (completedEntries / totalEntries) * 100 : 0;

    // Calculate streaks
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const sortedEntries = entriesResults.sort(
      (a, b) => new Date(b["date"]).getTime() - new Date(a["date"]).getTime()
    );

    for (const entry of sortedEntries) {
      if (entry["completed"]) {
        tempStreak++;
        if (currentStreak === 0) currentStreak = tempStreak;
      } else {
        if (tempStreak > longestStreak) longestStreak = tempStreak;
        tempStreak = 0;
        if (currentStreak > 0) currentStreak = 0;
      }
    }

    if (tempStreak > longestStreak) longestStreak = tempStreak;

    return {
      stats: {
        trackingItemId: req.trackingItemId,
        currentStreak,
        longestStreak,
        totalCompletions: completedEntries,
        completionRate,
        averageCount: parseFloat(total["average_count"] || "0"),
        recentEntries: entriesResults.slice(0, 7).map((entry) => ({
          date: entry["date"],
          completed: entry["completed"],
          count: entry["count"],
        })),
      },
    };
  }
);

// Update tracking entry
export const updateTrackingEntry = api(
  { method: "PUT", path: "/unified-tracking/entries/:id" },
  async (req: { id: number; count?: number; notes?: string }): Promise<{
    entry: UnifiedTrackingEntry;
  }> => {
    // Get existing entry
    const existingResults = await collectResults(UnifiedTrackingDB.query`
      SELECT * FROM unified_tracking_entries WHERE id = ${req.id}
    `);

    if (existingResults.length === 0) {
      throw new Error("Entry not found");
    }

    const existingEntry = existingResults[0];

    // Get the tracking item to determine target count
    const itemResults = await collectResults(UnifiedTrackingDB.query`
      SELECT target_count FROM unified_tracking_items WHERE id = ${existingEntry["tracking_item_id"]}
    `);

    const targetCount = itemResults[0]?.["target_count"] || 1;
    const newCount = req.count !== undefined ? req.count : existingEntry["count"];
    const completed = newCount >= targetCount;

    const results = await collectResults(UnifiedTrackingDB.query`
      UPDATE unified_tracking_entries 
      SET 
        count = ${newCount},
        completed = ${completed},
        notes = ${req.notes || existingEntry["notes"]}
      WHERE id = ${req.id}
      RETURNING *
    `);

    return { entry: mapRowToEntry(results[0]) };
  }
);
