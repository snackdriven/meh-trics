import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ExternalLink } from "lucide-react";
import { DayView } from "./DayView";

interface DayViewModalProps {
  date: Date;
  onDateChange?: (date: Date) => void;
}

export function DayViewModal({ date, onDateChange }: DayViewModalProps) {
  const [open, setOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(date);

  const handleDateChange = (newDate: Date) => {
    setCurrentDate(newDate);
    onDateChange?.(newDate);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1"
      >
        <ExternalLink className="h-4 w-4" />
        Detailed View
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-hidden p-0">
          <DayView
            date={currentDate}
            onDateChange={handleDateChange}
            onClose={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}