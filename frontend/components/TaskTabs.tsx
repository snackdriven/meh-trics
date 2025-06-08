import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ReactNode } from "react";
import { RecurringTasksView } from "./RecurringTasksView";

interface TaskTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  tasksContent: ReactNode;
  historyContent: ReactNode;
}

export function TaskTabs({
  activeTab,
  onTabChange,
  tasksContent,
  historyContent,
}: TaskTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-6">
      <TabsList className="grid w-full grid-cols-3 mb-4">
        <TabsTrigger value="tasks">Tasks</TabsTrigger>
        <TabsTrigger value="recurring">Recurring</TabsTrigger>
        <TabsTrigger value="history">History</TabsTrigger>
      </TabsList>
      <TabsContent value="tasks">{tasksContent}</TabsContent>
      <TabsContent value="recurring">
        <RecurringTasksView />
      </TabsContent>
      <TabsContent value="history">{historyContent}</TabsContent>
    </Tabs>
  );
}
