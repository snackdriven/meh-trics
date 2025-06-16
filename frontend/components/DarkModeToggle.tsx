import { Switch } from "@/components/ui/switch";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../theme";

export function DarkModeToggle() {
  const { currentTheme, switchTheme } = useTheme();
  const isDark = currentTheme?.isDark || false;

  const handleToggle = (checked: boolean) => {
    const newThemeId = checked ? "default-dark" : "default-light";
    switchTheme(newThemeId);
  };

  return (
    <label className="flex items-center gap-2">
      <Sun className="h-4 w-4" />
      <Switch checked={isDark} onCheckedChange={handleToggle} />
      <Moon className="h-4 w-4" />
    </label>
  );
}
