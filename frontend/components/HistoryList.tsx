import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Edit, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { JournalEntry } from "~backend/task/types";
import { LoadingSpinner } from "./LoadingSpinner";

interface HistoryListProps {
  entries: JournalEntry[];
  loading: boolean;
  onEdit: (entry: JournalEntry) => void;
  onDelete: (entry: JournalEntry) => void;
}

export function HistoryList({ entries, loading, onEdit, onDelete }: HistoryListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 text-gray-500 py-8">
        <LoadingSpinner />
        Loading history...
      </div>
    );
  }

  if (entries.length === 0) {
    return <div className="text-center py-8 text-gray-500">No journal entries found.</div>;
  }

  return (
    <div className="space-y-3">
      {entries.map((entry) => (
        <Card key={entry.id} className="p-4 bg-white/50">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {entry.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="text-xs bg-purple-50 text-purple-700 border-purple-200"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
              <span className="text-sm text-gray-500">
                {new Date(entry.date).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="prose prose-sm max-w-none text-gray-700">
              <ReactMarkdown>{entry.text}</ReactMarkdown>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="icon" onClick={() => onEdit(entry)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onDelete(entry)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
