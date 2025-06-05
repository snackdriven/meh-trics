import { EditableCopy } from "./EditableCopy";
import { Button } from "@/components/ui/button";
import { useCopyEdit } from "../contexts/CopyEditContext";

export function Dashboard() {
  const { editAll, setEditAll } = useCopyEdit();
  return (
    <div className="p-4 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
      <div className="flex justify-end mb-2">
        <Button variant="outline" size="sm" onClick={() => setEditAll(!editAll)}>
          {editAll ? "Done Editing" : "Edit Copy"}
        </Button>
      </div>
      <EditableCopy
        storageKey="dashboardCopy"
        defaultText="Welcome to your dashboard."
        className="text-lg text-center"
        as="p"
      />
    </div>
  );
}
