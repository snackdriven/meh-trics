import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import backend from "~backend/client";
import type { RoutineItem, RoutineEntry } from "~backend/task/types";

export function RoutineTracker() {
  const [routineItems, setRoutineItems] = useState<RoutineItem[]>([]);
  const [routineEntries, setRoutineEntries] = useState<Record<number, RoutineEntry>>({});
  const [isLoading, setIsLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];

  const loadData = async () => {
    try {
      const [itemsResponse, entriesResponse] = await Promise.all([
        backend.task.listRoutineItems(),
        backend.task.listRoutineEntries({ date: today }),
      ]);
      
      setRoutineItems(itemsResponse.items);
      
      const entriesMap: Record<number, RoutineEntry> = {};
      entriesResponse.entries.forEach(entry => {
        entriesMap[entry.routineItemId] = entry;
      });
      setRoutineEntries(entriesMap);
    } catch (error) {
      console.error("Failed to load routine data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleRoutineItem = async (itemId: number, completed: boolean) => {
    try {
      const entry = await backend.task.createRoutineEntry({
        routineItemId: itemId,
        date: new Date(today),
        completed,
      });
      
      setRoutineEntries(prev => ({
        ...prev,
        [itemId]: entry,
      }));
    } catch (error) {
      console.error("Failed to update routine entry:", error);
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-white/70 backdrop-blur-sm">
        <CardContent className="p-8">
          <div className="text-center text-gray-500">Loading your routine...</div>
        </CardContent>
      </Card>
    );
  }

  const completedCount = Object.values(routineEntries).filter(entry => entry.completed).length;
  const totalCount = routineItems.length;

  return (
    <div className="space-y-6">
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Gentle routine check-in ✨
          </CardTitle>
          <p className="text-center text-gray-600">
            {completedCount} of {totalCount} soft habits tended to today
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {routineItems.map((item) => {
              const entry = routineEntries[item.id];
              const isCompleted = entry?.completed || false;
              
              return (
                <div 
                  key={item.id} 
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 ${
                    isCompleted 
                      ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200" 
                      : "bg-white/50 border-gray-200 hover:border-purple-300"
                  }`}
                >
                  <Checkbox
                    checked={isCompleted}
                    onCheckedChange={(checked) => toggleRoutineItem(item.id, !!checked)}
                    className="h-5 w-5"
                  />
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-2xl">{item.emoji}</span>
                    <span className={`font-medium ${isCompleted ? "text-green-800" : "text-gray-700"}`}>
                      {item.name}
                    </span>
                  </div>
                  {isCompleted && (
                    <span className="text-green-600 text-sm font-medium">
                      ✓ Done
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          
          {completedCount === totalCount && totalCount > 0 && (
            <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl text-center">
              <span className="text-2xl">🎉</span>
              <p className="text-yellow-800 font-medium mt-2">
                You've tended to all your soft habits today! Your future self is grateful. 💛
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
