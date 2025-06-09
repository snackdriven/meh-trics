import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReactNode } from "react";
import type { TabPref } from "./EditTabsDialog";

interface LayoutProps {
  tabOrder: string[];
  tabPrefs: Record<string, TabPref>;
  activeTab: string;
  onTabChange: (tab: string) => void;
  children: ReactNode;
}

export function Layout({
  tabOrder,
  tabPrefs,
  activeTab,
  onTabChange,
  children,
}: LayoutProps) {
  return (
    <Tabs
      value={activeTab}
      onValueChange={onTabChange}
      className="flex min-h-screen bg-background text-foreground"
    >
      <aside className="w-48 shrink-0 border-r border-sidebar-border bg-sidebar p-4">
        <h1 className="mb-6 text-xl font-bold">meh-trics</h1>
        <TabsList className="flex flex-col gap-2">
          {tabOrder.map((key) => (
            <TabsTrigger key={key} value={key} className="justify-start">
              <span className="mr-2">{tabPrefs[key].emoji}</span>
              {tabPrefs[key].label}
            </TabsTrigger>
          ))}
        </TabsList>
      </aside>
      <main className="flex-1 p-6 overflow-y-auto">{children}</main>
    </Tabs>
  );
}
