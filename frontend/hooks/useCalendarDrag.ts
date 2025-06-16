import { useState } from "react";

export function useCalendarDrag<T>() {
  const [dragItem, setDragItem] = useState<T | null>(null);

  const handleDragStart = (item: T) => setDragItem(item);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDragEnd = () => setDragItem(null);

  const handleDrop = (target: (item: T | null) => void) => {
    if (dragItem) {
      target(dragItem);
      setDragItem(null);
    }
  };

  return {
    dragItem,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
  };
}
