import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar, Heart, Brain, CheckCircle, Target } from "lucide-react";
import { DayDetailDialog } from "./DayDetailDialog";
import backend from "~backend/client";
import type { Task, MoodEntry, JournalEntry, RoutineEntry, RoutineItem, HabitEntry, Habit } from "~backend/task/types";

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [routineEntries, setRoutineEntries] = useState<RoutineEntry[]>([]);
  const [routineItems, setRoutineItems] = useState<RoutineItem[]>([]);
  const [habitEntries, setHabitEntries] = useState<HabitEntry[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startOfCalendar = new Date(startOfMonth);
  startOfCalendar.setDate(startOfCalendar.getDate() - startOfCalendar.getDay());
  const endOfCalendar = new Date(endOfMonth);
  endOfCalendar.setDate(endOfCalendar.getDate() + (6 - endOfCalendar.getDay()));

  const loadData = async () => {
    try {
      const startDateStr = startOfCalendar.toISOString().split('T')[0];
      const endDateStr = endOfCalendar.toISOString().split('T')[0];

      const [tasksRes, moodRes, routineEntriesRes, routineItemsRes, habitEntriesRes, habitsRes] = await Promise.all([
        backend.task.listTasks(),
        backend.task.listMoodEntries({ startDate: startDateStr, endDate: endDateStr }),
        backend.task.listRoutineEntries({ startDate: startDateStr, endDate: endDateStr }),
        backend.task.listRoutineItems(),
        backend.task.listHabitEntries({ startDate: startDateStr, endDate: endDateStr }),
        backend.task.listHabits(),
      ]);

      setTasks(tasksRes.tasks);
      setMoodEntries(moodRes.entries);
      setRoutineEntries(routineEntriesRes.entries);
      setRoutineItems(routineItemsRes.items);
      setHabitEntries(habitEntriesRes.entries);
      setHabits(habitsRes.habits);
    } catch (error) {
      console.error("Failed to load calendar data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentDate]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getCalendarDays = () => {
    const days = [];
    const current = new Date(startOfCalendar);
    
    while (current <= endOfCalendar) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const getDayData = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    
    const dayTasks = tasks.filter(task => 
      task.dueDate && new Date(task.dueDate).toISOString().split('T')[0] === dateStr
    );
    
    const dayMood = moodEntries.find(entry => 
      new Date(entry.date).toISOString().split('T')[0] === dateStr
    );
    
    const dayRoutineEntries = routineEntries.filter(entry => 
      new Date(entry.date).toISOString().split('T')[0] === dateStr
    );
    
    const dayHabitEntries = habitEntries.filter(entry => 
      new Date(entry.date).toISOString().split('T')[0] === dateStr
    );
    
    const completedRoutines = dayRoutineEntries.filter(entry => entry.completed).length;
    const totalRoutines = routineItems.length;
    
    const completedHabits = dayHabitEntries.filter(entry => {
      const habit = habits.find(h => h.id === entry.habitId);
      return habit && entry.count >= habit.targetCount;
    }).length;
    const totalHabits = habits.length;
    
    return {
      tasks: dayTasks,
      mood: dayMood,
      routineProgress: totalRoutines > 0 ? completedRoutines / totalRoutines : 0,
      completedRoutines,
      totalRoutines,
      habitProgress: totalHabits > 0 ? completedHabits / totalHabits : 0,
      completedHabits,
      totalHabits,
      habitEntries: dayHabitEntries,
    };
  };

  const getMoodColor = (tier?: string) => {
    switch (tier) {
      case "uplifted": return "bg-yellow-200 border-yellow-400";
      case "neutral": return "bg-blue-200 border-blue-400";
      case "heavy": return "bg-gray-200 border-gray-400";
      default: return "bg-gray-100 border-gray-300";
    }
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const handleDayClick = (date: Date) => {
    if (isCurrentMonth(date)) {
      setSelectedDate(date);
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-white/70 backdrop-blur-sm">
        <CardContent className="p-8">
          <div className="text-center text-gray-500">Loading your calendar...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              Mood tracked
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Routines completed
            </div>
            <div className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              Habits completed
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Tasks due
            </div>
          </div>
          <p className="text-sm text-purple-600 font-medium">
            💡 Click on any day to view and edit details
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {getCalendarDays().map((date, index) => {
              const dayData = getDayData(date);
              const isCurrentMonthDay = isCurrentMonth(date);
              const isTodayDate = isToday(date);
              
              return (
                <div
                  key={index}
                  className={`min-h-[100px] p-2 border rounded-lg transition-all duration-200 cursor-pointer ${
                    isTodayDate 
                      ? "bg-purple-100 border-purple-400 shadow-md" 
                      : isCurrentMonthDay 
                        ? dayData.mood 
                          ? getMoodColor(dayData.mood.tier)
                          : "bg-white border-gray-200 hover:border-purple-300 hover:shadow-sm"
                        : "bg-gray-50 border-gray-100 cursor-default"
                  }`}
                  onClick={() => handleDayClick(date)}
                >
                  <div className={`text-sm font-medium mb-2 ${
                    isCurrentMonthDay ? "text-gray-900" : "text-gray-400"
                  }`}>
                    {date.getDate()}
                  </div>
                  
                  {isCurrentMonthDay && (
                    <div className="space-y-1">
                      {dayData.mood && (
                        <div className="flex items-center gap-1">
                          <span className="text-xs">{dayData.mood.emoji}</span>
                          <span className="text-xs text-gray-600 truncate">
                            {dayData.mood.label}
                          </span>
                        </div>
                      )}
                      
                      {dayData.totalRoutines > 0 && (
                        <div className="text-xs text-gray-600">
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            {dayData.completedRoutines}/{dayData.totalRoutines}
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                            <div 
                              className="bg-green-500 h-1 rounded-full transition-all duration-300"
                              style={{ width: `${dayData.routineProgress * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                      
                      {dayData.totalHabits > 0 && (
                        <div className="text-xs text-gray-600">
                          <div className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            {dayData.completedHabits}/{dayData.totalHabits}
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                            <div 
                              className="bg-purple-500 h-1 rounded-full transition-all duration-300"
                              style={{ width: `${dayData.habitProgress * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                      
                      {dayData.tasks.length > 0 && (
                        <div className="space-y-1">
                          {dayData.tasks.slice(0, 2).map((task) => (
                            <div key={task.id} className="text-xs">
                              <Badge 
                                variant="outline" 
                                className={`text-xs px-1 py-0 ${
                                  task.status === 'done' 
                                    ? 'bg-green-50 text-green-700 border-green-200' 
                                    : task.isHardDeadline
                                      ? 'bg-red-50 text-red-700 border-red-200'
                                      : 'bg-blue-50 text-blue-700 border-blue-200'
                                }`}
                              >
                                {task.title.length > 12 ? `${task.title.slice(0, 12)}...` : task.title}
                              </Badge>
                            </div>
                          ))}
                          {dayData.tasks.length > 2 && (
                            <div className="text-xs text-gray-500">
                              +{dayData.tasks.length - 2} more
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {selectedDate && (
        <DayDetailDialog
          date={selectedDate}
          open={!!selectedDate}
          onOpenChange={(open) => !open && setSelectedDate(null)}
          onDataUpdated={loadData}
        />
      )}
    </div>
  );
}
