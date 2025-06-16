/**
 * Temporary unified tracking service wrapper
 * TODO: Remove this when unified-tracking is added to the main backend client
 */

// Re-use types from the component
export type TrackingFrequency = "daily" | "weekly" | "monthly" | "routine";
export type TrackingType = "habit" | "routine";

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
  startDate: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UnifiedTrackingEntry {
  id: number;
  trackingItemId: number;
  date: string;
  count: number;
  completed: boolean;
  notes?: string;
  createdAt: string;
}

const API_BASE = "http://localhost:4000"; // Use proper backend port

class UnifiedTrackingService {
  async listItems(): Promise<{ items: UnifiedTrackingItem[] }> {
    const response = await fetch(`${API_BASE}/unified-tracking/items`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to list items: ${response.statusText}`);
    }
    
    return response.json();
  }

  async createItem(item: Omit<UnifiedTrackingItem, "id" | "createdAt" | "updatedAt">): Promise<UnifiedTrackingItem> {
    const response = await fetch(`${API_BASE}/unified-tracking/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create item: ${response.statusText}`);
    }
    
    return response.json();
  }

  async updateItem(id: number, updates: Partial<UnifiedTrackingItem>): Promise<UnifiedTrackingItem> {
    const response = await fetch(`${API_BASE}/unified-tracking/items/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update item: ${response.statusText}`);
    }
    
    return response.json();
  }

  async deleteItem(id: number): Promise<void> {
    const response = await fetch(`${API_BASE}/unified-tracking/items/${id}`, {
      method: "DELETE",
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete item: ${response.statusText}`);
    }
  }

  async listEntries(date: string): Promise<{ entries: UnifiedTrackingEntry[] }> {
    const response = await fetch(`${API_BASE}/unified-tracking/entries?date=${date}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to list entries: ${response.statusText}`);
    }
    
    return response.json();
  }

  async createEntry(entry: Omit<UnifiedTrackingEntry, "id" | "createdAt">): Promise<UnifiedTrackingEntry> {
    const response = await fetch(`${API_BASE}/unified-tracking/entries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create entry: ${response.statusText}`);
    }
    
    return response.json();
  }

  async updateEntry(id: number, updates: Partial<UnifiedTrackingEntry>): Promise<UnifiedTrackingEntry> {
    const response = await fetch(`${API_BASE}/unified-tracking/entries/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update entry: ${response.statusText}`);
    }
    
    return response.json();
  }

  async deleteEntry(id: number): Promise<void> {
    const response = await fetch(`${API_BASE}/unified-tracking/entries/${id}`, {
      method: "DELETE",
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete entry: ${response.statusText}`);
    }
  }
}

export const unifiedTrackingService = new UnifiedTrackingService();