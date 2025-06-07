import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Heart } from "lucide-react";
import { useToast } from "../hooks/useToast";
import { useMoodOptions } from "../hooks/useMoodOptions";
import { useAsyncOperation } from "../hooks/useAsyncOperation";
import { useCollapse } from "../hooks/useCollapse";
import { MoodEntry, MoodTier } from "~backend/task/types";
import backend from "~backend/client";
import { MoodEntry, MoodTier } from "~backend/task/types";
import { useAsyncOperation } from "../hooks/useAsyncOperation";
import { useMoodOptions } from "../hooks/useMoodOptions";
import { useToast } from "../hooks/useToast";
import { MoodEditorDialog } from "./MoodEditorDialog";

interface MoodSnapshotProps {
  onEntryChange?: (entry: MoodEntry | null) => void;
}

export function MoodSnapshot({ onEntryChange }: MoodSnapshotProps) {
  const { moodOptions } = useMoodOptions();
  const { showSuccess, showError } = useToast();
  const [entry, setEntry] = useState<MoodEntry | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const { collapsed, toggle } = useCollapse("today_mood");
  const today = new Date();
  const dateStr = today.toISOString().split("T")[0];

  const { loading, execute: loadEntry } = useAsyncOperation(async () => {
    const res = await backend.task.listMoodEntries({
      startDate: dateStr,
      endDate: dateStr,
    });
    const latest =
      res.entries.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )[0] || null;
    setEntry(latest);
    onEntryChange?.(latest);
    return latest;
  });

  const { execute: quickSave } = useAsyncOperation(
    async (tier: MoodTier, mood: { emoji: string; label: string }) => {
      const saved = await backend.task.createMoodEntry({
        date: today,
        tier,
        emoji: mood.emoji,
        label: mood.label,
      });
      setEntry(saved);
      onEntryChange?.(saved);
      return saved;
    },
    () => showSuccess("Mood saved"),
    (err) => showError(err, "Save Error"),
  );

  useEffect(() => {
    loadEntry();
  }, []);

  const renderPicker = () => (
    <div className="space-y-2">
      {Object.entries(moodOptions).map(([tier, options]) => (
        <div key={tier} className="grid grid-cols-7 gap-2">
          {options
            .filter((o) => !o.hidden)
            .map((opt) => (
              <Button
                key={opt.emoji}
                variant="outline"
                className="flex flex-col items-center gap-1 h-auto py-2"
                onClick={() => quickSave(tier as MoodTier, opt)}
                title={opt.description || opt.label}
              >
                <span className="text-lg">{opt.emoji}</span>
                <span className="text-xs">{opt.label}</span>
              </Button>
            ))}
        </div>
      ))}
    </div>
  );

  const renderSnapshot = () => (
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-3">
        <span className="text-3xl">{entry?.emoji}</span>
        <div>
          <span className="font-medium">{entry?.label}</span>
          {entry?.notes && (
            <p className="text-sm text-gray-600 mt-1">{entry.notes}</p>
          )}
        </div>
      </div>
      <Button size="sm" onClick={() => setEditorOpen(true)}>
        Edit Mood
      </Button>
    </div>
  );

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-4 w-4" /> Today's Mood
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={toggle}>
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </CardHeader>
      {!collapsed && (
        <CardContent className="space-y-4">
          {loading ? (
            <p className="text-center text-gray-500">Loading...</p>
          ) : entry ? (
            renderSnapshot()
          ) : (
            renderPicker()
          )}
        </CardContent>
      )}
      <MoodEditorDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        date={today}
        entry={entry}
        onSaved={(e) => setEntry(e)}
      />
    </Card>
  );
}
