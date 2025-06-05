import { EditableCopy } from "./EditableCopy";

export function Dashboard() {
  return (
    <div className="p-4 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
      <EditableCopy
        storageKey="dashboardCopy"
        defaultText="Welcome to your dashboard."
        className="text-lg text-center"
        as="p"
      />
    </div>
  );
}
