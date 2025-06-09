import { useState } from "react";

const STORAGE_KEY = "userName";

export function useUserName() {
  const [name, setNameState] = useState(() => {
    if (typeof localStorage === "undefined") return "";
    return localStorage.getItem(STORAGE_KEY) || "";
  });

  const setName = (newName: string) => {
    setNameState(newName);
    try {
      localStorage.setItem(STORAGE_KEY, newName);
    } catch {
      // ignore
    }
  };

  return { name, setName };
}
