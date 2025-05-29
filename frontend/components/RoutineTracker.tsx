import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar, History, Search, Filter } from "lucide-react";
import backend from "~backend/client";
import type { RoutineItem, RoutineEntry } from "~backend/task/types";

export function RoutineTracker() {
  const [routineItems, setRoutineItems] = useState<RoutineItem[]>([]);
  const [routineEntries, setRoutineEntries] = useState<Record<number, RoutineEntry>>({});
  const [historicalEntries, setHistoricalEntries] = useState<RoutineEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchDate, setSearchDate] = useState("");
  const [completionFilter, setCompletionFilter] = useState<"all" | "completed" | "incomplete">("all");

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
    }
  };

  const loadHistoricalEntries = async () => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const response = await backend.task.listRoutineEntries({
        startDate: thirtyDaysAgo.toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
      });
      
      setHistoricalEntries(response.entries);
    } catch (error) {
      console.error("Failed to load historical entries:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    loadHistoricalEntries();
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

      // Reload historical entries to include the new/updated entry
      loadHistoricalEntries();
    } catch (error) {
      console.error("Failed to update routine entry:", error);
    }
  };

  const getRoutineItemName = (itemId: number) => {
    const item = routineItems.find(item => item.id === itemId);
    return item ? `${item.emoji} ${item.name}` : "Unknown routine";
  };

  const filteredHistoricalEntries = historicalEntries.filter(entry => {
    const matchesDate = searchDate === "" || 
      new Date(entry.date).toISOString().split('T')[0] === searchDate;
    
    const matchesCompletion = completionFilter === "all" ||
      (completionFilter === "completed" && entry.completed) ||
      (completionFilter === "incomplete" && !entry.completed);
    
    return matchesDate && matchesCompletion;
  });

  // Group historical entries by date
  const groupedEntries = filteredHistoricalEntries.reduce((acc, entry) => {
    const dateStr = new Date(entry.date).toISOString().split('T')[0];
    if (!acc[dateStr]) {
      acc[dateStr] = [];
    }
    acc[dateStr].push(entry);
    return acc;
  }, {} as Record<string, RoutineEntry[]>);

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
            Low-bar, high-context habits. Not about productivity. Just keeping your soft systems running.
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="today" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="today" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Today's Routine
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="today" className="space-y-6">
              <div className="text-center">
                <p className="text-gray-600">
                  {completedCount} of {totalCount} soft habits tended to today
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
                  />
                </div>
              </div>

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
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="date"
                        placeholder="Search by date..."
                        value={searchDate}
                        onChange={(e) => setSearchDate(e.target.value)}
                        className="pl-10 bg-white/50"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <span className="text-sm font-medium">Filter:</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant={completionFilter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCompletionFilter("all")}
                  >
                    All
                  </Button>
                  <Button
                    variant={completionFilter === "completed" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCompletionFilter("completed")}
                    className={completionFilter === "completed" ? "bg-purple-600 hover:bg-purple-700" : ""}
                  >
                    Completed
                  </Button>
                  <Button
                    variant={completionFilter === "incomplete" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCompletionFilter("incomplete")}
                    className={completionFilter === "incomplete" ? "bg-purple-600 hover:bg-purple-700" : ""}
                  >
                    Incomplete
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {Object.keys(groupedEntries).length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No routine entries found for the selected filter.</p>
                  </div>
                ) : (
                  Object.entries(groupedEntries)
                    .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
                    .map(([date, entries]) => {
                      const completedEntries = entries.filter(e => e.completed);
                      const completionRate = entries.length > 0 ? (completedEntries.length / entries.length) * 100 : 0;
                      
                      return (
                        <Card key={date} className="p-4 bg-white/50">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium">
                                {new Date(date).toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </h3>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">
                                  {completedEntries.length}/{entries.length} completed
                                </span>
                                <Badge 
                                  variant="outline" 
                                  className={
                                    completionRate === 100 
                                      ? "bg-green-50 text-green-700 border-green-200"
                                      : completionRate >= 50
                                        ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                        : "bg-red-50 text-red-700 border-red-200"
                                  }
                                >
                                  {Math.round(completionRate)}%
                                </Badge>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {entries.map((entry) => (
                                <div 
                                  key={entry.id} 
                                  className={`flex items-center gap-2 p-2 rounded-lg ${
                                    entry.completed 
                                      ? "bg-green-50 text-green-800" 
                                      : "bg-gray-50 text-gray-600"
                                  }`}
                                >
                                  <span className={entry.completed ? "✓" : "○"} />
                                  <span className="text-sm">{getRoutineItemName(entry.routineItemId)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </Card>
                      );
                    })
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
