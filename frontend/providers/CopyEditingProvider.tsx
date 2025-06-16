import type { MoodOptions, TierInfo } from "@/constants/moods";
import type { UiText } from "@/constants/uiText";
import { useCopyEditing } from "@/hooks/useCopyEditing";
import { ReactNode, createContext, useContext } from "react";

interface CopyEditingContextType {
  moodOptions: MoodOptions;
  tierInfo: TierInfo;
  tags: string[];
  uiText: UiText;
  getText: (section: keyof UiText, key: string) => string;
}

const CopyEditingContext = createContext<CopyEditingContextType | undefined>(undefined);

interface CopyEditingProviderProps {
  children: ReactNode;
}

export function CopyEditingProvider({ children }: CopyEditingProviderProps) {
  const copyEditingData = useCopyEditing();

  return (
    <CopyEditingContext.Provider value={copyEditingData}>{children}</CopyEditingContext.Provider>
  );
}

export function useCopyEditingContext() {
  const context = useContext(CopyEditingContext);
  if (context === undefined) {
    throw new Error("useCopyEditingContext must be used within a CopyEditingProvider");
  }
  return context;
}
