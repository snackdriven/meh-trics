import { api } from "encore.dev/api";
import { UnifiedTrackingDB } from "./db";
import { habitDB } from "../habits/db";
import { taskDB } from "../task/db";

// Migration endpoint to populate unified tracking from existing data
export const migrateExistingData = api(
  { method: "POST", path: "/unified-tracking/migrate" },
  async (): Promise<{ 
    message: string; 
    migratedHabits: number; 
    migratedRoutines: number;
    migratedHabitEntries: number;
    migratedRoutineEntries: number;
  }> => {
    let migratedHabits = 0;
    let migratedRoutines = 0;
    let migratedHabitEntries = 0;
    let migratedRoutineEntries = 0;

    try {
      // First, migrate habits
      const habits: any[] = [];
      for await (const habit of habitDB.query`
        SELECT id, name, emoji, description, frequency, target_count, start_date, end_date, created_at
        FROM habits
        ORDER BY id
      `) {
        habits.push(habit);
      }

      const habitIdMapping = new Map<number, number>();

      for (const habit of habits) {
        const unifiedResults: any[] = [];        for await (const result of UnifiedTrackingDB.query`
          INSERT INTO unified_tracking_items 
          (name, emoji, description, type, frequency, target_count, group_name, start_date, end_date, is_active, created_at, updated_at)
          VALUES (
            ${habit.name},
            ${habit.emoji || '📝'},
            ${habit.description},
            'habit',
            ${habit.frequency},
            ${habit.target_count},
            NULL,
            ${habit.start_date},
            ${habit.end_date},
            ${habit.end_date == null || new Date(habit.end_date) >= new Date()},
            ${habit.created_at},
            ${habit.created_at}
          )
          RETURNING id
        `) {
          unifiedResults.push(result);
        }

        if (unifiedResults.length > 0) {
          habitIdMapping.set(habit.id, unifiedResults[0].id);
          migratedHabits++;
        }
      }

      // Migrate habit entries
      const habitEntries: any[] = [];
      for await (const entry of habitDB.query`
        SELECT habit_id, date, count, notes, created_at
        FROM habit_entries
        ORDER BY created_at
      `) {
        habitEntries.push(entry);
      }

      for (const entry of habitEntries) {
        const unifiedId = habitIdMapping.get(entry.habit_id);
        if (unifiedId) {
          // Get target count to determine completion
          const targetResults: any[] = [];
          for await (const result of UnifiedTrackingDB.query`
            SELECT target_count FROM unified_tracking_items WHERE id = ${unifiedId}
          `) {
            targetResults.push(result);
          }
          const targetCount = targetResults[0]?.target_count || 1;
          const completed = entry.count >= targetCount;

          for await (const _ of UnifiedTrackingDB.query`
            INSERT INTO unified_tracking_entries 
            (tracking_item_id, date, count, completed, notes, created_at)
            VALUES (${unifiedId}, ${entry.date}, ${entry.count}, ${completed}, ${entry.notes}, ${entry.created_at})
            ON CONFLICT (tracking_item_id, date) DO NOTHING
          `) {
            // Query executed
          }
          migratedHabitEntries++;
        }
      }

      // Now migrate routine items
      const routines: any[] = [];
      for await (const routine of taskDB.query`
        SELECT id, name, emoji, is_active, group_name, created_at
        FROM routine_items
        ORDER BY id
      `) {
        routines.push(routine);
      }

      const routineIdMapping = new Map<number, number>();

      for (const routine of routines) {
        const unifiedResults: any[] = [];        for await (const result of UnifiedTrackingDB.query`
          INSERT INTO unified_tracking_items 
          (name, emoji, description, type, frequency, target_count, group_name, start_date, end_date, is_active, created_at, updated_at)
          VALUES (
            ${routine.name},
            ${routine.emoji},
            NULL,
            'routine',
            'daily',
            1,
            ${routine.group_name},
            ${new Date()},
            NULL,
            ${routine.is_active},
            ${routine.created_at},
            ${routine.created_at}
          )
          RETURNING id
        `) {
          unifiedResults.push(result);
        }

        if (unifiedResults.length > 0) {
          routineIdMapping.set(routine.id, unifiedResults[0].id);
          migratedRoutines++;
        }
      }

      // Migrate routine entries
      const routineEntries: any[] = [];
      for await (const entry of taskDB.query`
        SELECT routine_item_id, date, completed, created_at
        FROM routine_entries
        ORDER BY created_at
      `) {
        routineEntries.push(entry);
      }

      for (const entry of routineEntries) {
        const unifiedId = routineIdMapping.get(entry.routine_item_id);
        if (unifiedId) {
          const count = entry.completed ? 1 : 0;

          for await (const _ of UnifiedTrackingDB.query`
            INSERT INTO unified_tracking_entries 
            (tracking_item_id, date, count, completed, notes, created_at)
            VALUES (${unifiedId}, ${entry.date}, ${count}, ${entry.completed}, NULL, ${entry.created_at})
            ON CONFLICT (tracking_item_id, date) DO NOTHING
          `) {
            // Query executed
          }
          migratedRoutineEntries++;
        }
      }

      return {
        message: "Migration completed successfully",
        migratedHabits,
        migratedRoutines,
        migratedHabitEntries,
        migratedRoutineEntries,
      };

    } catch (error) {
      throw new Error(`Migration failed: ${error}`);
    }
  }
);
