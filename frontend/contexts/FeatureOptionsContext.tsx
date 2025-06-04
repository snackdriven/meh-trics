import { createContext, useContext, ReactNode } from "react";
import { useFeatureOptions, FeatureOptions } from "../hooks/useFeatureOptions";

interface FeatureOptionsContextValue {
  options: FeatureOptions;
  setOptions: React.Dispatch<React.SetStateAction<FeatureOptions>>;
}

const FeatureOptionsContext = createContext<FeatureOptionsContextValue | undefined>(undefined);

export function FeatureOptionsProvider({ children }: { children: ReactNode }) {
  const { options, setOptions } = useFeatureOptions();
  return (
    <FeatureOptionsContext.Provider value={{ options, setOptions }}>
      {children}
    </FeatureOptionsContext.Provider>
  );
}

export function useFeatureOptionsContext() {
  const ctx = useContext(FeatureOptionsContext);
  if (!ctx) throw new Error("useFeatureOptionsContext must be used within FeatureOptionsProvider");
  return ctx;
}
