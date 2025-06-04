import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDarkMode } from "../hooks/useDarkMode";

export function DarkModeToggle() {
  const { theme, toggleTheme } = useDarkMode();
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleTheme}
      className="bg-white/50 hover:bg-white/80 border-purple-200"
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
