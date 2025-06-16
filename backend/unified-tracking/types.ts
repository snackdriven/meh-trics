export type TrackingFrequency = "daily" | "weekly" | "monthly" | "routine";
export type TrackingType = "habit" | "routine";

/**
 * Unified tracking item that combines habits and routines
 */
export interface UnifiedTrackingItem {
  id: number;
  name: string;
  emoji: string;
  description?: string;
  type: TrackingType;
  frequency: TrackingFrequency;
  targetCount: number;
  groupName?: string;
  isActive: boolean;
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUnifiedTrackingItemRequest {
  name: string;
  emoji: string;
  description?: string;
  type: TrackingType;
  frequency: TrackingFrequency;
  targetCount?: number;
  groupName?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface UpdateUnifiedTrackingItemRequest {
  id: number;
  name?: string;
  emoji?: string;
  description?: string;
  frequency?: TrackingFrequency;
  targetCount?: number;
  groupName?: string;
  isActive?: boolean;
  startDate?: Date;
  endDate?: Date;
}

/**
 * Unified tracking entry for both habits and routines
 */
export interface UnifiedTrackingEntry {
  id: number;
  trackingItemId: number;
  date: Date;
  count: number;
  completed: boolean;
  notes?: string;
  createdAt: Date;
}

export interface CreateUnifiedTrackingEntryRequest {
  trackingItemId: number;
  date: Date;
  count?: number;
  notes?: string;
}

export interface UpdateUnifiedTrackingEntryRequest {
  id: number;
  count?: number;
  notes?: string;
}

/**
 * Unified stats for tracking items
 */
export interface UnifiedTrackingStats {
  trackingItemId: number;
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  completionRate: number;
  averageCount: number;
  recentEntries: Array<{
    date: Date;
    completed: boolean;
    count: number;
  }>;
}

export interface ListUnifiedTrackingItemsRequest {
  type?: TrackingType;
  frequency?: TrackingFrequency;
  isActive?: boolean;
  groupName?: string;
}

export interface ListUnifiedTrackingEntriesRequest {
  trackingItemId?: number;
  startDate?: Date;
  endDate?: Date;
  date?: Date;
}
