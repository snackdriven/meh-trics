import { createContext, useContext, useState } from "react";

type PageKey = string;

interface EditModeContextValue {
  editModes: Record<PageKey, boolean>;
  toggleEditMode: (page: PageKey) => void;
  setEditMode: (page: PageKey, value: boolean) => void;
}

const EditModeContext = createContext<EditModeContextValue | undefined>(undefined);

export function EditModeProvider({ children }: { children: React.ReactNode }) {
  const [editModes, setEditModes] = useState<Record<PageKey, boolean>>({});

  const toggleEditMode = (page: PageKey) => {
    setEditModes(prev => ({ ...prev, [page]: !prev[page] }));
  };

  const setEditMode = (page: PageKey, value: boolean) => {
    setEditModes(prev => ({ ...prev, [page]: value }));
  };

  return (
    <EditModeContext.Provider value={{ editModes, toggleEditMode, setEditMode }}>
      {children}
    </EditModeContext.Provider>
  );
}

export function usePageEditMode(page: PageKey): [boolean, () => void] {
  const ctx = useContext(EditModeContext);
  if (!ctx) {
    throw new Error("usePageEditMode must be used within EditModeProvider");
  }
  const { editModes, toggleEditMode } = ctx;
  return [!!editModes[page], () => toggleEditMode(page)];
}
