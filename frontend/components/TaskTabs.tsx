import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ReactNode } from "react";
import { RecurringTasksView } from "./RecurringTasksView";

interface TaskTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  tasksContent: ReactNode;
}

export function TaskTabs({
  activeTab,
  onTabChange,
  tasksContent,
}: TaskTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-6">
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="tasks">Tasks</TabsTrigger>
        <TabsTrigger value="recurring">Recurring</TabsTrigger>
      </TabsList>
      <TabsContent value="tasks">{tasksContent}</TabsContent>
      <TabsContent value="recurring">
        <RecurringTasksView />
      </TabsContent>
    </Tabs>
  );
}
