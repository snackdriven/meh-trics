import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PulseCheck } from "./components/PulseCheck";
import { MomentMarker } from "./components/MomentMarker";
import { RoutineTracker } from "./components/RoutineTracker";
import { TaskTracker } from "./components/TaskTracker";
import { CalendarView } from "./components/CalendarView";
import { Brain, Heart, CheckCircle, List, Calendar } from "lucide-react";

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
            🧠 Second Braincell
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Your neurodivergent-first daily companion for moods, moments, and gentle productivity
          </p>
        </div>

        <Tabs defaultValue="pulse" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
            <TabsTrigger value="pulse" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Pulse
            </TabsTrigger>
            <TabsTrigger value="moment" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Moment
            </TabsTrigger>
            <TabsTrigger value="routine" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Routine
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Calendar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pulse">
            <PulseCheck />
          </TabsContent>

          <TabsContent value="moment">
            <MomentMarker />
          </TabsContent>

          <TabsContent value="routine">
            <RoutineTracker />
          </TabsContent>

          <TabsContent value="tasks">
            <TaskTracker />
          </TabsContent>

          <TabsContent value="calendar">
            <CalendarView />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
