import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Target, Repeat } from "lucide-react";
import { HabitTracker } from "./HabitTracker";
import { RoutineTracker } from "./RoutineTracker";

export function UnifiedHabitsTrackerSimple() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Habits & Routines</h1>
          <p className="text-gray-600">Track your daily habits and routines in one place</p>
        </div>
      </div>

      <Tabs defaultValue="habits" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="habits">
            <Target className="w-4 h-4 mr-2" />
            Habits
          </TabsTrigger>
          <TabsTrigger value="routines">
            <Repeat className="w-4 h-4 mr-2" />
            Routines
          </TabsTrigger>
        </TabsList>

        <TabsContent value="habits" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Habit Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <HabitTracker />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="routines" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Repeat className="w-5 h-5" />
                Routine Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RoutineTracker />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
