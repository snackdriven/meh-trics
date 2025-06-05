import { createContext, useContext, useState } from "react";

interface CopyEditContextValue {
  editAll: boolean;
  setEditAll: (value: boolean) => void;
}

const CopyEditContext = createContext<CopyEditContextValue | undefined>(undefined);

export function CopyEditProvider({ children }: { children: React.ReactNode }) {
  const [editAll, setEditAll] = useState(false);
  return (
    <CopyEditContext.Provider value={{ editAll, setEditAll }}>
      {children}
    </CopyEditContext.Provider>
  );
}

export function useCopyEdit() {
  const context = useContext(CopyEditContext);
  if (!context) {
    throw new Error("useCopyEdit must be used within a CopyEditProvider");
  }
  return context;
}
