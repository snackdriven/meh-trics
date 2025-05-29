import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskManager } from "./components/TaskManager";
import { HabitTracker } from "./components/HabitTracker";
import { MoodTracker } from "./components/MoodTracker";
import { CheckSquare, Target, Heart } from "lucide-react";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Life Tracker
          </h1>
          <p className="text-gray-600">
            Manage your tasks, track your habits, and monitor your mood
          </p>
        </div>

        <Tabs defaultValue="tasks" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="habits" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Habits
            </TabsTrigger>
            <TabsTrigger value="mood" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Mood
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tasks">
            <TaskManager />
          </TabsContent>

          <TabsContent value="habits">
            <HabitTracker />
          </TabsContent>

          <TabsContent value="mood">
            <MoodTracker />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
