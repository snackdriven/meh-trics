import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export function DarkModeToggle() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const preference = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setEnabled(preference === "dark" || (!preference && systemPrefersDark));
  }, []);

  useEffect(() => {
    if (enabled) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [enabled]);

  return (
    <label className="flex items-center gap-2">
      <Sun className="h-4 w-4" />
      <Switch checked={enabled} onCheckedChange={setEnabled} />
      <Moon className="h-4 w-4" />
    </label>
  );
}
