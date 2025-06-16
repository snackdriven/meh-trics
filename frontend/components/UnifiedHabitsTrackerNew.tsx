import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Plus, Target, TrendingUp, Edit, Trash2, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "../hooks/useToast";
import { getAppDate } from "../lib/date";

// Unified Tracking Types (copied from backend)
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

export interface UnifiedTrackingStats {
  trackingItemId: number;
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  completionRate: number;
  averageCount: number;
  recentEntries: Array<{
    date: string;
    completed: boolean;
    count: number;
  }>;
}

// API base URL
const API_BASE = "http://127.0.0.1:4001";

export function UnifiedHabitsTrackerNew() {
  const [items, setItems] = useState<UnifiedTrackingItem[]>([]);
  const [todayEntries, setTodayEntries] = useState<Record<number, UnifiedTrackingEntry>>({});
  const [stats, setStats] = useState<Record<number, UnifiedTrackingStats>>({});
  const [loading, setLoading] = useState(true);  const [activeTab, setActiveTab] = useState<"today" | "all" | "stats">("today");
  const [typeFilter, setTypeFilter] = useState<"all" | "habit" | "routine">("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { showError, showSuccess } = useToast();
  const today = getAppDate();

  // Create new tracking item
  const [newItem, setNewItem] = useState({
    name: "",
    emoji: "🎯",
    description: "",
    type: "habit" as TrackingType,
    frequency: "daily" as TrackingFrequency,
    targetCount: 1,
    groupName: "",
  });

  useEffect(() => {
    loadItems();
    loadTodayEntries();
  }, []);

  const loadItems = async () => {
    try {
      const response = await fetch(`${API_BASE}/unified-tracking/items`);
      if (!response.ok) throw new Error("Failed to load items");
      const data = await response.json();
      setItems(data.items || []);
    } catch (error) {
      showError("Failed to load tracking items", "Loading Error");
      console.error("Error loading items:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadTodayEntries = async () => {
    try {
      const response = await fetch(`${API_BASE}/unified-tracking/entries?date=${today.toISOString().split('T')[0]}`);
      if (!response.ok) throw new Error("Failed to load entries");
      const data = await response.json();
      const entriesMap: Record<number, UnifiedTrackingEntry> = {};
      (data.entries || []).forEach((entry: UnifiedTrackingEntry) => {
        entriesMap[entry.trackingItemId] = entry;
      });
      setTodayEntries(entriesMap);
    } catch (error) {
      showError("Failed to load today's entries", "Loading Error");
      console.error("Error loading entries:", error);
    }
  };

  const loadStats = async (itemId: number) => {
    try {
      const response = await fetch(`${API_BASE}/unified-tracking/stats/${itemId}`);
      if (!response.ok) throw new Error("Failed to load stats");
      const data = await response.json();
      setStats(prev => ({ ...prev, [itemId]: data.stats }));
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const createItem = async () => {
    try {
      const response = await fetch(`${API_BASE}/unified-tracking/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newItem,
          startDate: today.toISOString(),
        }),
      });
      if (!response.ok) throw new Error("Failed to create item");
      const data = await response.json();
      setItems(prev => [data.item, ...prev]);
      setIsCreateDialogOpen(false);
      setNewItem({
        name: "",
        emoji: "🎯",
        description: "",
        type: "habit",
        frequency: "daily",
        targetCount: 1,
        groupName: "",
      });
      showSuccess("Tracking item created successfully! 🎯");
    } catch (error) {
      showError("Failed to create tracking item", "Creation Error");
      console.error("Error creating item:", error);
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

      if (completed) {
        showSuccess(`${item.name} completed! ${item.emoji}`);
      }
    } catch (error) {
      showError("Failed to update tracking entry", "Update Error");
      console.error("Error updating entry:", error);
    }
  };

  const deleteItem = async (itemId: number) => {
    try {
      const response = await fetch(`${API_BASE}/unified-tracking/items/${itemId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete item");
      setItems(prev => prev.filter(item => item.id !== itemId));
      showSuccess("Tracking item deleted successfully");
    } catch (error) {
      showError("Failed to delete tracking item", "Delete Error");
      console.error("Error deleting item:", error);
    }
  };
  const filteredItems = items.filter(item => {
    if (typeFilter !== "all" && item.type !== typeFilter) return false;
    return item.isActive;
  });

  const renderItemCard = (item: UnifiedTrackingItem) => {
    const entry = todayEntries[item.id];
    const currentCount = entry?.count || 0;
    const isCompleted = entry?.completed || false;
    const progress = (currentCount / item.targetCount) * 100;

    return (
      <Card key={item.id} className={`transition-all ${isCompleted ? "border-green-500 bg-green-50" : ""}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{item.emoji}</span>
              <div>
                <CardTitle className="text-lg">{item.name}</CardTitle>
                {item.description && (
                  <p className="text-sm text-gray-600">{item.description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={item.type === "habit" ? "default" : "secondary"}>
                {item.type}
              </Badge>
              <Badge variant="outline">{item.frequency}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{currentCount}/{item.targetCount}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    isCompleted ? "bg-green-500" : "bg-blue-500"
                  }`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                {item.type === "routine" ? (
                  <Button
                    size="sm"
                    onClick={() => updateEntry(item.id, isCompleted ? 0 : 1)}
                    variant={isCompleted ? "default" : "outline"}
                  >
                    <Check className="w-4 h-4 mr-1" />
                    {isCompleted ? "Done" : "Mark Done"}
                  </Button>
                ) : (
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateEntry(item.id, Math.max(0, currentCount - 1))}
                      disabled={currentCount <= 0}
                    >
                      -
                    </Button>
                    <span className="px-3 py-1 text-sm font-medium">{currentCount}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateEntry(item.id, currentCount + 1)}
                    >
                      +
                    </Button>
                  </div>
                )}
              </div>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => loadStats(item.id)}
                >
                  <TrendingUp className="w-4 h-4" />
                </Button>                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => console.log("Edit:", item)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteItem(item.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>            {/* Stats (if loaded) */}
            {stats[item.id] && (
              <div className="pt-2 border-t">
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="text-center">
                    <div className="font-medium">{stats[item.id]?.currentStreak || 0}</div>
                    <div className="text-gray-500">Current</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{stats[item.id]?.longestStreak || 0}</div>
                    <div className="text-gray-500">Best</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{Math.round((stats[item.id]?.completionRate || 0) * 100)}%</div>
                    <div className="text-gray-500">Rate</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Unified Tracking</h1>
          <p className="text-gray-600">Track all your habits and routines in one place</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Tracking Item</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newItem.name}
                  onChange={e => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Drink Water, Exercise, Read"
                />
              </div>
              <div>
                <Label htmlFor="emoji">Emoji</Label>
                <Input
                  id="emoji"
                  value={newItem.emoji}
                  onChange={e => setNewItem(prev => ({ ...prev, emoji: e.target.value }))}
                  placeholder="🎯"
                />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select value={newItem.type} onValueChange={(value: TrackingType) => setNewItem(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="habit">Habit</SelectItem>
                    <SelectItem value="routine">Routine</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="frequency">Frequency</Label>
                <Select value={newItem.frequency} onValueChange={(value: TrackingFrequency) => setNewItem(prev => ({ ...prev, frequency: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="routine">Routine</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="targetCount">Target Count</Label>
                <Input
                  id="targetCount"
                  type="number"
                  min="1"
                  value={newItem.targetCount}
                  onChange={e => setNewItem(prev => ({ ...prev, targetCount: parseInt(e.target.value) || 1 }))}
                />
              </div>
              <div>
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  value={newItem.description}
                  onChange={e => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description..."
                />
              </div>
              <Button onClick={createItem} className="w-full" disabled={!newItem.name}>
                Create Item
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="today">
            <Calendar className="w-4 h-4 mr-2" />
            Today
          </TabsTrigger>
          <TabsTrigger value="all">
            <Target className="w-4 h-4 mr-2" />
            All Items
          </TabsTrigger>
          <TabsTrigger value="stats">
            <TrendingUp className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <div className="flex gap-4 mt-4 mb-4">
          <Select value={typeFilter} onValueChange={(value: any) => setTypeFilter(value)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="habit">Habits Only</SelectItem>
              <SelectItem value="routine">Routines Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="today" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map(renderItemCard)}
          </div>
          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <Target className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tracking items</h3>
              <p className="text-gray-600 mb-4">Create your first habit or routine to get started</p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map(renderItemCard)}
          </div>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <div className="text-center py-12">
            <TrendingUp className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Coming Soon</h3>
            <p className="text-gray-600">Detailed analytics and insights for your tracking items</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
