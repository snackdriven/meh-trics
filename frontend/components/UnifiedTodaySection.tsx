import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Plus, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/useToast";
import { getAppDate } from "@/lib/date";

// Unified Tracking Types
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

interface UnifiedTodaySectionProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

const API_BASE = "http://127.0.0.1:4001";

export function UnifiedTodaySection({ collapsed = false, onToggleCollapse }: UnifiedTodaySectionProps) {
  const [items, setItems] = useState<UnifiedTrackingItem[]>([]);
  const [todayEntries, setTodayEntries] = useState<Record<number, UnifiedTrackingEntry>>({});
  const [loading, setLoading] = useState(true);

  const { showError, showSuccess } = useToast();
  const today = getAppDate();
  const dateStr = today.toISOString().split('T')[0];

  useEffect(() => {
    loadItemsAndEntries();
  }, []);

  const loadItemsAndEntries = async () => {
    try {
      setLoading(true);
      
      // Load active items
      const itemsResponse = await fetch(`${API_BASE}/unified-tracking/items`);
      if (!itemsResponse.ok) throw new Error("Failed to load items");
      const itemsData = await itemsResponse.json();
      const activeItems = (itemsData.items || []).filter((item: UnifiedTrackingItem) => item.isActive);
      setItems(activeItems);

      // Load today's entries
      const entriesResponse = await fetch(`${API_BASE}/unified-tracking/entries`);
      if (!entriesResponse.ok) throw new Error("Failed to load entries");
      const entriesData = await entriesResponse.json();
      
      // Filter today's entries and create map
      const todayEntriesMap: Record<number, UnifiedTrackingEntry> = {};
      (entriesData.entries || []).forEach((entry: UnifiedTrackingEntry) => {
        if (entry.date === dateStr) {
          todayEntriesMap[entry.trackingItemId] = entry;
        }
      });
      setTodayEntries(todayEntriesMap);
    } catch (error) {
      showError("Failed to load tracking data", "Loading Error");
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateEntry = async (itemId: number, count: number) => {
    const existingEntry = todayEntries[itemId];
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    const completed = count >= item.targetCount;

    try {
      if (existingEntry) {
        // Update existing entry
        const response = await fetch(`${API_BASE}/unified-tracking/entries/${existingEntry.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ count }),
        });
        if (!response.ok) throw new Error("Failed to update entry");
        const data = await response.json();
        setTodayEntries(prev => ({ ...prev, [itemId]: data.entry }));
      } else {
        // Create new entry
        const response = await fetch(`${API_BASE}/unified-tracking/entries`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            trackingItemId: itemId,
            date: today.toISOString(),
            count,
          }),
        });
        if (!response.ok) throw new Error("Failed to create entry");
        const data = await response.json();
        setTodayEntries(prev => ({ ...prev, [itemId]: data.entry }));
      }

      if (completed && !existingEntry?.completed) {
        showSuccess(`${item.name} completed! ${item.emoji}`);
      }
    } catch (error) {
      showError("Failed to update tracking entry", "Update Error");
      console.error("Error updating entry:", error);
    }
  };

  const completedCount = items.reduce((acc, item) => {
    const entry = todayEntries[item.id];
    return acc + (entry?.completed ? 1 : 0);
  }, 0);

  const completionRate = items.length > 0 ? (completedCount / items.length) * 100 : 0;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              🎯 Today's Tracking
              <Badge variant="outline" className="ml-2">
                {completedCount}/{items.length}
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-sm text-gray-600">
                {completionRate.toFixed(0)}% complete
              </span>
              <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-32">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="flex items-center gap-1"
          >
            {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </Button>
        </div>
      </CardHeader>
      
      {!collapsed && (
        <CardContent className="space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-4">No tracking items found</div>
              <Button size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add in Habits tab
              </Button>
            </div>
          ) : (
            items.map(item => {
              const entry = todayEntries[item.id];
              const currentCount = entry?.count || 0;
              const isCompleted = entry?.completed || false;
              const progress = (currentCount / item.targetCount) * 100;

              return (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    isCompleted ? "bg-green-50 border-green-200" : "bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{item.emoji}</span>
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={item.type === "habit" ? "default" : "secondary"} className="text-xs">
                          {item.type}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <span>{currentCount}/{item.targetCount}</span>
                          <div className="w-12 bg-gray-200 rounded-full h-1">
                            <div
                              className={`h-1 rounded-full transition-all ${
                                isCompleted ? "bg-green-500" : "bg-blue-500"
                              }`}
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {item.type === "routine" ? (
                      <Button
                        size="sm"
                        onClick={() => updateEntry(item.id, isCompleted ? 0 : 1)}
                        variant={isCompleted ? "default" : "outline"}
                        className="min-w-20"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        {isCompleted ? "Done" : "Mark"}
                      </Button>
                    ) : (
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateEntry(item.id, Math.max(0, currentCount - 1))}
                          disabled={currentCount <= 0}
                          className="w-8 h-8 p-0"
                        >
                          -
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">{currentCount}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateEntry(item.id, currentCount + 1)}
                          className="w-8 h-8 p-0"
                        >
                          +
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      )}
    </Card>
  );
}
