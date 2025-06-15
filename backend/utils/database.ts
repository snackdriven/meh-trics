/**
 * Type-safe database query utilities for Encore.dev
 * 
 * This module provides enhanced type safety for database operations,
 * leveraging Encore's capabilities while adding additional compile-time
 * guarantees for query parameters and result types.
 */

import type { SQLDatabase } from "encore.dev/storage/sqldb";

/**
 * Base interface for all database row types
 */
export interface BaseRow {
  id: number;
  created_at: Date;
  updated_at: Date;
}

/**
 * Type-safe query builder for common database operations
 */
export class TypeSafeQuery<TRow extends BaseRow> {
  constructor(
    private db: SQLDatabase,
    private tableName: string
  ) {}

  /**
   * Type-safe SELECT query with proper return type inference
   */
  async findById<T extends TRow>(id: number): Promise<T | null> {
    return await this.db.queryRow<T>`
      SELECT * FROM ${this.tableName} WHERE id = ${id}
    `;
  }

  /**
   * Type-safe SELECT query with filtering
   */
  async findWhere<T extends TRow>(
    conditions: Partial<Record<keyof T, any>>
  ): Promise<T[]> {
    const whereClause = Object.entries(conditions)
      .map(([key, value]) => `${String(key)} = ${value}`)
      .join(' AND ');
    
    return await this.db.queryAll<T>`
      SELECT * FROM ${this.tableName} 
      WHERE ${whereClause}
    `;
  }

  /**
   * Type-safe INSERT with return type inference
   */
  async insert<T extends TRow>(
    data: Omit<T, 'id' | 'created_at' | 'updated_at'>
  ): Promise<T> {
    const columns = Object.keys(data).join(', ');
    const values = Object.values(data);
    const placeholders = values.map(() => '?').join(', ');

    const result = await this.db.queryRow<T>`
      INSERT INTO ${this.tableName} (${columns})
      VALUES (${placeholders})
      RETURNING *
    `;

    if (!result) {
      throw new Error(`Failed to insert record into ${this.tableName}`);
    }

    return result;
  }

  /**
   * Type-safe UPDATE with return type inference
   */
  async update<T extends TRow>(
    id: number,
    data: Partial<Omit<T, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<T> {
    const setClause = Object.entries(data)
      .map(([key, value]) => `${key} = ${value}`)
      .join(', ');

    const result = await this.db.queryRow<T>`
      UPDATE ${this.tableName} 
      SET ${setClause}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (!result) {
      throw new Error(`Failed to update record with id ${id} in ${this.tableName}`);
    }

    return result;
  }

  /**
   * Type-safe soft delete
   */
  async softDelete<T extends TRow & { archived_at?: Date }>(id: number): Promise<T> {
    const result = await this.db.queryRow<T>`
      UPDATE ${this.tableName} 
      SET archived_at = NOW(), updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (!result) {
      throw new Error(`Failed to archive record with id ${id} in ${this.tableName}`);
    }

    return result;
  }
}

/**
 * Enhanced database query helpers with validation
 */
export class ValidatedQuery<TRow extends BaseRow> extends TypeSafeQuery<TRow> {
  constructor(
    db: SQLDatabase,
    tableName: string,
    private validator?: (data: unknown) => boolean
  ) {
    super(db, tableName);
  }

  /**
   * INSERT with validation
   */
  async insertWithValidation<T extends TRow>(
    data: Omit<T, 'id' | 'created_at' | 'updated_at'>
  ): Promise<T> {
    if (this.validator && !this.validator(data)) {
      throw new Error('Data validation failed');
    }
    return await this.insert<T>(data);
  }

  /**
   * UPDATE with validation
   */
  async updateWithValidation<T extends TRow>(
    id: number,
    data: Partial<Omit<T, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<T> {
    if (this.validator && !this.validator(data)) {
      throw new Error('Data validation failed');
    }
    return await this.update<T>(id, data);
  }
}

/**
 * Factory function to create type-safe query builders
 */
export function createTypeSafeQuery<TRow extends BaseRow>(
  db: SQLDatabase,
  tableName: string
): TypeSafeQuery<TRow> {
  return new TypeSafeQuery<TRow>(db, tableName);
}

/**
 * Factory function to create validated query builders
 */
export function createValidatedQuery<TRow extends BaseRow>(
  db: SQLDatabase,
  tableName: string,
  validator?: (data: any) => boolean
): ValidatedQuery<TRow> {
  return new ValidatedQuery<TRow>(db, tableName, validator);
}

/**
 * Common query patterns with type safety
 */
export const QueryPatterns = {
  /**
   * Find active (non-archived) records
   */
  findActive: <T extends BaseRow & { archived_at?: Date }>(
    db: SQLDatabase,
    tableName: string
  ) => {
    return db.queryAll<T>`
      SELECT * FROM ${tableName} 
      WHERE archived_at IS NULL 
      ORDER BY created_at DESC
    `;
  },

  /**
   * Find records created within date range
   */
  findByDateRange: <T extends BaseRow>(
    db: SQLDatabase,
    tableName: string,
    startDate: Date,
    endDate: Date
  ) => {
    return db.queryAll<T>`
      SELECT * FROM ${tableName}
      WHERE created_at >= ${startDate} 
        AND created_at <= ${endDate}
      ORDER BY created_at DESC
    `;
  },

  /**
   * Count records with conditions
   */
  countWhere: async (
    db: SQLDatabase,
    tableName: string,
    conditions: Record<string, unknown>
  ): Promise<number> => {
    const whereClause = Object.entries(conditions)
      .map(([key, value]) => `${key} = ${value}`)
      .join(' AND ');

    const result = await db.queryRow<{ count: number }>`
      SELECT COUNT(*) as count FROM ${tableName}
      WHERE ${whereClause}
    `;

    return result?.count || 0;
  }
};