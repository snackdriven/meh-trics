import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { TabPref } from "./EditTabsDialog";
import React from "react";

interface GlobalSidebarProps {
  order: string[];
  prefs: Record<string, TabPref>;
  onDragStart: (key: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (key: string) => void;
  onDragEnd: () => void;
}

export function GlobalSidebar({ order, prefs, onDragStart, onDragOver, onDrop, onDragEnd }: GlobalSidebarProps) {
  return (
    <aside className="hidden lg:block w-48 pr-4">
      <TabsList className="flex flex-col gap-1 bg-sidebar/70 dark:bg-sidebar border border-sidebar-border rounded-lg p-2">
        {order.map(key => (
          <TabsTrigger
            key={key}
            value={key}
            className="justify-start"
            draggable
            onDragStart={() => onDragStart(key)}
            onDragOver={onDragOver}
            onDrop={() => onDrop(key)}
            onDragEnd={onDragEnd}
          >
            <span className="mr-2">{prefs[key].emoji}</span>
            {prefs[key].label}
          </TabsTrigger>
        ))}
      </TabsList>
    </aside>
  );
}
